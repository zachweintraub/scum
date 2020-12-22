import { GraphQLObjectType, GraphQLString } from "graphql";
import { getPlayers } from "./getPlayers";
import { getGames } from "./getGames";
import { getGame } from "./getGame";
import { GraphQlContext } from "../..";
import { getPlayer } from "./getPlayer";

export const query = new GraphQLObjectType<null, GraphQlContext>({
  name: "Query",
  description: "Top level query node.",
  fields: {
    game: getGame,
    players: getPlayers,
    player: getPlayer,
    games: getGames,
    helloWorld: {
      type: GraphQLString,
      resolve: () => "HELLO WORLD",
    },
  },
});