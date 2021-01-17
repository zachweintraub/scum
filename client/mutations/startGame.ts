import { gql } from "@apollo/client";

export type StartGameArgs = {
  gameId: string;
};

export type StartGameResponse = {
  startGame: boolean;
}

export const START_GAME = gql`
  mutation StartGame($gameId: String!) {
    startGame(gameId: $gameId)
  }
`;