import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { Card } from "./deck";

export const GqlCard = new GraphQLObjectType<Card, {}>({
  name: "Card",
  description: "A single standard playing card.",
  fields: {
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The numeric value of the card in the context of scum rules",
      resolve: ({ rank }) => rank,
    },
    fullName: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The full name of the card (i.e. Queen of Hearts)",
      resolve: ({ fullName }) => fullName,
    },
    alias: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The alias of the card (i.e. QH)",
      resolve: ({ alias }) => alias,
    },
  },
});