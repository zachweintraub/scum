import { GraphQLObjectType } from "graphql";
import { startNewRound } from "./startNewRound";
import { createPlayer } from "./createPlayer";
import { createGame } from "./createGame";
import { startGame } from "./startGame";
import { addPlayerToGame } from "./addPlayerToGame";
import {  logMessage } from "./logAction";
import { playTurn } from "./playTurn";

export const mutation = new GraphQLObjectType<null, null>({
  name: "Mutation",
  description: "Top level mutation node.",
  fields: {
    addPlayerToGame,
    createPlayer,
    createGame,
    startGame,
    startRound: startNewRound,
    logAction: logMessage,
    playTurn,
  },
});