import { PubSub } from "apollo-server-express";
import { ScumDb } from "../services/scumDb";

export const GAME_UPDATED = "GAME_UPDATED";

/**
 * Returns a function for publishing updates with a given pubsub and db
 */
export function publisherFactory(pubsub: PubSub, db: ScumDb): (gameId: string, game?: ScumDb.GameDBO) => void {
  return async function publishUpdate(gameId: string, game?: ScumDb.GameDBO) {
    if (!game) {
      game = await db.getGame(gameId);
    }
    await pubsub.publish(GAME_UPDATED, { game });
  };
}