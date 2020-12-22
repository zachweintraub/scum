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
  playerGames: LobbyGame[];
};

const lobbyGameFields = `
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
`;

export const GET_LOBBY_GAMES = gql`
  query getLobbyGames(
    $openOnly: Boolean
    $playerId: String
  ) {
    openGames: games(openOnly: $openOnly) {
      ${lobbyGameFields}
    }
    playerGames: games(playerId: $playerId) {
      ${lobbyGameFields}
    }
  }
`;