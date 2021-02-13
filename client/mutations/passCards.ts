import { gql } from "@apollo/client";
import { Round } from "../queries/getGame";

export type PassCardsResponse = {
  passCardsToPlayer: Round;
};

export const PASS_CARDS = gql`
  mutation PassCards($gameId: String! $givingPlayerId: String! $receivingPlayerId: String! $cardsToPass: [String]!) {
    passCardsToPlayer(gameId: $gameId givingPlayerId: $givingPlayerId receivingPlayerId: $receivingPlayerId cardsToPass: $cardsToPass) {
      id
      isActive
      startedAt
      endedAt
      hands {
        playerId
        cards {
          rank
          fullName
          alias
        }
        readyToPlay
        isActive
        hasPassed
        startRank
        endRank
      }
      activePile {
        playerId
        playedAt
        tookThePile
        cards {
          rank
          fullName
          alias
        }
      }
      discardPile {
        playerId
        playedAt
        tookThePile
        cards {
          rank
          fullName
          alias
        }
      }
      excessCards {
        rank
        fullName
        alias
      }
    }
  }
`;