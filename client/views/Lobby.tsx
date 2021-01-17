import React, { FC, useContext, useState } from "react";
import { PlayerContext } from "../contexts/Player";
import { JoinGameButton } from "../components/JoinGameButton";
import { useQuery } from "@apollo/client";
import { GetLobbyGamesResponse, GET_LOBBY_GAMES } from "../queries/getGames";
import { GetGamesArgs } from "../../server/schema/query/getGames";
import { Portal } from "./Portal";
import { NewGameForm } from "../components/NewGameForm";

export const Lobby: FC = () => {

  const [ isCreatinNewGame, setIsCreatingNewGame ] = useState<boolean>(false);

  const playerContext = useContext(PlayerContext);

  const { data, loading } = useQuery<GetLobbyGamesResponse, GetGamesArgs>(GET_LOBBY_GAMES, {
    variables: {
      playerId: playerContext?.player?.id ?? undefined,
      openOnly: true,
    },
  });
  
  if (!playerContext?.player) {
    return (
      <Portal />
    );
  }

  const handleClickCreate = () => {
    setIsCreatingNewGame(true);
  }

  const handleCancelCreate = () => {
    setIsCreatingNewGame(false);
  }
  

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
              playerId={playerContext.player?.id!}
              text="Join"
              isRejoin={false}
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
                playerId={playerContext.player?.id!}
                text="Rejoin"
                isRejoin={true}
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

  const renderCreateGameButton = () => {
    if (!isCreatinNewGame) {
      return (
        <button
          onClick={handleClickCreate}
        >
          Create New Game
        </button>
      );
    }
    return (
      <NewGameForm
        playerId={playerContext.player?.id!}
        onCancel={handleCancelCreate}
      />
    ) 
  }

  return (
    <div>
      <h3>Welcome, {playerContext?.player?.name ?? "player"}!</h3>
      {renderCreateGameButton()}
      {renderPlayerGames()}
      {renderOpenGames()}
    </div>
  );
};