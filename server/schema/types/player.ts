import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ScumDb } from "../../services/scumDb";

export const GqlPlayer = new GraphQLObjectType<ScumDb.PlayerDBO, {}>({
  name: "Player",
  description: "A player in the game.",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The DB ID of the player.",
      resolve: ({ _id }) => _id,
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The player's name.",
      resolve: ({ name }) => name,
    },
  },
});