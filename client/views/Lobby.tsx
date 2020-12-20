import React, { FC, useContext } from "react";
import { PlayerContext } from "../contexts/Player";
import { useQuery } from "@apollo/client";
import { GetLobbyGamesResponse, GET_LOBBY_GAMES, LobbyGame } from "../queries/getGames";

export const Lobby: FC = () => {

  const { data } = useQuery<GetLobbyGamesResponse>(GET_LOBBY_GAMES);
  const playerContext = useContext(PlayerContext);

  const renderLobbyGame = (game: LobbyGame) => {
    return (
      <>
        <p>Name: {game.name}</p>
        <p>Host: {game.host.name}</p>
        <p>Current Players:</p>
        {game.players.map(p => <p key={p.id}>{p.name}</p>)}
      </>
    );
  };

  const renderLobbyGames = () => {
    if (data && data.openGames) {
      return data.openGames.map(g => renderLobbyGame(g));
    }
    return <></>;
  };

  return (
    <div>
      Welcome, {playerContext?.player?.name ?? "player"}!
      {renderLobbyGames()}
    </div>
  );
};