import { Db, ObjectID } from "mongodb";

export class ScumDb {

  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  public async createGame(name: string, hostId: string, gameConfig: ScumDb.GameConfigDBO): Promise<ScumDb.GameDBO> {
    
    const createdAt = new Date().toISOString();

    const thisGame: ScumDb.GameDBO = {
      _id: new ObjectID(),
      name,
      hostId,
      gameConfig,
      playerIds: [hostId],
      createdAt,
    };
    await this.db.collection("games").insertOne(thisGame);
    return thisGame;
  }

  public async addPlayerToGame(gameId: string, playerId: string) {
    const thisGameId = new ObjectID(gameId);
    await this.db.collection("games").updateOne(
      { _id: thisGameId, startedAt: { $exists: false } },
      { $push: { playerIds: playerId } }  
    );
    return playerId;
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

  public async getGame(id: string): Promise<ScumDb.GameDBO> {
    const thisId = new ObjectID(id);
    const game = await this.db.collection("games").findOne({ _id: thisId });
    return game;
  }

  public async getOpenGames() {
    const games = await this.db.collection("games").find({ startedAt: { $exists: false } }).toArray();
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

  public async startGame(gameId: string, roundOne: Partial<ScumDb.RoundDBO>) {
    const thisGameId = new ObjectID(gameId);
    const thisRoundId = new ObjectID();
    roundOne._id = thisRoundId;
    const startedAt = new Date().toISOString();
    roundOne.startedAt = startedAt;
    await this.db.collection("games").updateOne(
      { _id: thisGameId },
      { $push: { rounds: roundOne }, startedAt: startedAt }
    );
    return roundOne;
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
    createdAt?: string;
    startedAt?: string;
    endedAt?: string;
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

  export type HandDBO = {
    playerId: string,
    cards: CardDBO[],
    startRank?: number,
    endRank?: number,
  };

  export type RoundDBO = {
    _id: ObjectID,
    hands: HandDBO[],
    pile?: TurnDBO[],
    excessCards?: CardDBO[],
    startedAt?: string,
    endedAt?: string,
  };

  export type TurnDBO = {
    cards: CardDBO[],
    playedAt: Date,
    playerId: ObjectID,
  }
}