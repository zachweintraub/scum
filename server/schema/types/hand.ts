import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
import { GqlCard } from "./card";

export const GqlHand = new GraphQLObjectType<ScumDb.HandDBO, GraphQlContext>({
  name: "Hand",
  description: "The cards in a player's hand",
  fields: {
    playerId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The player to whom this hand belongs",
      resolve: ({ playerId }) => playerId,
    },
    readyToPlay: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Will be false if the player needs to trade cards",
      resolve: ({ readyToPlay }) => readyToPlay,
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