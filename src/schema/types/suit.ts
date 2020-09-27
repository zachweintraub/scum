import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { Suit } from "./deck";

export const GqlSuit = new GraphQLObjectType<Suit, {}>({
  name: "Suit",
  description: "A single suit and its alias.",
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The name of the suit",
      resolve: ({ name }) => name,
    },
    alias: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The alias of the suit",
      resolve: ({ alias }) => alias,
    },
  },
});