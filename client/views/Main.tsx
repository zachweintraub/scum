import React, { FC, useContext } from "react";
import { PlayerContext } from "../contexts/Player";
import { Game } from "./Game";
import { Portal } from "./Portal";
import { Lobby } from "./Lobby";
import { Router, Route, Switch } from "react-router-dom";
import * as history from "history";

export const scumHistory = history.createBrowserHistory();

export const Main: FC = () => {

  const playerContext = useContext(PlayerContext);

  const renderContent = () => {
    return playerContext?.player ?
      (
        <Lobby />
      )
      : (
        <Portal />
      );
  };

  const MainComponent: FC = () => {
    return (
      <>
        <h1>SCUM</h1>
        {renderContent()}
      </>
    );
  };

  return (
    <Router history={scumHistory}>
      <Switch>
        <Route
          exact
          path="/"
          component={MainComponent}
        />
        <Route
          exact
          path="/game/:gameId"
          component={Game}
        />
      </Switch>
    </Router>
  );
};