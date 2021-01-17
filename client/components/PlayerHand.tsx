import React, { FC, useMemo, useState } from "react";
import { Card } from "../queries/getGame";
import { PlayerCard } from "./PlayerCard";
import "./PlayerHand.scss";

type PlayerHandProps = {
  name: string;
  cards?: Card[];
  turnInProgress: boolean;
  playToBeat?: Card[];
  onPlayTurn(cards?: Card[]): void;
  powerCard: string;
};

export const PlayerHand: FC<PlayerHandProps> = ({
  cards,
  turnInProgress,
  playToBeat,
  name,
  onPlayTurn,
  powerCard
}) => {

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const handleSelectCard = (card: Card) => {
    if (turnInProgress) {
      const newSelectedCards = [...selectedCards, card];
      setSelectedCards(newSelectedCards);
    }
  }

  const handleDeselectCard = (targetCard: Card) => {
    if (turnInProgress) {
      let newSelectedCards: Card[] = [];
      for (let i = 0; i < selectedCards.length; i++) {
        const card = selectedCards[i];
        if (card.alias === targetCard.alias) {
          continue;
        }
        newSelectedCards.push(selectedCards[i]);
      }
      setSelectedCards(newSelectedCards);
    }
  }

  const canPass = useMemo(() => {
    if (!playToBeat || playToBeat.length === 0) {
      return false;
    }
    return true;
  }, [playToBeat]);

  const canPlay = useMemo(() => {
    if (!turnInProgress) {
      return false;
    }
    if (selectedCards.length < 1) {
      return false;
    }
    if (!playToBeat) {
      return true;
    }
    if (selectedCards.length === 1 && selectedCards[0].alias === powerCard) {
      return true;
    }
    if (playToBeat.length === selectedCards.length) {      
      const baseRank = selectedCards[0].rank;
      for (const card of selectedCards) {
        if (card.rank !== baseRank) {
          return false;
        }
      }
      return baseRank >= playToBeat[0].rank;
    }
    return false;
  }, [turnInProgress, selectedCards.length, playToBeat]);

  const renderCards = (cards: Card[]) => {
    return cards.map((card, index) => (
      <PlayerCard
        key={index}
        card={card}
        isSelected={selectedCards.includes(card)}
        onSelectCard={handleSelectCard}
        onDeselectCard={handleDeselectCard}
      />
    ));
  }

  const handleClickPlay = () => {
    onPlayTurn(selectedCards);
    setSelectedCards([]);
  }

  const handleClickPass = () => {
    onPlayTurn();
  }

  const playButton = useMemo(() => {
    return (
      <button
        disabled={!canPlay}
        onClick={handleClickPlay}
      >
        Play
      </button>
    );
  }, [canPlay, selectedCards]);

  const passButton = useMemo(() => {
    return (
      <button
        disabled={!canPass}
        onClick={handleClickPass}
      >
        Pass
      </button>
    );
  }, [canPass])

  if (!cards) {
    return <p>There should be cards here...</p>
  }
  return (
    <>
      <p>YOUR HAND ({name}):</p>
      <div className="playerHand">
        {renderCards(cards)}
      </div>
      {turnInProgress && playButton}
      {turnInProgress && passButton}
    </>
  );
};