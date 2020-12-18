import { GraphQLError, GraphQLFieldConfig, GraphQLList, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { GqlPlayer } from "../types/player";

type Args = {
  ids: string[];
};

export const getPlayers: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLList(GqlPlayer),
  description: "Fetch one or more players by ID.",
  args: {
    ids: {
      type: new GraphQLList(GraphQLString),
      description: "Fetch one or more players from the DB.",
    },
  },
  async resolve(_, { ids }, { scumDb }) {
    try {
      return await scumDb.getPlayers(ids);
    } catch (err) {
      throw new GraphQLError(`Error fetching players from the DB: ${err}`);
    }
  },
};