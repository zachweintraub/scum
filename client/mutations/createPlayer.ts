import { gql } from "@apollo/client";
import { Player } from "../contexts/Player";

export type CreatePlayerArgs = {
  name: string;
};

export type CreatePlayerResponse = {
  createPlayer: Player;
}

export const CREATE_PLAYER = gql`
  mutation CreatePlayer($name: String!) {
    createPlayer(name: $name) {
      id
      name
    }
  }
`;