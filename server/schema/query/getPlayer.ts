import { GraphQLError, GraphQLFieldConfig, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
import { GqlPlayer } from "../types/player";

export type GetPlayerArgs = {
  id?: string;
  name?: string;
};

export const getPlayer: GraphQLFieldConfig<null, GraphQlContext, GetPlayerArgs> = {
  type: GqlPlayer,
  description: "Fetch one or more players by ID.",
  args: {
    id: {
      type: GraphQLString,
      description: "The ID of the desired player",
    },
    name: {
      type: GraphQLString,
      description: "The name of the desired player",
    },
  },
  async resolve(_, { id, name }, { scumDb }) {
    let player: ScumDb.PlayerDBO | null = null;
    try {
      if (id) {
        player = await scumDb.getPlayerById(id);
      } else if (name) {
        player = await scumDb.getPlayerByName(name);
      }
    } catch (err) {
      console.log(err);
      throw new GraphQLError("Error fetching player from the DB");
    }
    if (!!player) {
      return player;
    } else {
      throw new GraphQLError("No player found for given parameters");
    }
  },
};