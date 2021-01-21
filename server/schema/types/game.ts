import { GraphQLError, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ScumDb } from "../../services/scumDb";
import { GqlPlayer } from "./player";
import { GraphQlContext } from "../../index";
import { GraphQLDateTime } from "graphql-iso-date";
import { GqlGameConfig } from "./gameConfig";
import { ActionLogItem } from "./actionLogItem";
import { GqlRound } from "./round";

export const GqlGame = new GraphQLObjectType<ScumDb.GameDBO, GraphQlContext>({
  name: "Game",
  description: "A game!",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The DB ID of the game.",
      resolve: ({ _id }) => _id,
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The game's name.",
      resolve: ({ name }) => name,
    },
    host: {
      type: new GraphQLNonNull(GqlPlayer),
      description: "The host of the game",
      async resolve({ hostId }, _, { scumDb }) {
        try {
          const host = await scumDb.getPlayerById(hostId);
          if (!host) {
            throw new Error(`No player found for ID ${hostId}`);
          }
          return host;
        } catch (err) {
          throw new GraphQLError(`Unable to resolve game host: ${err}`);
        }
      },
    },
    players: {
      type: new GraphQLNonNull(new GraphQLList(GqlPlayer)),
      description: "All of the players in the game.",
      resolve: ({ gamePlayers }) => gamePlayers,
    },
    rounds: {
      type: new GraphQLList(GqlRound),
      description: "The rounds of this game",
      async resolve({ _id }, _, { scumDb }) {
        try {
          return await scumDb.getRounds(_id);
        } catch(err) {
          throw new GraphQLError(`Unable to get rounds for game ${_id}: ${err}`);
        }
      },
    },
    gameConfig: {
      type: new GraphQLNonNull(GqlGameConfig),
      description: "The game settings",
      resolve: ({ gameConfig }) => gameConfig,
    },
    actionLog: {
      type: new GraphQLList(ActionLogItem),
      description: "The game's action and message log",
      resolve: ({  actionLog }) => actionLog,
    },
    createdAt: {
      type: GraphQLDateTime,
      description: "The time at which the game was created.",
      resolve: ({ createdAt }) => createdAt,
    },
    startedAt: {
      type: GraphQLDateTime,
      description: "The time at which the game started.",
      resolve: ({ startedAt }) => startedAt,
    },
    endedAt: {
      type: GraphQLDateTime,
      description: "The time at which the game ended.",
      resolve: ({ endedAt }) => endedAt,
    },
  },
});