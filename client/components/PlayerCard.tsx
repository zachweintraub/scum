import React, { FC } from "react";
import { Card } from "../queries/getGame";
import "./PlayerCard.scss";

type PlayerCardProps = {
  card: Card;
  onSelectCard(card: Card): void;
  onDeselectCard(card: Card): void;
  isSelected: boolean;
};

export const PlayerCard: FC<PlayerCardProps> = ({ card, isSelected, onSelectCard, onDeselectCard }) => {
  

  const handleToggleSelectCard = () => {
    if (isSelected) {
      onDeselectCard(card);
    } else {
      onSelectCard(card);
    }
  }

  return (
    <p
      className={`playerCard${isSelected ? " selectedCard" : ""}`}
      onClick={handleToggleSelectCard}
    >
      {card.alias}
    </p>
  );
};