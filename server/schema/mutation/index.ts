import { GraphQLObjectType } from "graphql";
import { createPlayer } from "./createPlayer";
import { createGame } from "./createGame";
import { startGame } from "./startGame";
import { startNewRound } from "./startNewRound";
import { addPlayerToGame } from "./addPlayerToGame";
import {  logMessage } from "./logAction";
import { playTurn } from "./playTurn";
import { passCardsToPlayer } from "./passCards";
import { GraphQlContext } from "../..";

export const mutation = new GraphQLObjectType<null, GraphQlContext>({
  name: "Mutation",
  description: "Top level mutation node.",
  fields: {
    addPlayerToGame,
    createPlayer,
    createGame,
    startGame,
    logAction: logMessage,
    playTurn,
    startNewRound,
    passCardsToPlayer,
  },
});