import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { Deck } from "../types/deck";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";

type Args = {
  gameId: string,
};

export const startGame: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: "Starts an existing game and creates the first round",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the game we're about to start.",
    },
  },
  async resolve(_, { gameId }, { scumDb, publishUpdate }) {
    try {
      // First of all, grab the game from the DB
      const game = await scumDb.getGame(gameId);
      // If the game doesn't exist, can't start it
      if (!game) {
        throw new Error("Failed to find this game in the DB :(");
      }
      // Now get the players out
      const { playerIds } = game;
      // If there aren't enough players, can't start the game
      if (game.playerIds.length < 3) {
        throw new Error("Cannot start a game with fewer than three players :(");
      }
      // Also can't start a game that's already started
      if (!!game.startedAt) {
        throw new Error("This game has already started!");
      }
      // Get a new deck for this game and deal it out into hands
      const deck = new Deck(game.gameConfig.deckCount);
      const { hands, excessCards } = deck.shuffleAndDeal(game.playerIds.length);
      const newRound: Omit<ScumDb.RoundDBO, "_id"> = {
        gameId: game._id,
        hands: [],
        discardPile: [],
        activePile: [],
      };
      // Loop over the players and give them a hand
      for (let i = 0; i < playerIds.length; i++) {
        const cards = hands[i];
        const isFirst = !!cards.find(c => c.alias === "3S");
        newRound.hands.push({
          playerId: playerIds[i],
          cards,
          readyToPlay: true,
          isActive: isFirst,
          hasPassed: false,
        });
      }
      // Add the excess cards if they exist
      if (!!excessCards) {
        newRound.excessCards = excessCards;
      }
      // Add the round to the game
      const gameStarted = await scumDb.startGame(gameId, newRound);
      await publishUpdate(gameId);
      return gameStarted;
    } catch (err) {
      throw new GraphQLError(`There was an issue starting game ${gameId}: ${err}`);
    }
  },
};