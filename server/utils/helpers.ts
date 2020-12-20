import { GraphQLError } from "graphql";
import { ObjectID } from "mongodb";
import { ScumDb } from "../services/scumDb";

/**
 * Takes a round, some cards to play, and the index + id of the player's hand
 * Mutates/returns the same round with the player's cards played into the round's active pile
 */
export function playFromHandToPile(round: ScumDb.RoundDBO, cardsToPlay: string[], targetHandIndex: number, playerId: string): ScumDb.RoundDBO {
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
   };
   // Add this turn to the pile
   round.activePile.push(thisTurn);
   return round;
}

/**
 * Moves the cards in the active pile to the discard pile for a given round
 */
export function clearPile(round: ScumDb.RoundDBO) {
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

/**
 * Determines whether the last turn played should clear the active pile
 */
export function lastPlayShouldClearPile(activePile: ScumDb.TurnDBO[], gameConfig: ScumDb.GameConfigDBO): string | null {
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

  // BIG KNOWN BUG! playing doubles on doubles blows it up no matter what :(

  if (explodePileCount % lastPlayedTurn.cards.length === 0) {
    // Grab the rank of the first card as our base rank to match
    let rankToMatch = lastPlayedTurn.cards[0].rank;
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
      if (!turnIsUniform(turnToCheck, rankToMatch)) {
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

/**
 * Determine the next highest finishing rank for a round
 */
export function getNextRank(hands: ScumDb.HandDBO[]) {
  let highestRank = 0;
  for (const hand of hands) {
    if (!!hand.endRank && hand.endRank >= highestRank) {
      highestRank = hand.endRank + 1;
    }
  }
  return highestRank;
}

/**
 * Takes an array of players and returns the name of a player with a given ID
 */
export function getPlayerName(players: ScumDb.PlayerDBO[], id: string) {
  // Isolate the current one for now
  const player = players.find(p => p._id.toHexString() === id);
  return player?.name ?? "UNKNOWN PLAYER";
}

/**
 * Resets all players' passing statuses
 */
export function resetHasPassedFlags(round: ScumDb.RoundDBO): ScumDb.RoundDBO {
  for (const hand of round.hands) {
    hand.hasPassed = false;
  }
  return round;
}

/**
 * Determines whether a given round should be over
 */
export function roundShouldEnd(round: ScumDb.RoundDBO): boolean {
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

/**
 * Determines the index of the player who should go next 
 */
export function getNextHandIndex(hands: ScumDb.HandDBO[], targetHandIndex: number): number {
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

/**
 * Helper to determine if all cards in a turn have the same rank 
 */
export function turnIsUniform(turn: ScumDb.TurnDBO, rankToMatch: number) {
  let returnValue = true;
  for (const card of turn.cards) {
    if (card.rank !== rankToMatch) {
      returnValue = false;
    }
  }
  return returnValue;
}