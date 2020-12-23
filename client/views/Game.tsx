import React, { FC, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../contexts/Player";
import { useQuery } from "@apollo/client";
import { GetGameResponse, GET_GAME } from "../queries/getGame";
import { SUBSCRIBE_TO_GAME } from "../subscriptions/game";
import { Portal } from "./Portal";
//import { scumHistory } from "./Main";

type GameViewParams = {
  gameId?: string;
};

export const Game: FC = () => {

  const { gameId } = useParams<GameViewParams>();

  const playerContext = useContext(PlayerContext);

  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }
  
  const { subscribeToMore, data, loading } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
    variables: {
      id: gameId!,
    },
  });

  subscribeToMore({
    document: SUBSCRIBE_TO_GAME,
    variables: { id: gameId },
  });


  if (loading) {
    return <p>Loading...</p>;
  }

  if (data && data.game) {
    return <div>GAME: {data.game.actionLog[data.game.actionLog.length-1]?.message ?? "No messages"}</div>;
  }

  return <p>idk what's wrong</p>;

};