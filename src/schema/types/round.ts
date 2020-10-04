import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GraqphQLDateTime } from "graphql-iso-date";
import { ScumDb } from "../../services/scumDb";
import { GqlCard } from "./card";
import { GqlHand } from "./hand";

export const GqlRound = new GraphQLObjectType<ScumDb.RoundDBO, {}>({
  name: "Round",
  description: "A round in the game",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The DB ID of the round",
      resolve: ({ _id }) => _id,
    },
    hands: {
      type: new GraphQLNonNull(new GraphQLList(GqlHand)),
      description: "The hands in this round",
      resolve: ({ hands }) => hands,
    },
    pile: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      description: "The pile of cards being played",
      resolve: ({ pile }) => pile ?? [],
    },
    excessCards: {
      type: new GraphQLList(GqlCard),
      description: "The leftover cards that weren't dealt into a hand",
      resolve: ({ excessCards }) => excessCards,
    },
    // startedAt: {
    //   type: GraqphQLDateTime,
    //   description: "The time at which this round started",
    //   resolve: ({ startedAt }) => startedAt,
    // },
    // endedAt: {
    //   type: GraqphQLDateTime,
    //   description: "The time at which this round ended",
    //   resolve: ({ endedAt }) => endedAt,
    // },
  },
});