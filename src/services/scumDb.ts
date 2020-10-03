import { Db, ObjectID } from "mongodb";

export class ScumDb {

  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public async checkConnection() {
    const result = await this.db.collections();
    console.log(result);
  }


}

export namespace ScumDb {

  export type GameConfig = {
    deckCount: number,
    showHandCounts: boolean,
    explodePileCount: number,
  };

  export type GameDBO = {
    _id: ObjectID,
    host: PlayerDBO,
    players: PlayerDBO[],
    gameConfig: GameConfig,
  };

  export type PlayerDBO = {
    _id: ObjectID,
    name: string,
  };

  export type CardDBO = {
    _id: ObjectID,
    fullName: string,
    alias: string,
    rank: number,
  };
}