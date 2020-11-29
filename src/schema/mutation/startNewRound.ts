import { GraphQLFieldConfig, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GqlHand } from "../types/hand";
import { Deck } from "../types/deck";

type Args = {
  gameId: string;
};

export const startNewRound: GraphQLFieldConfig<null, null, Args> = {
  type: new GraphQLNonNull(new GraphQLList(GqlHand)),
  description: "Creates a new round by shuffling the appropriate number of cards into the desired number of hands",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The game for which to start a new round.",
    }
  },
  resolve(src, { gameId }) {
    return;
  }
};