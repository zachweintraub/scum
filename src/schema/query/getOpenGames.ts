import { GraphQLError, GraphQLFieldConfig, GraphQLList } from "graphql";
import { GraphQlContext } from "../..";
import { GqlGame } from "../types/game";

type Args = {};

export const getOpenGames: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLList(GqlGame),
  description: "Get all games that are not active (they haven't started).",
  async resolve(src, args, { scumDb }) {
    try {
      return await scumDb.getOpenGames();
    } catch (err) {
      throw new GraphQLError(`Error fetching players from the DB: ${err}`);
    }
  }
};