import { ApolloProvider } from "@apollo/client";
import React, { createContext, FC, useState } from "react";
import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

declare const API_URL: string;

const API_URL_WS = API_URL.replace("http://", "ws://");

const httpLink = new HttpLink({
  uri: API_URL,
});

export type ApolloClientCtx = {
  /** When a player connects to a game, initiate a WS connection with the appropriate params */
  initiateWsLink(playerId: string, gameId: string): void;
};

export const ApolloClientContext = createContext<ApolloClientCtx | null>(null);

const { Provider } = ApolloClientContext;

export const ApolloClientManager: FC = ({ children }) => {

  const initialClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });

  const [ client, setClient ] = useState(initialClient);
  
  const initiateWsLink = (playerId: string, gameId: string) => {
    const wsLink = new WebSocketLink({
      uri: API_URL_WS,
      options: {
        reconnect: true,
        connectionParams: {
          playerId,
          gameId,
        },
      },
    });
    
    const splitLink = split(
      ({ query }) => {
        const def = getMainDefinition(query);
        return (
          def.kind === "OperationDefinition" &&
          def.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    );

    const newClient = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    });

    setClient(newClient);
  }

  const context: ApolloClientCtx = {
    initiateWsLink,
  };

  return (
    <ApolloProvider
      client={client}
    >
      <Provider value={context}>
        {children}
      </Provider>
    </ApolloProvider>
  );
};