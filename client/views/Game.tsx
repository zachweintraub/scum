import React, { FC, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../contexts/Player";
import { useMutation, useQuery } from "@apollo/client";
import { Card, GetGameResponse, GET_GAME } from "../queries/getGame";
import { SUBSCRIBE_TO_GAME } from "../subscriptions/game";
import { Portal } from "./Portal";
import { PlayerHand } from "../components/PlayerHand";
import { PlayingCard } from "../components/PlayingCard";
import { PlayTurnArgs, PLAY_TURN } from "../mutations/playTurn";
import { OtherPlayerHand, OtherPlayers } from "../components/OtherPlayers";
import { StartGameArgs, StartGameResponse, START_GAME } from "../mutations/startGame";
import { ActionLog } from "../components/ActionLog";
import { StartRoundArgs, StartRoundResponse, START_ROUND } from "../mutations/startRound";
import { PassCardsResponse, PASS_CARDS } from "../mutations/passCards";
import { PassCardsArgs } from "../../server/schema/mutation/passCards";

/**
 * TODO: Idea for pausing on cards played before clearing the active pile...
 * Use the subscribe to more function to check whether the pile was cleared and if so...
 * ...take the last turn played and display it as the active pile for a fixed number of seconds
 */

type GameViewParams = {
  gameId?: string;
};

export const Game: FC = () => {

  // Pull the game ID out of the URL
  const { gameId } = useParams<GameViewParams>();

  // Bring in the contexts we need
  const playerContext = useContext(PlayerContext);
  //const apolloClientContext = useContext(ApolloClientContext);

  // Query for the whole game
  const { subscribeToMore, data, loading: gameDataLoading, error: gameDataError } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
    variables: {
      id: gameId!,
    },
  });
  
  // Set up the mutation to start the game
  const [startGame, { loading: startGameLoading, error: startGameError }] = useMutation<StartGameResponse, StartGameArgs>(START_GAME);

  // Set up the mutatiomn to start a new round
  const [startRound, { loading: startRoundLoading, error: startRoundError }] = useMutation<StartRoundResponse, StartRoundArgs>(START_ROUND);
  
  // Set up the mutation that allows a player to play their turn
  const [playTurn, { loading: playTurnLoading, error: playTurnError }] = useMutation<boolean, PlayTurnArgs>(PLAY_TURN);

  // Set up the mutation that allows one player to pass cards to another
  const [passCards, { loading: passCardsLoading, error: passCardsError }] = useMutation<PassCardsResponse, PassCardsArgs>(PASS_CARDS);

  // Prompt player info if none exists
  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }
  
  // Initiate subscription to the game
  subscribeToMore({
    document: SUBSCRIBE_TO_GAME,
    variables: { id: gameId },
  });

  // Flag to determine whether the game has started
  const gameHasStarted = !!data?.game.startedAt;

  // This is the current active round pulled from the game
  const activeRound = data?.game.rounds?.find(r => r.isActive);

  // This is the hand of the logged in player
  const playerHand = activeRound?.hands.find(h => h.playerId === playerContext?.player?.id);

  // True if the player owes high cards
  const isPassingHighCards = !playerHand?.readyToPlay
    && activeRound
    && !!playerHand?.startRank
    // This part means they are ranked below the mid-point (higher number = worse rank)
    && playerHand.startRank >= Math.max(activeRound.hands.length / 2);

  // These objects represent the hands of the other players
  // Needs a refactor to loop over hands rather than players to ensure the order looks right
  const otherPlayers = (): OtherPlayerHand[] => {
    let playerHands: OtherPlayerHand[] = [];
    if (data?.game.players) {
      for (const player of data.game.players) {
          const playerHand = activeRound?.hands.find(hand => hand.playerId === player.id);
          const playerName = player.name;
          playerHands.push({
            playerName,
            cardsRemaining: playerHand?.cards.length,
            isActive: playerHand?.isActive,
            hasPassed: playerHand?.hasPassed,
          });
      }
    }
    return playerHands;
  };

  // This is the last turn played to the active pile
  const getPreviousTurn = () => {
    if (!activeRound || !activeRound.activePile || activeRound.activePile.length < 1) {
      return undefined;
    }
    return activeRound.activePile[activeRound.activePile.length - 1];
  };

  // Gets the player with this player's complimentary rank for card passing
  const getComplimentaryPlayerId = () => {
    if (!activeRound || typeof playerHand?.startRank !== "number") {
      return;
    }
    // Determine the rank to whom this player owes cards
    const complimentaryRank = activeRound.hands.length - playerHand.startRank - 1;

    // Then grab the ID of the player with that rank
    const complimentaryPlayerId = activeRound.hands.find(h => h.startRank === complimentaryRank)?.playerId;

    // If we couldn't find such a player, something's wrong
    if (!complimentaryPlayerId) {
      console.warn("UNABLE TO DETERMINE A COMPLIMENTARY PLAYER FOR PASSING CARDS");
      return;
    }

    return complimentaryPlayerId;
  }

  // Gets the number of cards this player needs to pass
  const getCardsNeededToPassQty = () => {
    if (
      playerHand?.readyToPlay
      || !activeRound
      || !playerHand
      || typeof playerHand.startRank !== "number"
    ) {
      return undefined;
    }
    if (activeRound.hands.length === 3) {
      return 1;
    }
    return playerHand.startRank === 0 || playerHand.startRank === activeRound.hands.length - 1
      ? 2
      : 1;
  }

  // Trigger mutation to start the game
  const handleStartGame = async () => {
    await startGame({
      variables: {
        gameId: data?.game.id!,
      },
    });
  }

  // Trigger mutation to start a new round
  const handleStartNewRound = async () => {
    await startRound({
      variables: {
        gameId: data!.game.id,
      }
    });
  }

  // Handler for the action of playing a turn, passed down as a prop
  const handlePlayTurn = async (cards?: Card[]) => {
    const variables: PlayTurnArgs = {
      playerId: playerContext.player!.id,
      gameId: data!.game.id,
      cardsToPlay: cards?.map(c => c.alias),
    };
    await playTurn({ variables });
  };

  // Handler for the action of passing cards from one player to another
  const handlePassCards = async (cards: Card[]) => {
    // Just return if conditions aren't right
    if (
      !playerContext.player
      || !data?.game
      || !activeRound
      || !playerHand
      || typeof playerHand.startRank !== "number"
      || playerHand.readyToPlay
    ) {
      return;
    }

    // Then grab the ID of the player to receive these cards
    const receivingPlayerId = getComplimentaryPlayerId();

    // If we couldn't find such a player, something's wrong
    if (!receivingPlayerId) {
      console.warn("UNABLE TO DETERMINE A COMPLIMENTARY PLAYER FOR PASSING CARDS");
      return;
    }

    // Pass the cards
    await passCards({
      variables: {
        gameId: data.game.id,
        cardsToPass: cards.map(c => c.alias),
        givingPlayerId: playerContext.player!.id,
        receivingPlayerId,
      }
    })
  }

  // Gets a message to display under the player's hand if they need to trade cards
  const renderPassCardsMessage = () => {
    if (!playerHand) {
      return;
    }
    const complimentaryPlayerId = getComplimentaryPlayerId();
    const complimentaryPlayer = data?.game.players.find(p => p.id === complimentaryPlayerId);
    const qty = getCardsNeededToPassQty();
    if (!complimentaryPlayer || !qty) {
      return;
    }
    const message = `you owe your ${qty} ${isPassingHighCards ? "highest" : "least desired"} card${qty > 1 ? "s" : ""} to ${complimentaryPlayer.name}`;
    return (
      <p>{message}</p>
    )
  }

  // This renders the pre-game view (start game button or waiting message)
  const renderInactiveGame = () => {
    const continueAction = gameHasStarted
      ? "start new round"
      : "start game";
    const handleContinueAction = gameHasStarted
      ? handleStartNewRound
      : handleStartGame;
    if (data?.game.host.id === playerContext.player?.id) {
      return (
        <button
          onClick={handleContinueAction}
        >
          {continueAction}
        </button>);
    }
    return (<p>waiting for host to {continueAction}...</p>)
  }

  // This renders the active pile by displaying the previous turn or a message
  const renderActivePile = () => {
    const turn = getPreviousTurn();
    return (
      <div
        className="activePile"
      >
        <p>DISCARD PILE:</p>
        {
          !!turn
          ? turn.cards.map((card, index) => {
            return (
              <PlayingCard
                key={`activePileCard${index}`}
                card={card}
                />
            );
          })
          : <p>Pile is empty...</p>
        }
      </div>
    );
  }

  // Return a loading message while the game is being fetched
  if (
    gameDataLoading 
    || startGameLoading
    || playTurnLoading
    || startRoundLoading
    || passCardsLoading
  ) {
    return <p>Loading...</p>;
  }

  // Return a message if the turn was unable to be played
  if (
    gameDataError
    || playTurnError
    || startGameError
    || startRoundError
    || passCardsError
  ) {
    return <p>An error occurred...</p>;
  }

  // If the game data exists...
  if (!data || !data.game) {
    // If none of the above and still no data, something is definitely wrong
    return <p>something has gone terribly wrong...</p>;
  }

  return (
    <>
      <h3
        className="gameName"
      >
        {data.game.name}
      </h3>
      <p>PLAYERS:</p>
      <OtherPlayers
        playerHands={otherPlayers()}
      />
      <ActionLog actions={data.game.actionLog} />
      {
        activeRound
        ? <>
          {renderActivePile()}
          <PlayerHand
            player={playerContext.player}
            hand={playerHand!}
            playToBeat={getPreviousTurn()?.cards}
            onPlayTurn={handlePlayTurn}
            onPassCards={handlePassCards}
            powerCard={data.game.gameConfig.powerCardAlias}
            isPassingHighCards={isPassingHighCards}
            cardsNeededToPass={getCardsNeededToPassQty()}
          />
          {!playerHand?.readyToPlay && renderPassCardsMessage()}
        </>
        : <>
          {renderInactiveGame()}
        </>
      }
    </>
  );
};