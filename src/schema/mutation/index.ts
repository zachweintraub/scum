import { GraphQLObjectType } from "graphql";
import { startRound } from "./startRound";
import { createPlayer } from "./createPlayer";
import { createGame } from "./createGame";
import { addPlayerToGame } from "./addPlayerToGame";

export const mutation = new GraphQLObjectType<null, null>({
  name: "Mutation",
  description: "Top level mutation node.",
  fields: {
    addPlayerToGame,
    createPlayer,
    createGame,
    startRound,
  },
});