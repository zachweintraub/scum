import { gql } from "@apollo/client";

export type LogMessageResponse = {
  logMessage: { time: Date, message: string }
}

export const SEND_MESSAGE = gql`
  mutation SendMessage($message: String! $gameId: String!) {
    logAction(message: $message gameId: $gameId) {
      message
      time
    }
  }
`;