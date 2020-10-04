import { GraphQLObjectType } from "graphql";
import { startRound } from "./startRound";
import { createPlayer } from "./createPlayer";
import { createGame } from "./createGame";

export const mutation = new GraphQLObjectType<null, null>({
  name: "Mutation",
  description: "Top level mutation node.",
  fields: {
    createPlayer,
    createGame,
    startRound,
  },
});