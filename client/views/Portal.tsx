import React, { FC, useContext, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { PlayerContext } from "../contexts/Player";
import { GetPlayerResponse, GET_PLAYER } from "../queries/getPlayer";
import { CreatePlayerArgs, CreatePlayerResponse, CREATE_PLAYER } from "../mutations/createPlayer";
import { GetPlayerArgs } from "../../server/schema/query/getPlayer";

export const Portal: FC = () => {

  const [enteringNewName, setEnteringNewName] = useState<boolean>(false);
  const [enteringExistingName, setEnteringExistingName] = useState<boolean>(false);
  const [enteredNameText, setEnteredNameText] = useState<string>("");

  const playerContext = useContext(PlayerContext);

  const [getExistingPlayer, {
    data: getPlayerData,
    error: getPlayerError,
    loading: getPlayerLoading,
  }] = useLazyQuery<GetPlayerResponse, GetPlayerArgs>(GET_PLAYER);

  const [ createPlayer, {
    data: createPlayerData,
    error: createPlayerError,
    loading: createPlayerLoading
  }] = useMutation<CreatePlayerResponse, CreatePlayerArgs>(CREATE_PLAYER);

  const handleChooseNewPlayer = () => {
    setEnteringNewName(true);
  };

  const handleChooseExistingPlayer = () => {
    setEnteringExistingName(true);
  };

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredNameText(event.target.value);
  };

  const handleSubmit = async () => {
    if (enteringExistingName) {
      getExistingPlayer({
        variables: {
          name: enteredNameText,
        },
      });
    }
    if (enteringNewName) {
      createPlayer({
        variables: {
          name: enteredNameText,
        },
      });
    }
  };

  useEffect(() => {
    if (playerContext?.onSetPlayer && getPlayerData?.player) {
      playerContext.onSetPlayer(getPlayerData.player);
    }
    if (playerContext?.onSetPlayer && createPlayerData?.createPlayer) {
      playerContext.onSetPlayer(createPlayerData.createPlayer);
    }
  }, [getPlayerData, createPlayerData]);

  const handleCancel = () => {
    setEnteringNewName(false);
    setEnteringExistingName(false);
    setEnteredNameText("");
  };

  const renderErrorText = () => {
    let errorText = "";
    if (getPlayerError) {
      errorText = getPlayerError.message;
    }
    if (createPlayerError) {
      errorText = createPlayerError.message;
    }
    return (
      <p>{errorText}</p>
    );
  };

  const renderEntryChoice = () => {
    return (
      <>
        <button onClick={handleChooseNewPlayer}>
            i'm new
        </button>
        <button onClick={handleChooseExistingPlayer}>
          i've been here
        </button>
      </>
    );
  };

  const renderNameInput = () => {
    return (
      <div>
        <input
          onChange={handleChangeName}
          value={enteredNameText}
        />
        <button onClick={handleSubmit}>
          submit
        </button>
        <button onClick={handleCancel}>
          cancel
        </button>
        {renderErrorText()}
      </div>
    );
  };

  if (getPlayerLoading || createPlayerLoading) {
    return (
      <p>Loading...</p>
    );
  }

  if (!enteringExistingName && !enteringNewName) {
    return renderEntryChoice();
  }

  return renderNameInput();

};