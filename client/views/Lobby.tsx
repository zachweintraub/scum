import React, { FC, useContext } from "react";
import { PlayerContext } from "../contexts/Player";
import { JoinGameButton } from "../components/JoinGameButton";
import { useQuery } from "@apollo/client";
import { GetLobbyGamesResponse, GET_LOBBY_GAMES } from "../queries/getGames";
import { GetGamesArgs } from "../../server/schema/query/getGames";
import { Portal } from "./Portal";

export const Lobby: FC = () => {

  const playerContext = useContext(PlayerContext);

  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }
  
  const { data, loading } = useQuery<GetLobbyGamesResponse, GetGamesArgs>(GET_LOBBY_GAMES, {
    variables: {
      playerId: playerContext?.player?.id ?? undefined,
      openOnly: true,
    },
  });

  const renderOpenGames = () => {
    const openGames = data?.openGames.filter(g => {
      return !g.players.find(p => p.id === playerContext?.player?.id);
    }) ?? [];
    if (openGames.length > 0) {
      const gameElements =  openGames.map(game => {
        return (
          <div key={game.id}>
            <p>Name: {game.name}</p>
            <p>Host: {game.host.name}</p>
            <p>Current Players: {game.players.map(p => p.name).join(", ")}</p>
            <JoinGameButton
              gameId={game.id}
              text="Join"
            />
          </div>
        );
      });
      return (
        <>
          <h5>Open Games</h5>
          {gameElements}
        </>
      );
    }
    return <></>;
  };

  const renderPlayerGames = () => {
    if (data && data.playerGames) {
      const gameElements = data.playerGames.map(game => {
        return (
            <div key={game.id}>
              <p>Name: {game.name}</p>
              <p>Host: {game.host.name}</p>
              <p>Current Players: {game.players.map(p => p.name).join(", ")}</p>
              <JoinGameButton
                gameId={game.id}
                text="Rejoin"
              />
            </div>
        );
      });
      return (
        <>
          <h5>Your Games</h5>
          {gameElements}
        </>
      );
    }
    return <></>;
  };

  if (loading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <div>
      <h3>Welcome, {playerContext?.player?.name ?? "player"}!</h3>
      <button>Create New Game</button>
      {renderPlayerGames()}
      {renderOpenGames()}
    </div>
  );
};