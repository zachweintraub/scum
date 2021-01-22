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
  const { subscribeToMore, data, loading: gameDataLoading } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
    variables: {
      id: gameId!,
    },
  });

  
  // Set up the mutation to start the game
  const [startGame, { loading: startGameLoading, error: startGameError }] = useMutation<StartGameResponse, StartGameArgs>(START_GAME);
  
  // Set up the mutation that allows a player to play their turn
  const [playTurn, { loading: playTurnLoading, error: playTurnError }] = useMutation<boolean, PlayTurnArgs>(PLAY_TURN);

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

  const handleStartGame = async () => {
    await startGame({
      variables: {
        gameId: data?.game.id!,
      },
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

  // This is the current active round pulled from the game
  const activeRound = data?.game.rounds?.find(r => r.isActive);

  // This is the hand of the logged in player
  const playerHand = activeRound?.hands.find(h => h.playerId === playerContext?.player?.id);

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
  const previousTurn = () => {
    if (!activeRound || !activeRound.activePile || activeRound.activePile.length < 1) {
      return undefined;
    }
    return activeRound.activePile[activeRound.activePile.length - 1];
  };

  // This renders the pre-game view (start game button or waiting message)
  const renderPreGame = () => {
    if (data?.game.host.id === playerContext.player?.id) {
      return (
        <button
          onClick={handleStartGame}
        >
          start game
        </button>);
    }
    return (<p>waiting for host to start game...</p>)
  }

  // This renders the active pile by displaying the previous turn or a message
  const renderActivePile = () => {
    const turn = previousTurn();
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
  if (gameDataLoading || playTurnLoading || startGameLoading) {
    return <p>Loading...</p>;
  }

  // Return a message if the turn was unable to be played
  if (playTurnError || startGameError) {
    return <p>An error occurred...</p>;
  }

  // If the game data exists...
  if (data && data.game) {
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
              name={playerContext.player.name}
              cards={getSortedCards(playerHand?.cards)}
              turnInProgress={!!playerHand?.isActive}
              playToBeat={previousTurn()?.cards}
              onPlayTurn={handlePlayTurn}
              powerCard={data.game.gameConfig.powerCardAlias}
            />
          </>
          : <>
            {renderPreGame()}
          </>
        }
      </>
    );
  }

  // If none of the above, something is definitely wrong
  return <p>idk what's wrong</p>;

};

// Function to sort the player's cards from low to high
function getSortedCards(cards?: Card[]) {
  return cards?.slice().sort((a, b) => {
    return a.rank - b.rank;
  });
}