import React, { FC, useEffect } from "react";
import { Player } from "../contexts/Player";
import { useMutation } from "@apollo/client";
import { Card, Game, Round } from "../queries/getGame";
import { PlayerHand } from "../components/PlayerHand";
import { PlayingCard } from "../components/PlayingCard";
import { PlayTurnArgs, PlayTurnResponse, PLAY_TURN } from "../mutations/playTurn";
import { OtherPlayers } from "../components/OtherPlayers";
import { StartGameArgs, StartGameResponse, START_GAME } from "../mutations/startGame";
import { ActionLog } from "../components/ActionLog";
import { StartRoundArgs, StartRoundResponse, START_ROUND } from "../mutations/startRound";
import { PassCardsResponse, PASS_CARDS } from "../mutations/passCards";
import { PassCardsArgs } from "../../server/schema/mutation/passCards";
import { LogMessageArgs } from "../../server/schema/mutation/logAction";
import { LogMessageResponse, SEND_MESSAGE } from "../mutations/sendMessage";

/**
 * TODO: Idea for pausing on cards played before clearing the active pile...
 * Use the subscribe to more function to check whether the pile was cleared and if so...
 * ...take the last turn played and display it as the active pile for a fixed number of seconds
 */

type GameArgs = {
  player: Player;
  game: Game;
  /** Subscribe to the game on mount */
  onSubscribe(): void;
};

export const GameView: FC<GameArgs> = ({ game, player, onSubscribe }) => {

  //const apolloClientContext = useContext(ApolloClientContext);
  
  // Set up the mutation to start the game
  const [startGame, { loading: startGameLoading, error: startGameError }] = useMutation<StartGameResponse, StartGameArgs>(START_GAME);

  // Set up the mutatiomn to start a new round
  const [startRound, { loading: startRoundLoading, error: startRoundError }] = useMutation<StartRoundResponse, StartRoundArgs>(START_ROUND);
  
  // Set up the mutation that allows a player to play their turn
  const [playTurn, { loading: playTurnLoading, error: playTurnError }] = useMutation<PlayTurnResponse, PlayTurnArgs>(PLAY_TURN);

  // Set up the mutation that allows one player to pass cards to another
  const [passCards, { loading: passCardsLoading, error: passCardsError }] = useMutation<PassCardsResponse, PassCardsArgs>(PASS_CARDS);

  // Set up the mutation that allows the player to send a message in the chat box
  const [sendMessage, { loading: sendMessageLoading, error: sendMessageError }] = useMutation<LogMessageResponse, LogMessageArgs>(SEND_MESSAGE, {
    update(cache, { data }) {
      const newAction = data?.logAction;
      cache.modify({
        id: cache.identify(game),
        fields: {
          actionLog(existingActionLog) {
            return [...existingActionLog, newAction];
          },
        },
      });
    },
  });

  useEffect(() => {
    onSubscribe();
  }, []);

  // Flag to determine whether the game has started
  const gameHasStarted = game.startedAt;

  // This is the current active round pulled from the game
  const activeRound = game.rounds?.find(r => r.isActive);

  // This is the hand of the logged in player
  const playerHand = activeRound?.hands.find(h => h.playerId === player.id);

  // True if the player owes high cards
  const isPassingHighCards = !playerHand?.readyToPlay
    && activeRound
    && !!playerHand?.startRank
    // This part means they are ranked below the mid-point (higher number = worse rank)
    && playerHand.startRank >= Math.max(activeRound.hands.length / 2);

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
  };

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
  };

  // Trigger mutation to start the game
  const handleStartGame = async () => {
    await startGame({
      variables: {
        gameId: game.id,
      },
    });
  };

  // Trigger mutation to start a new round
  const handleStartNewRound = async () => {
    await startRound({
      variables: {
        gameId: game.id,
      },
    });
  };

  // Handler for the action of playing a turn, passed down as a prop
  const handlePlayTurn = async (cards?: Card[]) => {
    const variables: PlayTurnArgs = {
      playerId: player.id,
      gameId: game.id,
      cardsToPlay: cards?.map(c => c.alias),
    };
    await playTurn({ variables });
  };

  // Handler for the action of passing cards from one player to another
  const handlePassCards = async (cards: Card[]) => {
    // Just return if conditions aren't right
    if (
      !activeRound
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
        gameId: game.id,
        cardsToPass: cards.map(c => c.alias),
        givingPlayerId: player.id,
        receivingPlayerId,
      },
    });
  };

  // Handler for the action of sending a message in the chat box
  const handleSendMessage = async (message: string) => {

    const messageWithName = `${player.name}: ${message}`;
    await sendMessage({
      variables: {
        message: messageWithName,
        gameId: game.id,
      },
    });
  };

  // Gets a message to display under the player's hand if they need to trade cards
  const renderPassCardsMessage = () => {
    if (!playerHand) {
      return;
    }
    const complimentaryPlayerId = getComplimentaryPlayerId();
    const complimentaryPlayer = game.players.find(p => p.id === complimentaryPlayerId);
    const qty = getCardsNeededToPassQty();
    if (!complimentaryPlayer || !qty) {
      return;
    }
    const message = `you owe your ${qty} ${isPassingHighCards ? "highest" : "least desired"} card${qty > 1 ? "s" : ""} to ${complimentaryPlayer.name}`;
    return (
      <p>{message}</p>
    );
  };

  const renderHostActionNeeded = () => {
    const continueAction = gameHasStarted
      ? "start new round"
      : "start game";
    const handleContinueAction = gameHasStarted
      ? handleStartNewRound
      : handleStartGame;
    if (game.host.id === player.id) {
      return (
        <button
          onClick={handleContinueAction}
        >
          {continueAction}
        </button>
      );
    }
    return (<p>waiting for host to {continueAction}...</p>);
  };

  const renderPlayersWaitingForGame = () => {
    if (!game.players) {
      return;
    }
    return (
      <p>players present: {game.players.map(p => p.name).join(", ")}</p>
    );
  };

  // This renders the pre-game view (start game button or waiting message)
  const renderInactiveGame = () => {

    // Establish a variable to hold the previous round
    let previousRound: Round | null = null;

    // Loop over the rounds and find that which finished most recently
    if (game.rounds?.length) {
      // Loop over other rounds to ensure they've all ended and find the most recent
      for (const round of game.rounds) {
        // Throw an error if another is still in progress
        if (!round.endedAt) {
          continue;
        }
        // If no previous round has been set or the one that has ended before this one, this is the new previous round
        if (!previousRound || (previousRound.endedAt && round.endedAt > previousRound.endedAt)) {
          previousRound = round;
        }
      }
    }

    // If a previous round was identified, return this...
    if (previousRound) {
      return (
        <div>
          <ActionLog
            actions={game.actionLog}
            onSendMessage={handleSendMessage}
            isLoading={sendMessageLoading}
          />
          <OtherPlayers
            hands={previousRound.hands}
            players={game.players}
          />
          {renderHostActionNeeded()}
        </div>
      );
    }

    // Otherwise, return this
    return (
      <div>
        <ActionLog
          actions={game.actionLog}
          onSendMessage={handleSendMessage}
          isLoading={sendMessageLoading}
        />
        {renderPlayersWaitingForGame()}
        {renderHostActionNeeded()}
      </div>
    );    
  };

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
          : <p>pile is empty...</p>
        }
      </div>
    );
  };

  const renderActiveGame = () => {
    if (
      !playerHand
      || !activeRound
      ) {
      return;
    }
    return (
      <div>
        <ActionLog
            actions={game.actionLog}
            onSendMessage={handleSendMessage}
            isLoading={sendMessageLoading}
        />
        <OtherPlayers
          hands={activeRound.hands}
          players={game.players}
        />
        {renderActivePile()}
        <PlayerHand
          player={player}
          hand={playerHand}
          playToBeat={getPreviousTurn()?.cards}
          onPlayTurn={handlePlayTurn}
          onPassCards={handlePassCards}
          powerCard={game.gameConfig.powerCardAlias}
          isPassingHighCards={isPassingHighCards}
          cardsNeededToPass={getCardsNeededToPassQty()}
          actionLoading={playTurnLoading || passCardsLoading}
        />
        {!playerHand?.readyToPlay && renderPassCardsMessage()}
      </div>
    );
  };

  // Return a loading message while a query/mutation is in progress
  if (
    startGameLoading
    //|| playTurnLoading
    || startRoundLoading
  ) {
    return <p>Loading...</p>;
  }

  // Return a message if the turn was unable to be played
  if (
    playTurnError
    || startGameError
    || startRoundError
    || passCardsError
    || sendMessageError
  ) {
    return <p>An error occurred...</p>;
  }

  return (
    <>
      <h3
        className="gameName"
      >
        {game.name}
      </h3>
      {
        activeRound
        ? renderActiveGame()
        : renderInactiveGame()
      }
    </>
  );
};