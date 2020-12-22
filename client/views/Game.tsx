import React, { FC, useContext } from "react";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../contexts/Player";
import { useQuery } from "@apollo/client";
import { GetGameResponse, GET_GAME } from "../queries/getGame";

type GameViewParams = {
  gameId?: string;
};

export const Game: FC = () => {

  const { gameId } = useParams<GameViewParams>();

  // const playerContext = useContext(PlayerContext);
  
  // const { data, loading } = useQuery<GetGameResponse, { id: string }>(GET_GAME, {
  //   variables: {
  //     id: gameId!,
  //   },
  // });






  return <div>GAME: {gameId}</div>;

  
};