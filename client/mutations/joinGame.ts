import { gql } from "@apollo/client";

export type JoinGameArgs = {
  gameId: string;
  playerId: string;
};

export type JoinGameResponse = {
  addPlayerToGame: string;
}

export const JOIN_GAME = gql`
  mutation addPlayerToGame($gameId: String! $playerId: String!) {
    addPlayerToGame(gameId: $gameId playerId: $playerId)
  }
`;