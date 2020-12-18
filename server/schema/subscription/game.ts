import { GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { GAME_UPDATED } from "../../utils/publishUpdate";
import { withFilter } from "apollo-server-express";
import { GqlGame } from "../types/game";

type Args = {
  id: string;
};

export const game: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: GqlGame,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the game to which we are subscribing",
    },
  },
  description: "Subscribes to a single game by ID",
  subscribe: withFilter(
    (root, { id }, { pubsub }) => pubsub.asyncIterator(GAME_UPDATED),
    ({ game }, { id }, ctx) => {
      return game._id.toHexString() === id;
    },
  ),
};