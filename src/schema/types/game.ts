import { GraphQLError, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ScumDb } from "../../services/scumDb";
import { GqlPlayer } from "../types/player";
import { GraphQlContext } from "../../index";
import { GraphQLDateTime } from "graphql-iso-date"
import { GqlGameConfig } from "./gameConfig";

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
          const host = await scumDb.getPlayer(hostId);
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
      async resolve({ _id, playerIds }, _, { scumDb }) {
        try {
          const players = await scumDb.getPlayers(playerIds);
          
          if (!Array.isArray(players)) {
            throw new Error(`No players found for game ${_id}`);
          }
          return players;
        } catch (err) {
          throw new GraphQLError(`Unable to resolve game players: ${err}`);
        }
      },
    },
    gameConfig: {
      type: new GraphQLNonNull(GqlGameConfig),
      description: "The game settings",
      resolve: ({ gameConfig }) => gameConfig,
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