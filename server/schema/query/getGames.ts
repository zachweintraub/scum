import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLList, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { GqlGame } from "../types/game";

export type GetGamesArgs = {
  openOnly?: boolean;
  playerId?: string;
};

export const getGames: GraphQLFieldConfig<null, GraphQlContext, GetGamesArgs> = {
  type: new GraphQLList(GqlGame),
  description: "Get all games that are not active (they haven't started).",
  args: {
    openOnly: {
      type: GraphQLBoolean,
      description: "If true, will simply return all open games",
    },
    playerId: {
      type: GraphQLString,
      description: "If true, will return games of any status that include this player",
    },
  },
  async resolve(src, { openOnly, playerId }, { scumDb }) {
    try {
      if (openOnly) {
        return await scumDb.getOpenGames();
      }
      if (playerId) {
        return await scumDb.getGamesForPlayer(playerId);
      }
      return await scumDb.getAllGames();
    } catch (err) {
      throw new GraphQLError(`Error fetching open games from the DB: ${err}`);
    }
  },
};