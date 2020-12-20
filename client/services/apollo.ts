import { ApolloClient, InMemoryCache } from "@apollo/client";

declare const API_URL: string;

export const client = new ApolloClient({
  uri: API_URL + "/graphql",
  cache: new InMemoryCache(),
});