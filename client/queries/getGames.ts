import { gql } from "@apollo/client";
import { Player } from "../contexts/Player";

export type LobbyGame = {
  id: string;
  name: string;
  host: Player;
  players: Player[];
};

export type GetLobbyGamesResponse = {
  openGames: LobbyGame[];
};

export const GET_LOBBY_GAMES = gql`
  query getLobbyGames {
    openGames {
      id
      name
      host {
        id
        name
      }
      players {
        id
        name
      }
    }
  }
`;