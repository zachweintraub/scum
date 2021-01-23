import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { Deck } from "../types/deck";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";

type Args = {
  gameId: string,
};

export const startNewRound: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: "Start a new round within an existing game",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the game",
    },
  },
  async resolve(_, { gameId }, { scumDb, publishUpdate }) {
    try {
      // First of all, grab the game from the DB
      const game = await scumDb.getGame(gameId);
      // If the game doesn't exist, can't start it
      if (!game) {
        throw new Error(`Failed to find game in the DB`);
      }
      // Now grab the rounds from the DB
      const rounds = await scumDb.getRounds(game._id);
      let previousRound: ScumDb.RoundDBO | null = null;
      for (const round of rounds) {
        if (!round.endedAt) {
          throw new Error("another round has not ended");
        }
        if (!previousRound || (previousRound.endedAt && round.endedAt > previousRound.endedAt)) {
          previousRound = round;
        }
      }

      if (!previousRound) {
        throw new Error("no previous round could be determined");
      }

      let playerRankLookup: { [ key: string ]: number } = {};
      let allRanks: number[] = [];

      for (const hand of previousRound.hands) {
        if (!hand.endRank) {
          throw new Error(`player ${hand.playerId} was not assigned a rank in the previous round`);
        }
        playerRankLookup[hand.playerId] = hand.endRank;
        allRanks.push(hand.endRank);
      }

      allRanks.sort();

      const neutralRank = allRanks.length % 2 === 1
        ? allRanks[Math.floor(allRanks.length / 2)]
        : null;

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
      for (let i = 0; i < game.playerIds.length; i++) {
        const cards = hands[i];
        const playerId = game.playerIds[i];
        const startRank = playerRankLookup[playerId];
        const isFirst = startRank === allRanks[allRanks.length - 1];
        newRound.hands.push({
          playerId,
          cards,
          isActive: isFirst,
          hasPassed: false,
          startRank,
          readyToPlay: startRank === neutralRank,
        });
      }

      // Add the excess cards if they exist
      if (!!excessCards) {
        newRound.excessCards = excessCards;
      }

      // Add the round to the game
      const roundCreated = await scumDb.createRound(newRound);
      await publishUpdate(gameId);
      return roundCreated;
    } catch (err) {
      throw new GraphQLError(`There was an issue adding a new round for game ${gameId}: ${err}`);
    }
  },
};