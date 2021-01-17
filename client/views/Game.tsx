import React, { FC, useContext, useMemo } from "react";
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
//import { ApolloClientContext } from "../contexts/ApolloClient";

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

  // Prompt player info if none exists
  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }

  // Set up the WS connection using the apollo client context
  // if (apolloClientContext && !apolloClientContext.wsLinkInitiated && gameId) {
  //   apolloClientContext.initiateWsLink(playerContext.player.id, gameId);
  // }


  // Query for the whole game
  const { subscribeToMore, data, loading: gameDataLoading } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
    variables: {
      id: gameId!,
    },
  });

  // Initiate subscription to the game
  subscribeToMore({
    document: SUBSCRIBE_TO_GAME,
    variables: { id: gameId },
  });

  // Set up the mutation that allows a player to play their turn
  const [playTurn, { loading: playTurnLoading, error: playTurnError }] = useMutation<boolean, PlayTurnArgs>(PLAY_TURN);

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
  const otherPlayers: OtherPlayerHand[] = useMemo(() => {
    let playerHands: OtherPlayerHand[] = [];
    if (data?.game.players && activeRound) {
      for (const hand of activeRound.hands) {
          const playerName = data?.game.players.find(p => p.id === hand.playerId)?.name ?? "UNKNOWN";
          playerHands.push({
            playerName,
            cardsRemaining: hand.cards.length,
            isActive: hand.isActive,
          });
      }
    }
    return playerHands;
  }, [data?.game]);

  // This is the last turn played to the active pile
  const previousTurn = useMemo(() => {
    if (!activeRound || !activeRound.activePile || activeRound.activePile.length < 1) {
      return undefined;
    }
    return activeRound.activePile[activeRound.activePile.length - 1];
  }, [data?.game]);

  // This renders the active pile by displaying the previous turn or a message
  const renderActivePile = () => {
    const turn = previousTurn;
    if (!turn) {
      return (<p>Pile is empty...</p>);
    }
    return turn.cards.map(card => {
      return (
        <>
          <PlayingCard
            card={card}
          />
        </>
      );
    });
  }

  // Return a loading message while the game is being fetched
  if (gameDataLoading || playTurnLoading) {
    return <p>Loading...</p>;
  }

  // Return a message if the turn was unable to be played
  if (playTurnError) {
    return <p>An error occurred playing turn...</p>;
  }

  // If the game data exists...
  if (data && data.game) {
    return (
      <>
        <OtherPlayers
          playerHands={otherPlayers}
        />
        {activeRound && renderActivePile()}
        <PlayerHand
          name={playerContext.player.name}
          cards={getSortedCards(playerHand?.cards)}
          turnInProgress={!!playerHand?.isActive}
          playToBeat={previousTurn?.cards}
          onPlayTurn={handlePlayTurn}
          powerCard={data.game.gameConfig.powerCardAlias}
        />
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