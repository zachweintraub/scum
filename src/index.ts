import * as express from "express";
import { json } from "body-parser";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema";
import * as dotenv from "dotenv";
import { ScumDb } from "./services/scumDb";
import { MongoClient } from "mongodb";

export type GraphQlContext = {
  scumDb: ScumDb;
};

async function main() {
  // Configure environment
  dotenv.config();
  
  // Set up app
  const app = express();
  app.use(json());
  
  // Grab some constants
  const dbString = process.env.DB_URL;
  const dbName = process.env.DB_NAME;

  // Connect to DB
  const client = new MongoClient(dbString, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);
  
  // Create instance of ScumDb to pass into graphql context
  const scumDb = new ScumDb(db);

  // Set up the context
  const context: GraphQlContext = {
    scumDb,
  };
  
  // Set up the graphql endpoint
  app.use("/graphql", graphqlHTTP((_req, _res) => {
    return {
      schema,
      graphiql: true,
      context,
    };
  }));
  
  // Start listening
  const server = app.listen(8000, () => {
    console.log("Server is listening on ", server.address());
  });
}

main();