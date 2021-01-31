import { GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { ActionLogItem } from "../types/actionLogItem";

export type LogMessageArgs = {
  gameId: string;
  message: string;
};

export const logMessage: GraphQLFieldConfig<null, GraphQlContext, LogMessageArgs> = {
  type: new GraphQLNonNull(ActionLogItem),
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
      const action = await scumDb.logAction(gameId, message);
      publishUpdate(gameId);
      return action;
    } catch (err) {
      throw new GraphQLError(`Unable to create new user: ${err}`);
    }
  },
};