import { gql } from "@apollo/client";
import { Round } from "../queries/getGame";

export type PlayTurnArgs = {
  gameId: string;
  playerId: string;
  cardsToPlay?: string[];
};

export type PlayTurnResponse = {
  playTurn: Round;
};

export const PLAY_TURN = gql`
  mutation PlayTurn($gameId: String! $playerId: String! $cardsToPlay: [String]) {
    playTurn(gameId: $gameId playerId: $playerId cardsToPlay: $cardsToPlay) {
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