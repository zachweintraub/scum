import { gql } from "@apollo/client";
import { Player } from "../contexts/Player";

export type Game = {
  id: string;
  name: string;
  host: Player;
  players: Player[];
  rounds: Round[] | null;
  createdAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
};

export type Round = {
  id: string;
  startedAt: Date | null;
  endedAt: Date | null;
};

export type Hand = {
  playerId: string;
  cards: Card[];
  isActive: boolean;
  hasPassed: boolean;
  startRank: number | null;
  endRank: number | null;
};

export type Turn = {
  cards: Card[];
  playerId: string;
  playedAt: Date;
  tookThePile: boolean;
};

export type Card = {
  rank: number;
  fullName: string;
  alias: string;
};

export type GetGameResponse = {
  game: Game;
};

export const gameFields = `
  id
  name
  createdAt
  startedAt
  endedAt
  host {
    id
    name
  }
  players {
    id
    name
  }
  rounds {
    id
    startedAt
    endedAt
    hands {
      playerId
      cards
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
`;

export const GET_GAME = gql`
  query game(
    $id: String!
  ) {
    game(id: $id) {
      ${gameFields}
    }
  }
`;