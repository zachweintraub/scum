import { gql } from "@apollo/client";

export type CreateGameArgs = {
  name: string;
  hostId: string;
};

export const CREATE_GAME = gql`
  mutation CreateGame($name: String! $hostId: String!) {
    createGame(name: $name hostId: $hostId)
  }
`;