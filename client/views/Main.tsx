import React, { FC, useContext } from "react";
import { PlayerContext } from "../contexts/Player";
import { Portal } from "./Portal";
import { Lobby } from "./Lobby";

export const Main: FC = () => {

  const playerContext = useContext(PlayerContext);

  const renderContent = () => {
    return playerContext?.player ?
      (
        <Lobby />
      )
      : (
        <Portal />
      );
  };

  return (
    <>
      {renderContent()}
    </>
  );
};