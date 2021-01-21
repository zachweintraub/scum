import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphQlContext } from "../..";

type Args = {
  playerId: string,
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
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the player if already existing.",
    },
  },
  async resolve(_, {
    gameId,
    playerId,
  }, { scumDb, publishUpdate }) {

    // Now add the player to the game
    try {
      const player = await scumDb.getPlayerById(playerId);
      if (!player) {
        throw new Error(`No player found with ID ${playerId}`);
      }      
      await scumDb.addPlayerToGame(gameId, player);
      await publishUpdate(gameId);
      return true;
    } catch (err) {
      throw new GraphQLError(`Error occurred while adding player to game: ${err}`);
    }
  },
};