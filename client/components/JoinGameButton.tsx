import { useMutation } from "@apollo/client";
import React, { FC, useEffect } from "react";
import { JoinGameArgs, JoinGameResponse, JOIN_GAME } from "../mutations/joinGame";
import { scumHistory } from "../views/Main";

type JoinGameButtonProps = {
  gameId: string;
  playerId: string;
  text: string;
  isRejoin: boolean;
};

export const JoinGameButton: FC<JoinGameButtonProps> = ({ gameId, playerId, text, isRejoin }) => {

  // Define the join game mutation
  const [joinGame, { data: joinGameData, loading: joinGameLoading, error: joinGameError }] = useMutation<JoinGameResponse, JoinGameArgs>(JOIN_GAME);

  // Navigate to the game once it has been joined
  useEffect(() => {
    if (joinGameData?.addPlayerToGame) {
      handleNavToGame();
    }
  }, [joinGameData]);

  // Navigates to the game
  const handleNavToGame = () => {
    scumHistory.push(`/game/${gameId}`);
  }

  // Calls the join mutation on click
  const handleJoinGame = async () => {
    if (isRejoin) {
      handleNavToGame();
    } else {
      await joinGame({
        variables: {
          gameId,
          playerId,
        },
      });
    }
  }

  // Return the join button with error below if applicable
  return (
    <>
      <button
        disabled={joinGameLoading}
        onClick={handleJoinGame}
      >
        {text}
      </button>
      {joinGameError && <p>{joinGameError.message}</p>}
    </>
  );
};