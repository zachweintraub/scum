import { GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { GqlGame } from "../types/game";

type Args = {
  id: string;
};

export const getGame: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: GqlGame,
  description: "Get a specific game",
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the game to fetch.",
    },
  },
  async resolve(src, { id }, { scumDb }) {
    try {
      return await scumDb.getGame(id);
    } catch (err) {
      throw new GraphQLError(`Error fetching open games from the DB: ${err}`);
    }
  },
};