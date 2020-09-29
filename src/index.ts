import * as express from "express";
import { json } from "body-parser";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema";

const app = express();

app.use(json());

app.use("/graphql", graphqlHTTP((_req, _res) => {
  return {
    schema,
    graphiql: true,
  };
}));

const server = app.listen(8000, () => {
  console.log("Server is listening on ", server.address());
});