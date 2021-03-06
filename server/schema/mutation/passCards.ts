import { GraphQLError, GraphQLFieldConfig, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { passCards } from "../../utils/helpers";
import { GqlRound } from "../types/round";

export type PassCardsArgs = {
  gameId: string;
  givingPlayerId: string;
  receivingPlayerId: string;
  cardsToPass: string[];
};

export const passCardsToPlayer: GraphQLFieldConfig<null, GraphQlContext, PassCardsArgs> = {
  type: GqlRound,
  description: "Pass cards from one player to another",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the game",
    },
    givingPlayerId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the player giving the cards",
    },
    receivingPlayerId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the player receiving the cards",
    },
    cardsToPass: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
      description: "The cards being passed",
    },
  },
  async resolve(_, {
    gameId,
    givingPlayerId,
    receivingPlayerId,
    cardsToPass,
  }, { scumDb, publishUpdate }) {
    try {

      // Grab the game's rounds from the DB
      const rounds = await scumDb.getRounds(gameId);

      // Grab the two players so we know their names
      const players = await scumDb.getPlayers([givingPlayerId, receivingPlayerId]);
      const givingPlayer = players.find(p => p._id.toHexString() === givingPlayerId);
      const receivingPlayer = players.find(p => p._id.toHexString() === receivingPlayerId);

      if (!givingPlayer || !receivingPlayer) {
        throw new Error("unable to retrieve giving or receiving player from DB");
      }

      // Grab the current round of this game
      let currentRound = rounds.find(r => {
        return !!r.startedAt && !r.endedAt;
      });

      // if no previous round was identified, that's a problem
      if (!currentRound) {
        throw new Error("no current round could be determined");
      }

      // Alter the current round by passing the cards and setting the giving player as "ready"
      currentRound = passCards(
        currentRound,
        givingPlayerId,
        receivingPlayerId,
        cardsToPass,
      );

      // Update the round in the DB
      const cardsPassedSuccessful = await scumDb.updateRound(currentRound);
      // Broadcast the fact that the game has changed
      await scumDb.logAction(gameId, `${givingPlayer.name} passed ${cardsToPass.length} card${cardsToPass.length > 1 ? "s" : ""} to ${receivingPlayer.name}`);
      await publishUpdate(gameId);

      // Return the result (true)
      return cardsPassedSuccessful;

    } catch (err) {
      throw new GraphQLError(`There was an issue passing cards from player ${givingPlayerId} in game ${gameId}: ${err}`);
    }
  },
};