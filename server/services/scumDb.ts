import { Db, ObjectID } from "mongodb";

/**
 * Class to connect to and interact with the DB
 */
export class ScumDb {

  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  /**
   * Create a new game 
   */
  public async createGame(name: string, hostId: string, gameConfig: ScumDb.GameConfigDBO): Promise<ScumDb.GameDBO> {
    
    const createdAt = new Date().toISOString();

    const thisGame: ScumDb.GameDBO = {
      _id: new ObjectID(),
      name,
      hostId,
      gameConfig,
      playerIds: [hostId],
      createdAt,
      actionLog: [],
    };
    await this.db.collection("games").insertOne(thisGame);
    return thisGame;
  }

  /**
   * Add a player to a game
   */
  public async addPlayerToGame(gameId: string, playerId: string) {
    const thisGameId = new ObjectID(gameId);
    await this.db.collection("games").updateOne(
      { _id: thisGameId, startedAt: { $exists: false } },
      { $push: { playerIds: playerId } },  
    );
    return playerId;
  }

  /**
   * Create a new player
   */
  public async createPlayer(name: string) {
    const _id = new ObjectID();
    const thisPlayer = {
      _id,
      name,
    };
    await this.db.collection("players").insertOne(thisPlayer);
    return thisPlayer;
  }

  /**
   * Add a new round to an existing game 
   */
  public async createRound(round: Omit<ScumDb.RoundDBO, "_id">): Promise<boolean> {
    // Add an ID and start time before inserting
    const newRound: ScumDb.RoundDBO = {
      _id: new ObjectID(),
      startedAt: new Date().toISOString(),
      ...round,
    };
    // Insert
    await this.db.collection("rounds").insertOne(newRound);
    return true;
  }

  /**
   * Get a single game by ID
   */
  public async getGame(id: string): Promise<ScumDb.GameDBO> {
    const thisId = new ObjectID(id);
    const game = await this.db.collection("games").findOne({ _id: thisId });
    return game;
  }

  /**
   * Get all games from the DB
   */
  public async getAllGames(): Promise<ScumDb.GameDBO[]> {
    const games = await this.db.collection("games").find().toArray();
    return games;
  }

  /**
   * Get all open games (those that have not started)
   */
  public async getOpenGames() {
    const games = await this.db.collection("games").find({ startedAt: { $exists: false } }).toArray();
    return games;
  }

  /**
   * Get all games that include a given player
   */
  public async getGamesForPlayer(playerId: string): Promise<ScumDb.GameDBO[]> {
    const games = await this.db.collection("games").find({ playerIds: playerId }).toArray();
    return games;
  }

  /**
   * Get a single player by ID
   */
  public async getPlayerById(id: string): Promise<ScumDb.PlayerDBO> {
    const thisId = new ObjectID(id);
    const player = await this.db.collection("players").findOne({ _id: thisId });
    return player;
  }

  /**
   * Get a single player by name
   */
  public async getPlayerByName(name: string): Promise<ScumDb.PlayerDBO> {
    const player = await this.db.collection("players").findOne({ name: name });
    return player;
  }
  
  /**
   * Get a group of players using multiple IDs
   */
  public async getPlayers(ids: string[]): Promise<ScumDb.PlayerDBO[]> {
    let players: ScumDb.PlayerDBO[] = [];
    if (Array.isArray(ids) && ids.length > 0) {
      const theseIds = ids.map(id => new ObjectID(id));
      players = await this.db.collection("players").find({ _id: { $in: theseIds }}).toArray();
    } else {
      players = await this.db.collection("players").find().toArray();
    }
    return players;
  }

  /**
   * Get all rounds for a game
   */
  public async getRounds(gameId: string): Promise<ScumDb.RoundDBO[]> {
    const thisGameId = new ObjectID(gameId);
    const rounds = await this.db.collection("rounds").find({ gameId: thisGameId }).toArray();
    return rounds;
  }

  /**
   * Add an action to a game's action log 
   */
  public async logAction(gameId: string, message: string): Promise<ScumDb.ActionLogItemDBO> {
    if (!gameId || !message) {
      throw new Error("Cannot log an action without both a game ID and a message");
    }
    const thisGameId = new ObjectID(gameId);
    // Create a new action containing the message
    const action: ScumDb.ActionLogItemDBO = {
      message,
      time: new Date(),
    };
    // Add this action to the game's log
    await this.db.collection("games").updateOne(
      { _id: thisGameId },
      { $push: { actionLog: action } },
    );
    return action;
  }

  /**
   * Create a game's initial round and start the game 
   */
  public async startGame(gameId: string, roundOne: Partial<ScumDb.RoundDBO>) {
    const thisGameId = new ObjectID(gameId);
    const thisRoundId = new ObjectID();
    roundOne._id = thisRoundId;
    const startedAt = new Date().toISOString();
    roundOne.startedAt = startedAt;
    await this.db.collection("games").updateOne(
      { _id: thisGameId },
      { $set: { startedAt: startedAt } },
    );
    await this.db.collection("rounds").insertOne(roundOne);
    return true;
  }

  /**
   * Replace an existing round object in the DB
   */
  public async updateRound(round: ScumDb.RoundDBO): Promise<ScumDb.RoundDBO> {
    const thisRoundId = round._id;
    await this.db.collection("rounds").replaceOne({ _id: thisRoundId }, round);
    return round;
  }
}

export namespace ScumDb {

  export type ActionLogItemDBO = {
    time: Date;
    message: string;
  };

  export type GameConfigDBO = {
    deckCount: number,
    showHandCounts: boolean,
    explodePileCount: number,
    powerCardAlias: string,
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
    actionLog: ActionLogItemDBO[];
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
    readyToPlay: boolean,
    cards: CardDBO[],
    startRank?: number,
    endRank?: number,
    isActive: boolean,
    hasPassed: boolean,
  };

  export type RoundDBO = {
    _id: ObjectID,
    gameId: ObjectID,
    hands: HandDBO[],
    activePile: TurnDBO[],
    discardPile: TurnDBO[],
    excessCards?: CardDBO[],
    startedAt?: string,
    endedAt?: string,
  };

  export type TurnDBO = {
    cards: CardDBO[],
    playedAt: Date,
    playerId: ObjectID,
    tookThePile?: boolean,
  };
}