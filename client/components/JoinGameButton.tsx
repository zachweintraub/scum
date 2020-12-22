import React, { FC } from "react";
import { scumHistory } from "../views/Main";

type JoinGameButtonProps = {
  gameId: string;
  text: string;
};

export const JoinGameButton: FC<JoinGameButtonProps> = ({ gameId, text }) => {
  const handleNavToGame = () => {
    scumHistory.push(`/game/${gameId}`);
  };
  return (
    <button
      onClick={handleNavToGame}
    >
      {text}
    </button>
  );
};