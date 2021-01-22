import React, { FC } from "react";
import "./OtherPlayers.scss";

export type OtherPlayerHand = {
  playerName: string;
  cardsRemaining?: number;
  isActive?: boolean;
  hasPassed?: boolean;
}

type OtherPlayersProps = {
  playerHands: OtherPlayerHand[];
}

export const OtherPlayers: FC<OtherPlayersProps> = ({ playerHands }) => {
  const renderOtherPlayerHand = (hand: OtherPlayerHand, index: number) => {
    return (
      <div
        key={`otherPlayerHand${index}`}
        className={`otherPlayerHand${hand.isActive ? " isActive" : ""}${hand.hasPassed ? " hasPassed" : ""}`}
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