import { gql } from "@apollo/client";

export type StartRoundArgs = {
  gameId: string;
};

export type StartRoundResponse = {
  startRound: boolean;
}

export const START_ROUND = gql`
  mutation StartGame($gameId: String!) {
    startNewRound(gameId: $gameId)
  }
`;