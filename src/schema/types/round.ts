import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
// import { GraqphQLDateTime } from "graphql-iso-date";
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
    activePile: {
      type: new GraphQLList(GqlCard),
      description: "The pile of cards being played",
      resolve: ({ activePile }) => activePile ?? [],
    },
    discardPile: {
      type: new GraphQLList(GqlCard),
      description: "The pile of cards already played",
      resolve: ({ discardPile }) => discardPile ?? [],
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