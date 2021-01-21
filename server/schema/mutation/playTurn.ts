import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";
import { clearPile, getNextHandIndex, getNextRank, getPlayerName, lastPlayShouldClearPile, playFromHandToPile, resetHasPassedFlags, roundShouldEnd } from "../../utils/helpers";

type Args = {
  gameId: string;
  playerId: string;
  cardsToPlay?: string[]; 
};

export const playTurn: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: "Plays a turn in a game",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The game in which to play this turn.",
    },
    playerId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the player.",
    },
    cardsToPlay: {
      type: new GraphQLList(GraphQLString),
      description: "The cards that the player is adding to the pile.",
    },
  },
  async resolve(_, { gameId, playerId, cardsToPlay }, { scumDb, publishUpdate }) {
    // Grab the game from the DB
    const game = await scumDb.getGame(gameId);
    // If the game doesn't exist, that's bad
    if (!game) {
      throw new GraphQLError(`OH NO! No game found with ID ${gameId}`);
    }
    const rounds = await scumDb.getRounds(game._id);
    if (!rounds) {
      throw new GraphQLError(`OH NO! No rounds found for game ${gameId}`);
    }
    // Grab the players from the game object
    const players = game.gamePlayers;
    
    // Get the current player's name
    let playerName = getPlayerName(players, playerId);

    // Grab the current round of this game
    let currentRound = rounds.find(r => {
      return !!r.startedAt && !r.endedAt;
    });
    // If there is no current round, something is very wrong
    if (!currentRound) {
      throw new GraphQLError(`OH NO! No active round found for game ${gameId}`);
    }
    // Identify the hand of the player taking this turn
    let targetHandIndex: number =  -1;
    for (let i = 0; i < currentRound.hands.length; i++) {
      if (currentRound.hands[i].playerId == playerId) {
        if (!currentRound.hands[i].isActive) {
          throw new GraphQLError(`It is not player ${playerId}'s turn!`);
        }
        targetHandIndex = i;
        break;
      }
    }
    // Throw an error if no hand found
    if (targetHandIndex < 0) {
      console.log(currentRound.hands);
      throw new GraphQLError(`No hand found for player ${playerId}!`);
    }
    // If there are no cards to play, play them
    if (!!cardsToPlay && cardsToPlay.length > 0) {
      // Make the current play
      currentRound = playFromHandToPile(currentRound, cardsToPlay, targetHandIndex, playerId);
      scumDb.logAction(gameId, `${playerName} throws down: ${cardsToPlay.join(", ")}`);
      // Check to see if that play cleared the pile
      const clearPileReason = lastPlayShouldClearPile(currentRound.activePile, game.gameConfig);
      // If so, do it and log a message
      if (!!clearPileReason) {
        // Clear the pile
        currentRound = clearPile(currentRound);
        // Set everyone else to pass by default
        for (let i = 0; i < currentRound.hands.length; i++) {
          if (currentRound.hands[i].playerId !== playerId) {
            currentRound.hands[i].hasPassed = true;
          }
        }
        // Log the action
        scumDb.logAction(gameId, `${playerName} takes the pile with ${clearPileReason}!`);
      }
      if (currentRound.hands[targetHandIndex].cards.length === 0) {
        currentRound.hands[targetHandIndex].endRank = getNextRank(currentRound.hands);
        scumDb.logAction(gameId, `${playerName} is out of cards!`);
      }
    // No cards to play, it's a pass
    } else {
      currentRound.hands[targetHandIndex].hasPassed = true;
      scumDb.logAction(gameId, `${playerName} passes :(`);
    }
    // The play has been made, undo the active player's active status
    currentRound.hands[targetHandIndex].isActive = false;
    // If the round should end, do it
    if (roundShouldEnd(currentRound)) {
      // Make sure all players have a rank
      for (let i = 0; i < currentRound.hands.length; i++) {
        if (!currentRound.hands[i].endRank) {
          currentRound.hands[i].endRank = getNextRank(currentRound.hands);
        }
      }
      // Set the round's end date
      currentRound.endedAt = new Date().toISOString();
    // Else, the round should continue...
    } else {
      let nextHandIndex = getNextHandIndex(currentRound.hands, targetHandIndex);

      // If no one was determined eligible, reset some things and try again
      if (nextHandIndex === -1) {
        // currentRound = clearPile(currentRound);
        currentRound = resetHasPassedFlags(currentRound);
        nextHandIndex = getNextHandIndex(currentRound.hands, targetHandIndex);
        if (nextHandIndex === -1) {
          throw new GraphQLError(`Unable to determine a next step in game ${gameId}`);
        }
      }
      currentRound.hands[nextHandIndex].isActive = true;
      playerName = getPlayerName(players, currentRound.hands[nextHandIndex].playerId);

      // If the next player was responsible for the last turn in the pile, 
      // OR if the next player was also the previous player,
      // Reset the pile and undo everyone's hasPassed flag
      if (
        (currentRound.activePile.length > 0
        && currentRound.hands[nextHandIndex].playerId === currentRound.activePile[currentRound.activePile.length - 1].playerId.toHexString())
        || nextHandIndex === targetHandIndex
      ) {
        currentRound = clearPile(currentRound);
        currentRound = resetHasPassedFlags(currentRound);
      }
    }
    // Update the round
    try {
      const success = await scumDb.updateRound(currentRound);
      publishUpdate(gameId);
      await scumDb.logAction(gameId, `it's ${playerName}'s turn!`);
      return success;
    } catch (err) {
      throw new GraphQLError(`An error occurred while updating the round for game ${gameId}: ${err}`);
    }
  },
};