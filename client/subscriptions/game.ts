import { gql } from "@apollo/client";
import { gameFields } from "../queries/getGame";

export const SUBSCRIBE_TO_GAME = gql`
  subscription gameSubscription(
    $id: String!
  ) {
    game(id: $id) {
      ${gameFields}
    }
  }
`;