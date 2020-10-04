import { Db, ObjectID, MongoCallback } from "mongodb";

export class ScumDb {

  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public async checkConnection() {
    const result = await this.db.collections();
    console.log(result);
  }

  public async createGame(name: string, hostId: string, gameConfig: ScumDb.GameConfigDBO): Promise<ScumDb.GameDBO> {
  
    const thisGame: ScumDb.GameDBO = {
      _id: new ObjectID(),
      name,
      hostId,
      gameConfig,
      playerIds: [hostId],
      isActive: false,
    };
    await this.db.collection("games").insertOne(thisGame);
    return thisGame;
  }

  public async createPlayer(name: string) {
    const _id = new ObjectID();
    const thisPlayer = {
      _id,
      name,
    };
    await this.db.collection("players").insertOne(thisPlayer);
    return thisPlayer;
  }

  public async getOpenGames() {
    const games = this.db.collection("games").find({ isActive: false }).toArray();
    return games;
  }

  public async getPlayer(id: string) {
    const thisId = new ObjectID(id);
    const player = await this.db.collection("players").findOne({ _id: thisId });
    return player;
  }

  public async getPlayers(ids: string[]) {
    const theseIds = ids.map(id => new ObjectID(id));
    const players = await this.db.collection("players").find({ _id: { $in: theseIds }}).toArray();
    return players;
  }
}

export namespace ScumDb {

  export type GameConfigDBO = {
    deckCount: number,
    showHandCounts: boolean,
    explodePileCount: number,
    powerCard: CardDBO,
  };

  export type GameDBO = {
    _id: ObjectID,
    name: string,
    hostId: string,
    playerIds: string[],
    gameConfig: GameConfigDBO,
    isActive: boolean,
  };

  export type PlayerDBO = {
    _id: ObjectID,
    name: string,
  };

  export type CardDBO = {
    fullName: string,
    alias: string,
    rank: number,
  };
}