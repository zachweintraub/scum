import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { ScumDb } from "../../services/scumDb";
import { GraphQlContext } from "../..";
import { ObjectID } from "mongodb";

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
  async resolve(_, { gameId, playerId, cardsToPlay }, { scumDb }) {
    // Grab the game from the DB
    const game = await scumDb.getGame(gameId);
    // If the game doesn't exist, that's bad
    if (!game) {
      throw new GraphQLError(`OH NO! No game found with ID ${gameId}`);
    }
    // Grab the players from the DB
    const players = await scumDb.getPlayers(game.playerIds);
    // Isolate the current one for now
    const player = players.find(p => p._id.toHexString() === playerId);
    // If the player doesn't exist, that's also bad
    if (!players || !player) {
      throw new GraphQLError(`OH NO! There was an issue getting the players for game ${gameId}`);
    }
    // Grab the player's name for logging actions
    const playerName = player.name ?? "UNKNOWN PLAYER";
    // Grab the current round of this game
    let currentRound = game.rounds.find(r => {
      return !!r.startedAt && !r.endedAt;
    });
    // If there is no current round, something is very wrong
    if (!currentRound) {
      throw new GraphQLError(`OH NO! No active round found for game ${gameId}`);
    }
    // Identify the hand of the player taking this turn
    let targetHandIndex: number | null =  null;
    for (let i = 0; i < currentRound.hands.length; i++) {
      if (currentRound.hands[i].playerId === playerId) {
        if (!currentRound.hands[i].isActive) {
          throw new GraphQLError(`It is not player ${playerId}'s turn!`);
        }
        targetHandIndex = i;
        break;
      }
    }
    // Throw an error if no hand found
    if (!targetHandIndex) {
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

      // If the next player was responsible for the last turn in the pile, reset it and undo everyone's passing flag
      if (
        currentRound.activePile.length > 0
        && currentRound.hands[nextHandIndex].playerId === currentRound.activePile[currentRound.activePile.length - 1].playerId.toHexString()
      ) {
        currentRound = clearPile(currentRound);
        currentRound = resetHasPassedFlags(currentRound);
      }
    }
    // Update the round
    try {
      const success = await scumDb.updateRound(gameId, currentRound);
      return success;
    } catch (err) {
      throw new GraphQLError(`An error occurred while updating the round for game ${gameId}: ${err}`);
    }
  }
};

/**
 * Takes a round, some cards to play, and the index + id of the player's hand
 * Mutates/returns the same round with the player's cards played into the round's active pile
 */
function playFromHandToPile(round: ScumDb.RoundDBO, cardsToPlay: string[], targetHandIndex: number, playerId: string): ScumDb.RoundDBO {
  // If there are no cards to play, it's a pass
  if (!cardsToPlay) {
    round.hands[targetHandIndex].hasPassed = true;
    return round;
  }
   // Otherwise, set up this play
   let thisPlay: ScumDb.CardDBO[] = [];
   // Loop through the cards to play
   for (const cardAlias of cardsToPlay) {
     // For each card to play, find it in the hand, remove it, and add it to this play
     for (let i = 0; i < round.hands[targetHandIndex].cards.length; i++) {
       const cardInHand = round.hands[targetHandIndex].cards[i];
       if (cardInHand.alias === cardAlias) {
         round.hands[targetHandIndex].cards.splice(i, 1);
         thisPlay.push(cardInHand);
         break;
       }
     }
   }
   // If the current play does not match up with the intended play, something went wrong
   if (thisPlay.length !== cardsToPlay.length) {
     throw new GraphQLError(`Unable to find one or more of the following cards in player ${playerId}'s hand: ${cardsToPlay.join(",")}`);
   }
   // Fill out some details for the current play
   let thisTurn: ScumDb.TurnDBO = {
     cards: thisPlay,
     playerId: new ObjectID(playerId),
     playedAt: new Date(),
   }
   // Add this turn to the pile
   round.activePile.push(thisTurn);
   return round;
}

function clearPile(round: ScumDb.RoundDBO) {
  // Create a new pile from the previous two
  const newDiscardPile = [
    ...round.discardPile,
    ...round.activePile,
  ];
  // Flag the final turn as having taken the pile
  newDiscardPile[newDiscardPile.length - 1].tookThePile = true;
  // Update both of the round's piles
  round.discardPile = newDiscardPile;
  round.activePile = [];
  return round;
}

function lastPlayShouldClearPile(activePile: ScumDb.TurnDBO[], gameConfig: ScumDb.GameConfigDBO): string | null {
  // Establish the rules
  const {  powerCard, explodePileCount } = gameConfig;
  const lastPlayedTurn = activePile[activePile.length - 1];

  // If the last played card is the power card by itself, return true
  if (
      lastPlayedTurn.cards.length === 1
      && lastPlayedTurn.cards[0].alias === powerCard.alias
    ) {
    return `the power card (${powerCard.alias})`;
  }

  // If the count to explode the pile is divisible by the number of cards in the current play, keep checking...
  if (explodePileCount % lastPlayedTurn.cards.length === 0) {
    // Grab the rank of the first card as our base rank to match
    let rankToMatch = lastPlayedTurn.cards[0].rank;
    // Helper function to determine if all cards in a turn have the same rank
    const turnIsUniform = (turn: ScumDb.TurnDBO) => {
      let returnValue = true;
      for (const card of lastPlayedTurn.cards) {
        if (card.rank !== rankToMatch) {
          returnValue = false;
        }
      }
      return returnValue;
    }
    // Establish some values to keep track of while iterating back in the active pile
    let shouldKeepChecking = true;
    let index = activePile.length - 1;
    let currentCount = 0;
    // Keep looping back until a true or false is returned...
    while (shouldKeepChecking) {
      // Grab the next turn in the pile
      const turnToCheck = activePile[index];
      if (!turnToCheck || !turnToCheck.cards || !turnToCheck.cards.length) {
        return null;
      }
      if (!turnIsUniform(turnToCheck)) {
        return null;
      }
      currentCount = currentCount + turnToCheck.cards.length;
      if (currentCount > explodePileCount) {
        return null;
      }
      if (currentCount === explodePileCount) {
        return `${explodePileCount} of a kind`;
      }
      index--;
    }
    // Shouldn't even be possible to get here, but just in case...
    return null;
  }
  // Finally, just return false
  return null;
}

function getNextRank(hands: ScumDb.HandDBO[]) {
  let highestRank = 0;
  for (const hand of hands) {
    if (!!hand.endRank && hand.endRank >= highestRank) {
      highestRank = hand.endRank + 1;
    }
  }
  return highestRank;
}

function resetHasPassedFlags(round: ScumDb.RoundDBO): ScumDb.RoundDBO {
  for (const hand of round.hands) {
    hand.hasPassed = false;
  }
  return round;
}

function roundShouldEnd(round: ScumDb.RoundDBO): boolean {
  // Count up the hands left in the round without an end rank
  let unrankedPlayers = 0;
  for (const hand of round.hands) {
    if (!hand.endRank) {
      unrankedPlayers++;
    }
  }
  // If there are less than two, end the round
  if (unrankedPlayers < 2) {
    return true;
  }
  // Otherwise it's not time yet
  return false;
}

function getNextHandIndex(hands: ScumDb.HandDBO[], targetHandIndex: number): number {
  for (let i = 1; i < hands.length + 1; i++) {
    // Move to the next hand
    const handIndex = (targetHandIndex + i) % hands.length;
    
    // Check if they are eligible to have a turn now
    const isEligible = !hands[handIndex].hasPassed
      && !hands[handIndex].endRank
      && hands[handIndex].cards.length > 0;
    // If so, return the index of their hand
    if (isEligible) {
      return handIndex;
    }
  }
  // If no one is determined to be eligible here, return null
  // NOTE: This would be because the initial player got rid of all their cards last play
  return -1;
}