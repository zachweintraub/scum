import { GraphQLObjectType } from "graphql";
import { getPlayers } from "./getPlayers";
import { getOpenGames } from "./getOpenGames";
import { getGame } from "./getGame";
import { GraphQlContext } from "../..";

export const query = new GraphQLObjectType<null, GraphQlContext>({
  name: "Query",
  description: "Top level query node.",
  fields: {
    game: getGame,
    players: getPlayers,
    openGames: getOpenGames,
  },
});