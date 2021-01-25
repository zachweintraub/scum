import React, { FC } from "react";
import { Player } from "../contexts/Player";
import { Hand } from "../queries/getGame";
import "./OtherPlayers.scss";

type OtherPlayersProps = {
  hands: Hand[];
  players: Player[];
}

export const OtherPlayers: FC<OtherPlayersProps> = ({ hands, players }) => {
  const renderOtherPlayerHand = (hand: Hand, index: number) => {
    // Grab some info about the player
    const player = players.find(p => p.id === hand.playerId);

    // If we can't find them, render nothing
    if (!player) {
      return;
    }
    
    // Determine what to display for the player's position (if anything)
    let position = undefined;
    // If they have either a start or end ranking, set a position value
    if (
      typeof hand.startRank === "number"
      || typeof hand.endRank === "number"
    ) {
      position = typeof hand.endRank === "number"
        ? `new ${getRankName(hand.endRank, hands.length)}`
        : `acting ${getRankName(hand.startRank!, hands.length)}`
    }
    return (
      <div
        key={`otherPlayerHand${index}`}
        className={`otherPlayerHand${hand.isActive ? " isActive" : ""}${hand.hasPassed ? " hasPassed" : ""}`}
      >
        <p>{player.name}</p>
        {hand.cards.length && <p>{hand.cards.length}</p>}
        {position && <p>{position}</p>}
      </div>
    );
  }
  return (
    <div
      className="otherPlayers"
    >
      {hands.map(renderOtherPlayerHand)}
    </div>
  )
}

function getRankName(rank: number, totalPlayers: number): string {
  switch(rank) {
    case 0:
      return "president";
    case totalPlayers - 1:
      return "scum";
    case 1:
      return totalPlayers !== 3
        ? "vice-president"
        : "neutral";
    case totalPlayers - 2:
      return "vice-scum";
    default:
      return "neutral";
  }
}