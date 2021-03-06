import React, { FC, useEffect, useRef, useState } from "react";
import { ScumDb } from "../../server/services/scumDb";
import { ActionLogItem } from "../queries/getGame";
import "./ActionLog.scss";

type ActionLogProps = {
  actions: ActionLogItem[];
  onSendMessage(message: string): void;
  isLoading: boolean;
};

export const ActionLog: FC<ActionLogProps> = ({
  actions,
  isLoading,
  onSendMessage,
}) => {

  const [ newMessage, setNewMessage ] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [actions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest", inline: "start" });
  }

  const handleChangeNewMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleClickSendMessage = (event: React.SyntheticEvent) => {
    event.preventDefault();
    onSendMessage(newMessage);
    setNewMessage("");
  }

  const renderMessage = (message: ScumDb.ActionLogItemDBO) => {
    return (
      <div>{message.message}</div>
    );
  }


  return (
    <>
      <div className="chatWindow">
        {actions.map(renderMessage)}
        <div ref={messagesEndRef}/>
      </div>
      <form
        onSubmit={handleClickSendMessage}
      >
        <input
          onChange={handleChangeNewMessage}
          value={newMessage}
        />
        <button
          type="submit"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </>
  );
};