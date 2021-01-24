import React, { FC, useEffect, useMemo, useState } from "react";
import { Player } from "../contexts/Player";
import { Card, Hand } from "../queries/getGame";
import { PlayerCard } from "./PlayerCard";
import "./PlayerHand.scss";

type PlayerHandProps = {
  player: Player;
  hand: Hand;
  playToBeat?: Card[];
  onPlayTurn(cards?: Card[]): void;
  onPassCards(cards: Card[]): void;
  powerCard: string;
  cardsNeededToPass?: number;
  isPassingHighCards?: boolean;
};

export const PlayerHand: FC<PlayerHandProps> = ({
  hand,
  player,
  powerCard,
  playToBeat,
  onPlayTurn,
  onPassCards,
  cardsNeededToPass,
  isPassingHighCards,
}) => {

  const { isActive, readyToPlay } = hand;

  const cards = getSortedCards(hand.cards);

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  // Auto-select high cards if this player owes them to another
  useEffect(() => {
    // Do this is the player is not flagged as ready, owes high cards, and we know how many they owe
    if (
      !readyToPlay
      && isPassingHighCards
      && cardsNeededToPass
    ) {

      // Find the power card in their hand if it is there (or multiples if playing with more than one deck)
      const powerCardsInHand = cards.filter(card => card.alias === powerCard);

      // If found, add it/them to the high cards array
      let highCards = powerCardsInHand.slice(0, cardsNeededToPass);

      // Determine how many more cards are needed to pass
      let remainingCardsNeeded = cardsNeededToPass - highCards.length;

      // Start at the end of the hand to grab the highest card(s)
      let searchIndex = cards.length - 1;

      // For each remaining card needed, grab one off the top
      while (remainingCardsNeeded > 0) {
        // If it's not the power card, grab it and decrement remaining cards needed
        if (cards[searchIndex].alias !== powerCard) {
          highCards.push(cards[searchIndex]);
          remainingCardsNeeded--;
        }
        // Either way, decrement the search index to get the next card on the next iteration of this loop
        searchIndex--;
      }

      // Now that we have the high cards, set them as selected
      setSelectedCards(highCards);
    }
  }, [readyToPlay, isPassingHighCards])
  
  const canPass = useMemo(() => {
    if (!playToBeat || playToBeat.length === 0) {
      return false;
    }
    return true;
  }, [playToBeat]);
  
  const canPlay = useMemo(() => {
    // If it's not your turn you can't play
    if (!isActive) {
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
  }, [hand?.isActive, selectedCards.length, playToBeat]);
  
  const canPassToPlayer = useMemo(() => {
    return !readyToPlay
    && selectedCards.length === cardsNeededToPass;
  }, [readyToPlay, selectedCards, cardsNeededToPass]);
  
  const playButton = useMemo(() => {
    return (
      <button
      disabled={!canPlay}
      onClick={handleClickPlay}
      >
        play
      </button>
    );
  }, [canPlay, selectedCards]);
  
  const passButton = useMemo(() => {
    return (
      <button
      disabled={!canPass}
      onClick={handleClickPass}
      >
        pass
      </button>
    );
  }, [canPass]);

  const passCardsButton = useMemo(() => {
    return (
      <button
        disabled={!canPassToPlayer}
        onClick={handleClickPassCards}
      >
        pass cards
      </button>
    )
  }, []);
  
  const handleSelectCard = (card: Card) => {
    const canSelect = isActive || (!readyToPlay && !isPassingHighCards);
    if (canSelect) {
      const newSelectedCards = [...selectedCards, card];
      setSelectedCards(newSelectedCards);
    }
  }

  const handleDeselectCard = (targetCard: Card) => {
    const canDeselect = isActive || (!readyToPlay && !isPassingHighCards);
    if (canDeselect) {
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

  const handleClickPlay = () => {
    onPlayTurn(selectedCards);
    setSelectedCards([]);
  }
  
  const handleClickPass = () => {
    onPlayTurn();
  }
  
  const handleClickPassCards = () => {
    onPassCards(selectedCards);
  }

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



  if (!hand?.cards) {
    return <p>There should be cards here...</p>
  }
  return (
    <>
      <p>YOUR HAND ({player.name}):</p>
      <div className="playerHand">
        {renderCards(cards)}
      </div>
      {isActive && readyToPlay && playButton}
      {isActive && readyToPlay && passButton}
      {!readyToPlay && passCardsButton}
    </>
  );
};

// Function to sort the player's cards from low to high
function getSortedCards(cards: Card[]) {
  return cards.slice().sort((a, b) => {
    return a.rank - b.rank;
  });
}