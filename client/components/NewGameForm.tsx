import React, { FC, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CreateGameArgs, CreateGameResponse, CREATE_GAME } from "../mutations/createGame";
import { scumHistory } from "../views/Main";

type NewGameFormProps = {
  playerId: string;
  onCancel(): void;
};

export const NewGameForm: FC<NewGameFormProps> = ({ playerId, onCancel }) => {

  const [enteredNameText, setEnteredNameText] = useState<string>("");

  // Set up the mutation that creates a new game
  const [createGame, { data: createdGameData, loading: createGameLoading, error: createGameError }] = useMutation<CreateGameResponse, CreateGameArgs>(CREATE_GAME);

  useEffect(() => {
    if (!!createdGameData?.createGame) {
      scumHistory.push(`/game/${createdGameData.createGame}`);
    }
  }, [createdGameData]);

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredNameText(event.target.value);
  };

  const handleSubmit = async () => {
    if (enteredNameText) {
      await createGame({
        variables: {
          hostId: playerId,
          name: enteredNameText
        }
      })
    }
  };

  const handleCancel = () => {
    setEnteredNameText("");
    onCancel();
  };

  const renderErrorText = () => {
    let errorText = "";
    if (createGameError) {
      errorText = createGameError.message;
    }
    return (
      <p>{errorText}</p>
    );
  };

  const renderGameNameInput = () => {
    return (
      <div>
        <input
          onChange={handleChangeName}
          value={enteredNameText}
        />
        <button
          onClick={handleSubmit}
          disabled={createGameLoading || !enteredNameText}
        >
          create
        </button>
        <button
          onClick={handleCancel}
          disabled={createGameLoading}
        >
          cancel
        </button>
        {renderErrorText()}
      </div>
    );
  };

  return renderGameNameInput();

};