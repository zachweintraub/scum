import { gql } from "@apollo/client";
import { Player } from "../contexts/Player";

export type Game = {
  id: string;
  name: string;
  host: Player;
  players: Player[];
  rounds: Round[] | null;
  actionLog: ActionLogItem[];
  gameConfig: GameConfig;
  createdAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
};

export type GameConfig = {
  deckCount: number,
  showHandCounts: boolean,
  explodePileCount: number,
  powerCardAlias: string,
};

export type Round = {
  id: string;
  isActive: boolean;
  startedAt: Date | null;
  endedAt: Date | null;
  hands: Hand[];
  activePile: Turn[];
  discardPile: Turn[];
  excessCards: Card[];
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

export type ActionLogItem = {
  message: string;
  time: Date;
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
  actionLog {
    message
    time
  }
  gameConfig {
    deckCount
    showHandCounts
    explodePileCount
    powerCardAlias
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