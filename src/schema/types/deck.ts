export type Suit = {
  name: string,
  alias: string,
};

export type Rank = Suit & {
  rank: number,
};

export type Card = {
  rank: Rank,
  suit: Suit,
};

export class Deck {

  private cardCount: number;

  private shuffledCards: Card[];

  private suits: Suit[] = [
    {
      name: "Hearts",
      alias: "H",
    },
    {
      name: "Diamonds",
      alias: "D",
    },
    {
      name: "Clubs",
      alias: "C",
    },
    {
      name: "Spades",
      alias: "S",
    },
  ];
  private ranks: { name: string, alias: string, rank: number }[] = [
    {
      name: "Three",
      alias: "3",
      rank: 0,
    },
    {
      name: "Four",
      alias: "4",
      rank: 1,
    },
    {
      name: "Five",
      alias: "5",
      rank: 2,
    },
    {
      name: "Six",
      alias: "6",
      rank: 3,
    },
    {
      name: "Seven",
      alias: "7",
      rank: 4,
    },
    {
      name: "Eight",
      alias: "8",
      rank: 5,
    },
    {
      name: "Nine",
      alias: "9",
      rank: 6,
    },
    {
      name: "Ten",
      alias: "10",
      rank: 7,
    },
    {
      name: "Jack",
      alias: "J",
      rank: 8,
    },
    {
      name: "Queen",
      alias: "Q",
      rank: 9,
    },
    {
      name: "King",
      alias: "K",
      rank: 10,
    },
    {
      name: "Ace",
      alias: "A",
      rank: 11,
    },
    {
      name: "Two",
      alias: "2",
      rank: 12,
    },
  ];

  /**
   * Pass in number of standard decks to play with.
   * Arranges the appropriate number of cards into a shuffled array for dealing.
   */
  constructor(deckCount: number) {
    
    // The total number of cards that will be in this deck.
    let cardsToShuffle = deckCount * 52;
    this.cardCount = cardsToShuffle;

    // Create an array of indexes to randomly select from.
    let openIndexes: number[];
    for (let i = 0; i < cardsToShuffle; i++) {
      openIndexes.push(i);
    }

    // Loop over the ranks...
    for (let i = 0; i < this.ranks.length; i++) {
      const thisRank = this.ranks[i];
      // Within this rank, loop over the suits...
      for (let j = 0; j < this.suits.length; j++) {
        const thisSuit = this.suits[j];
        // This rank + this suit is one card - add once per deck we are using.
        for (let k = 0; k < deckCount; k++) {
          // Select a random index from the remaining empty indexes.
          const randomIndex = openIndexes[Math.floor(Math.random() * openIndexes.length)];
          // Insert this card into the final array at the random index.
          this.shuffledCards[randomIndex] = {
            rank: thisRank,
            suit: thisSuit,
          };
          // Remove the index so it cannot be used again.
          openIndexes.splice(randomIndex, 1);
        }
      }
    }
  }

  public deal(handCount: number): Card[][]  {

    // Establish the array of hands to return.
    let hands: Card[][] = [];

    // Determine the number of cards to place in each hand.
    const cardsPerHand = Math.floor(this.cardCount / handCount);

    for (let i = 0; i < handCount; i++) {
      const thisHand = this.shuffledCards.splice(0, cardsPerHand);
      hands.push(thisHand);
    }

    return hands;

  }
}