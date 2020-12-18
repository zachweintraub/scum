import * as React from "react";
import { App } from "./views/App";
import { render } from "react-dom";

console.log("MADE IT TO THE INDEX");

render(<App />, document.getElementById("app"));