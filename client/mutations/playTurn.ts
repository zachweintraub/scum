import { gql } from "@apollo/client";

export type PlayTurnArgs = {
  gameId: string;
  playerId: string;
  cardsToPlay?: string[];
};

export const PLAY_TURN = gql`
  mutation PlayTurn($gameId: String! $playerId: String! $cardsToPlay: [String]) {
    playTurn(gameId: $gameId playerId: $playerId cardsToPlay: $cardsToPlay)
  }
`;