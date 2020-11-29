import { GraphQLObjectType, GraphQLString } from "graphql";
import { getPlayers } from "./getPlayers";
import { getOpenGames } from "./getOpenGames";
import { getGame } from "./getGame";

export const query = new GraphQLObjectType<null, null>({
  name: "Query",
  description: "Top level query node.",
  fields: {
    game: getGame,
    players: getPlayers,
    openGames: getOpenGames,
  },
});