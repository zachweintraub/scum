export type Suit = {
  name: string,
  alias: string,
};

export type Rank = Suit & {
  rank: number,
};

export type Card = {
  fullName: string,
  alias: string,
  rank: number,
};

export class Deck {

  private allCards: Card[] = [];

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
        // Loop over the ranks...
    for (let i = 0; i < this.ranks.length; i++) {
      const thisRank = this.ranks[i];
      // Within this rank, loop over the suits...
      for (let j = 0; j < this.suits.length; j++) {
        const thisSuit = this.suits[j];
        // This rank + this suit is one card - add once per deck we are using.
        for (let k = 0; k < deckCount; k++) {
          // Add it to the allCards array
          this.allCards.push({
            // Set the rank to highest for the three of clubs.
            rank: thisRank.alias === "3" && thisSuit.alias === "C" ? 13 : thisRank.rank,
            alias: thisRank.alias + thisSuit.alias,
            fullName: `${thisRank.name} of ${thisSuit.name}`,
          });
        }
      }
    }
  }

  /**
   * Pass in a number of hands to deal and return an array of randomly selected hands
   */
  public shuffleAndDeal(handCount: number): Card[][]  {

    // Establish the array of hands to return.
    let hands: Card[][] = [];

    // Determine the number of cards to place in each hand.
    const cardsPerHand = Math.floor(this.allCards.length / handCount);

    // Loop over the number of hands to create
    for (let i = 0; i < handCount; i++) {
      let thisHand: Card[] = [];
      // Loop over the number of cards per hand
      for (let j = 0; j < cardsPerHand; j++) {
        // Establish a random index
        const randomIndex = Math.floor(Math.random() * this.allCards.length);
        // Pull the card at that index
        const thisCard = this.allCards.splice(randomIndex, 1);
        // Add it to the current hand being built
        thisHand.push(...thisCard);
      }
      // Add the hand we just built to the array of hands being dealt
      hands.push(thisHand);
    }

    return hands;

  }
}