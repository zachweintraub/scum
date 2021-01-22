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
    // If it's not your turn you can't play
    if (!turnInProgress) {
      return false;
    }
    // If you haven't selected any cards you can't play
    if (selectedCards.length < 1) {
      return false;
    }
    // If you've selected the power card and only the power card, go for it
    if (selectedCards.length === 1 && selectedCards[0].alias === powerCard) {
      return true;
    }
    // If there is no play to beat, or your selected cards are of the same quantity, do more checks...
    if (!playToBeat || playToBeat.length === selectedCards.length) {   
      // This looping check returns false if the selected cards vary in length   
      const baseRank = selectedCards[0].rank;
      for (const card of selectedCards) {
        if (card.rank !== baseRank) {
          return false;
        }
      }
      // If the above check passes, you can play if there is no play to beat, or if your selected cards are the same or higher
      return !playToBeat || baseRank >= playToBeat[0].rank;
    }
    return false;
  }, [turnInProgress, selectedCards.length, playToBeat]);

  const renderCards = (cards: Card[]) => {
    return cards.map((card, index) => (
      <PlayerCard
        key={`playerCard${index}`}
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