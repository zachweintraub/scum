import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ScumDb } from "../../services/scumDb";
import { GqlCard } from "./card";
import { GraphQLDate } from "graphql-iso-date"

export const GqlTurn = new GraphQLObjectType<ScumDb.TurnDBO, {}>({
  name: "Turn",
  description: "A turn that has been played into the pile",
  fields: {
    cards: {
      type: new GraphQLList(GqlCard),
      description: "The cards that were played",
      resolve: ({ cards }) => cards,
    },
    playerId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the player who played this turn",
      resolve: ({ playerId }) => playerId,
    },
    playedAt: {
      type: GraphQLDate,
      description: "The time at which this turn was played",
    },
    tookThePile: {
      type: GraphQLBoolean,
      description: "True if this was the last turn played before the pile was reset",
      resolve: ({ tookThePile }) => tookThePile ?? false,
    },
  },
});