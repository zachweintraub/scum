import React, { FC } from "react";
import { Card } from "../queries/getGame";

type CardProps = {
  card: Card;
};

export const PlayingCard: FC<CardProps> = ({ card }) => {

  return (
    <p>
      {card.alias}
    </p>
  );
};