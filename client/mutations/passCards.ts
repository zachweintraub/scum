import { gql } from "@apollo/client";

export type PassCardsResponse = {
  passCardsToPlayer: boolean;
};

export const PASS_CARDS = gql`
  mutation PassCards($gameId: String! $givingPlayerId: String! $receivingPlayerId: String! $cardsToPass: [String]!) {
    passCardsToPlayer(gameId: $gameId givingPlayerId: $givingPlayerId receivingPlayerId: $receivingPlayerId cardsToPass: $cardsToPass)
  }
`;