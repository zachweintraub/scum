import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";

type Args = {
  gameId: string;
  message: string;
};

export const logMessage: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: "Logs a message in the game's action log",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The game in which to log this message",
    },
    message: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The message to log",
    },
  },
  async resolve(_, { gameId, message }, { scumDb, publishUpdate }) {
    try {
      const success = await scumDb.logAction(gameId, message);
      publishUpdate(gameId);
      return success;
    } catch (err) {
      throw new GraphQLError(`Unable to create new user: ${err}`);
    }
  },
};