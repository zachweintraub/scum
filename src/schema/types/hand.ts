import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { resolve } from "path";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
import { GqlCard } from "./card";
import { GqlPlayer } from "./player";

export const GqlHand = new GraphQLObjectType<ScumDb.HandDBO, GraphQlContext>({
  name: "Hand",
  description: "The cards in a player's hand",
  fields: {
    playerId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The player to whom this hand belongs",
      resolve: ({ playerId }) => playerId,
    },
    cards: {
      type: new GraphQLNonNull(new GraphQLList(GqlCard)),
      resolve: ({ cards }) => cards,
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({ isActive }) => !!isActive,
    },
    hasPassed: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: ({ hasPassed }) => !!hasPassed,
    },
    startRank: {
      type: GraphQLInt,
      resolve: ({ startRank }) => startRank,
    },
    endRank: {
      type: GraphQLInt,
      resolve: ({ endRank }) => endRank,
    },
  },
});