import { GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { Rank } from "./deck";

export const GqlRank = new GraphQLObjectType<Rank, {}>({
  name: "Rank",
  description: "A single rank, its alias, and numeric value.",
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The name of the rank",
      resolve: ({ name }) => name,
    },
    alias: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The alias of the rank",
      resolve: ({ alias }) => alias,
    },
    rank: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The number value of the rank",
      resolve: ({ rank }) => rank,
    },
  },
});