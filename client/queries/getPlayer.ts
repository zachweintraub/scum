import { gql } from "@apollo/client";
import { Player } from "../contexts/Player";

export type GetPlayerResponse = {
  player: Player;
};

export const GET_PLAYER = gql`
  query getPlayer(
    $name: String
    $id: String
  ) {
    player(
      id: $id
      name: $name
    ) {
      id
      name
    }
  }
`;