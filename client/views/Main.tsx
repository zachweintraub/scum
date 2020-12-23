import React, { FC } from "react";
import { Game } from "./Game";
import { Lobby } from "./Lobby";
import { Router, Route, Switch } from "react-router-dom";
import * as history from "history";

export const scumHistory = history.createBrowserHistory();

export const Main: FC = () => {
  
  return (
    <>
      <h1>SCUM</h1>
      <Router history={scumHistory}>
        <Switch>
          <Route
            exact
            path="/"
            component={Lobby}
          />
          <Route
            exact
            path="/game/:gameId"
            component={Game}
          />
        </Switch>
      </Router>
    </>
  );
};