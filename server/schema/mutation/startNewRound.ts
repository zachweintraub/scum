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
      const rounds = await scumDb.getRounds(gameId);

      // Establish a variable to hold the previous round
      let previousRound: ScumDb.RoundDBO | null = null;

      // Loop over other rounds to ensure they've all ended and find the most recent
      for (const round of rounds) {
        // Throw an error if another is still in progress
        if (!round.endedAt) {
          throw new Error("another round has not ended");
        }
        // If no previous round has been set or the one that has ended before this one, this is the new previous round
        if (!previousRound || (previousRound.endedAt && round.endedAt > previousRound.endedAt)) {
          previousRound = round;
        }
      }

      // if no previous round was identified, that's a problem
      if (!previousRound) {
        throw new Error("no previous round could be determined");
      }

      // Set up a lookup to get player's previous ranks
      let playerRankLookup: { [ key: string ]: number } = {};
      // And an array to contain all of the ranks
      let allRanks: number[] = [];

      // Loop over the hands in the previous round and pull out everyone's rank
      for (const hand of previousRound.hands) {
        // Throw an error if someone didn't get ranked
        if (typeof hand.endRank !== "number") {
          throw new Error(`player ${hand.playerId} was not assigned a rank in the previous round`);
        }
        // Store their rank in the lookup
        playerRankLookup[hand.playerId] = hand.endRank;
        // Add it to the ranks array
        allRanks.push(hand.endRank);
      }

      // Sort the ranks
      allRanks.sort();

      // Make a new array to hold neutral ranks
      let neutralRanks: number[] = [];

      // If three players, just set the middle rank as neutral
      if (allRanks.length < 4) {
        neutralRanks = [1];
      } else {
        // Loop over the other ranks and call it neutral if not in the top/bottom two
        for (let i = 0; i < allRanks.length; i++) {
          if (i > 1 && i < allRanks.length - 2) {
            neutralRanks.push(allRanks[i]);
          }
        }
      }

      // Get a new deck for this game and deal it out into hands
      const deck = new Deck(game.gameConfig.deckCount);
      const { hands, excessCards } = deck.shuffleAndDeal(game.playerIds.length);

      // Create the new round minus ID
      const newRound: Omit<ScumDb.RoundDBO, "_id"> = {
        gameId: game._id,
        hands: [],
        discardPile: [],
        activePile: [],
      };

      // Loop over the players and give them a hand
      for (let i = 0; i < game.playerIds.length; i++) {
        // Grab the cards they'll receive
        const cards = hands[i];
        // Grab a player
        const playerId = game.playerIds[i];
        // Look up their previous rank
        const startRank = playerRankLookup[playerId];
        // Set them up to go first if they are ranked last
        const isFirst = startRank === allRanks[allRanks.length - 1];
        // Add the hand
        newRound.hands.push({
          playerId,
          cards,
          isActive: isFirst,
          hasPassed: false,
          startRank,
          // If they are neutral, they are ready to play from the start
          readyToPlay: neutralRanks.includes(startRank),
        });
      }

      // Add the excess cards if they exist
      if (!!excessCards) {
        newRound.excessCards = excessCards;
      }

      // Add the round to the game
      const roundCreated = await scumDb.createRound(newRound);
      await scumDb.logAction(gameId, "a new round begins!");
      // Publish the event
      await publishUpdate(gameId);
      // Return true/false
      return roundCreated;
    } catch (err) {
      throw new GraphQLError(`There was an issue adding a new round for game ${gameId}: ${err}`);
    }
  },
};