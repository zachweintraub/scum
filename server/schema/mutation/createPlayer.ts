import { GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
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
    let existingPlayer: ScumDb.PlayerDBO | null = null;
    try {
      existingPlayer = await scumDb.getPlayerByName(name);
    } catch (err) {
      throw new GraphQLError("Error creating user in the DB");
    }
    if (existingPlayer) {
      throw new GraphQLError("A player with this name already exists!");
    }
    try {
      const player = await scumDb.createPlayer(name);
      return player;
    } catch (err) {
      throw new GraphQLError("Error creating user in the DB");
    }
  },
};