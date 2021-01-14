import * as express from "express";
import { json } from "body-parser";
import { ApolloServer, PubSub } from "apollo-server-express";
import { schema } from "./schema";
import * as dotenv from "dotenv";
import { ScumDb } from "./services/scumDb";
import { MongoClient } from "mongodb";
import { createServer } from "http";
import { publisherFactory } from "./utils/publishUpdate";
import * as path from "path";
import * as fs from "fs";

export type GraphQlContext = {
  scumDb: ScumDb;
  pubsub: PubSub;
  /** Function to publish a "game updated" event */
  publishUpdate(id: string, game?: ScumDb.GameDBO): void;
};

/**
 * Fire it up baby
 */
async function main() {
  // Configure environment
  dotenv.config();
  
  // Set up app
  const app = express();
  app.use(json());
  
  // Grab some constants
  const dbString = process.env.DB_URL;
  const dbName = process.env.DB_NAME;
  const port = process.env.PORT;

  // Connect to DB
  const client = new MongoClient(dbString ?? "", { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);
  
  // Create instance of ScumDb to pass into graphql context
  const scumDb = new ScumDb(db);

  const pubsub = new PubSub();

  // Set up the context
  const context: GraphQlContext = {
    scumDb,
    pubsub,
    publishUpdate: publisherFactory(pubsub, scumDb),
  };

  // Set up the graphql endpoint
  const server = new ApolloServer({
    schema,
    context,
    playground: true,
    subscriptions: {
      onConnect: (params: {playerId: string}) => {
        console.log(params.playerId);
      },
    },
  });

  server.applyMiddleware({ app });

  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);

  app.use(express.static(path.resolve(__dirname, "../public")));
  app.use((req, res) => {
    // Grab the HTML
    const filePath = path.resolve(__dirname + "/../views/index.html");
    let html = fs.readFileSync(filePath, "utf8");
    // Inject the API URL
    const apiUrl = `${req.protocol}://${req.hostname}${port ? `:${port}` : ""}`;
    html = html.replace(
      "<var></var>",
      `<script>var API_URL = "${apiUrl}/graphql";</script>`,
    );
    // Send it back
    res.type("html").send(html);
  });
  
  // Start listening
  httpServer.listen(port, () => {
    console.log("Server is listening on ", server.graphqlPath);
  });

}

main();