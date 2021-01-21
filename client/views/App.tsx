import React, { FC } from "react";
import { Main } from "./Main";
import { PlayerManager } from "../contexts/Player";
import { BrowserRouter } from "react-router-dom";
import "./App.scss";
import { ApolloClientManager } from "../contexts/ApolloClient";
// import { client } from "../services/apollo";
// import { ApolloProvider } from "@apollo/client";

export const App: FC = () => {
  
  return (
    <ApolloClientManager>
      <PlayerManager>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </PlayerManager>
    </ApolloClientManager>
  );
};