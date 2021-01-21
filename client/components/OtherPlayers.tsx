import React, { FC } from "react";
import "./OtherPlayers.scss";

export type OtherPlayerHand = {
  playerName: string;
  cardsRemaining?: number;
  isActive?: boolean;
  isOnline?: boolean;
  hasPassed?: boolean;
}

type OtherPlayersProps = {
  playerHands: OtherPlayerHand[];
}

export const OtherPlayers: FC<OtherPlayersProps> = ({ playerHands }) => {
  const renderOtherPlayerHand = (hand: OtherPlayerHand) => {
    return (
      <div
        className={`otherPlayerHand${hand.isActive ? " isActive" : ""}${hand.hasPassed ? " hasPassed" : ""}${hand.isOnline ? " isOnline" : ""}`}
      >
        <p>{hand.playerName}</p>
        {hand.cardsRemaining && <p>{hand.cardsRemaining}</p>}
      </div>
    );
  }
  return (
    <div
      className="otherPlayers"
    >
      {playerHands.map(renderOtherPlayerHand)}
    </div>
  )
}