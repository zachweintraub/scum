import React, { createContext, FC, useState } from "react";

export type Player = {
  id: string;
  name: string;
};

export type PlayerCtx = {
  player: Player | null;
  /** Provide a method for setting the player */
  setPlayer(player: Player): void;
};

export const PlayerContext = createContext<PlayerCtx | null>(null);

const { Provider } = PlayerContext;

export const PlayerManager: FC = ({ children }) => {

  const [player, setPlayer] = useState<Player | null>(null);

  const context: PlayerCtx = {
    player,
    setPlayer,
  };

  return (
    <Provider value={context}>
      {children}
    </Provider>
  );
};