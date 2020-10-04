import { GraphQLObjectType, GraphQLString } from "graphql";
import { getPlayers } from "./getPlayers";
import { getOpenGames } from "./getOpenGames";

export const query = new GraphQLObjectType<null, null>({
  name: "Query",
  description: "Top level query node.",
  fields: {
    helloWorld: {
      description: "Say hello",
      type: GraphQLString,
      resolve() {
        return "Hello world!";
      },
    },
    players: getPlayers,
    openGames: getOpenGames,
  },
});