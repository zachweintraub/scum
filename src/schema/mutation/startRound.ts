import { GraphQLFieldConfig, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { GqlHand } from "../types/hand";
import { Deck } from "../types/deck";

type Args = {
  deckCount: number,
  playerCount: number, 
};

export const startRound: GraphQLFieldConfig<null, null, Args> = {
  type: new GraphQLNonNull(new GraphQLList(GqlHand)),
  description: "Creates a new round by shuffling the appropriate number of cards into the desired number of hands",
  args: {
    deckCount: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    playerCount: {
      type: new GraphQLNonNull(GraphQLInt),
    }
  },
  resolve(src, { deckCount, playerCount }) {
    const deck = new Deck(deckCount);
    return deck.shuffleAndDeal(playerCount);
  }
};