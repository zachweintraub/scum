import React, { FC } from "react";
import { Main } from "./Main";
import { client } from "../services/apollo";
import { ApolloProvider } from "@apollo/client";
import { PlayerManager } from "../contexts/Player";
import { BrowserRouter } from "react-router-dom";
import "./App.scss";

export const App: FC = () => {
  
  return (
    <ApolloProvider client={client}>
      <PlayerManager>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </PlayerManager>
    </ApolloProvider>
  );
};