import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";

type Args = {
  playerId?: string,
  playerName?: string,
  gameId: string,
};

export const addPlayerToGame: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: "Creates a new game from a name, host name, and game config variables.",
  args: {
    gameId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the game to add this player to.",
    },
    playerId: {
      type: GraphQLString,
      description: "The ID of the player if already existing.",
    },
    playerName: {
      type: GraphQLString,
      description: "The name of the player if adding a new one.",
    },
  },
  async resolve(_, {
    gameId,
    playerId,
    playerName,
  }, { scumDb }) {

    // If no player name OR player ID has been provided, no dice
    if (!playerName && !playerId) {
      throw new GraphQLError("Cannot add player without a name or ID");
    }

    // If no player ID, create the player in the DB
    if (!playerId) {
      try {
        const player = await scumDb.createPlayer(playerName);
        playerId = player._id.toHexString();
      } catch (err) {
        throw new GraphQLError(`Unable to add player ${playerName} to the DB: ${err}`);
      }
    }

    // Now add the player to the game
    try {
      const player = await scumDb.getPlayer(playerId);
      if (!player) {
        throw new Error(`No player found with ID ${playerId}`);
      }      
      await scumDb.addPlayerToGame(gameId, playerId);
      return true;
    } catch (err) {
      throw new GraphQLError(`Unable to add player to game: ${err}`);
    }
  }
};