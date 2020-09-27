import { GraphQLNonNull, GraphQLObjectType } from "graphql";
import { Card } from "./deck";
import { GqlRank } from "./rank";
import { GqlSuit } from "./suit";

export const GqlCard = new GraphQLObjectType<Card, {}>({
  name: "Card",
  description: "A single standard playing card.",
  fields: {
    rank: {
      type: new GraphQLNonNull(GqlRank),
      description: "The common name of the card (i.e. Queen)",
      resolve: ({ rank }) => rank,
    },
    suit: {
      type: new GraphQLNonNull(GqlSuit),
      description: "The suit of the card (i.e. Hearts)",
      resolve: ({ suit }) => suit,
    },
  }
});