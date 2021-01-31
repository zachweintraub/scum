import React, { FC, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../contexts/Player";
import { useQuery } from "@apollo/client";
import { GetGameResponse, GET_GAME } from "../queries/getGame";
import { SUBSCRIBE_TO_GAME } from "../subscriptions/game";
import { Portal } from "./Portal";
import { GameView } from "../components/GameView";

/**
 * TODO: Idea for pausing on cards played before clearing the active pile...
 * Use the subscribe to more function to check whether the pile was cleared and if so...
 * ...take the last turn played and display it as the active pile for a fixed number of seconds
 */

type GameViewParams = {
  gameId?: string;
};

export const GameWrapper: FC = () => {

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
  
  // Prompt player info if none exists
  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }

  if (gameDataLoading) {
    return (
      <p>Loading...</p>
    );
  }

  if (gameDataError) {
    return (
      <p>An error occurred...</p>
    )
  }
  
  const handleSubscribe = () => {
    // Initiate subscription to the game
    subscribeToMore({
      document: SUBSCRIBE_TO_GAME,
      variables: { id: gameId },
    });
  }

  // If the game data exists...
  if (!data || !data.game) {
    // If none of the above and still no data, something is definitely wrong
    return <p>something has gone terribly wrong...</p>;
  }

  return (
    <GameView
      game={data.game}
      onSubscribe={handleSubscribe}
    />
  );
};