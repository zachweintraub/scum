import { GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { GqlPlayer } from "../types/player";

type Args = {
  name: string;
};

export const createPlayer: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GqlPlayer),
  description: "Creates a new round by shuffling the appropriate number of cards into the desired number of hands",
  args: {
    name: {
      type: GraphQLString,
      description: "The player's name.",
    },
  },
  async resolve(_, { name }, { scumDb }) {
    try {
      const player = await scumDb.createPlayer(name);
      return player;
    } catch (err) {
      throw new GraphQLError(`Unable to create new user: ${err}`);
    }
  },
};