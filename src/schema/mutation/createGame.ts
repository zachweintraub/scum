import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { Deck } from "../types/deck";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
import { GqlGame } from "../types/game";

type Args = {
  hostName?: string,
  hostId?: string,
  name: string,
  deckCount: number,
  showHandCounts: boolean,
  explodePileCount: number,
  powerCard: string,
};

export const createGame: GraphQLFieldConfig<null, GraphQlContext, Args> = {
  type: new GraphQLNonNull(GqlGame),
  description: "Creates a new game from a name, host name, and game config variables.",
  args: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The name of the game.",
    },
    hostId: {
      type: GraphQLString,
      description: "The ID of the host",
    },
    hostName: {
      type: GraphQLString,
      description: "The name of the host of the game.",
    },
    deckCount: {
      type: GraphQLInt,
      description: "The number of decks to use in the game. Defaults to 1.",
      defaultValue: 1,
    },
    showHandCounts: {
      type: GraphQLBoolean,
      description: "Whether or not to show the number of cards in other players' hands. Defaults to true.",
      defaultValue: true,
    },
    explodePileCount: {
      type: GraphQLInt,
      description: "The number of cards in a row that will blow up the pile. Defaults to 4.",
      defaultValue: 4,
    },
    powerCard: {
      type: GraphQLString,
      description: "The best card in the game. Defaults to three of clubs.",
      defaultValue: "3C",
    },
  },
  async resolve(_, {
    name,
    hostId,
    hostName,
    deckCount,
    showHandCounts,
    explodePileCount,
    powerCard,
  }, { scumDb }) {

    // If no host name OR host ID has been provided, no dice
    if (!hostName && !hostId) {
      throw new GraphQLError("Cannot initiate game without a host name or ID");
    }

    // If no host ID, create the host in the DB
    if (!hostId) {
      const host = await scumDb.createPlayer(hostName);
      hostId = host._id.toHexString();
    }

    // Grab the power card as an object
    const powerCardObject = new Deck()
      .allCards
      .find(c => c.alias.toUpperCase() === powerCard.toUpperCase());
    if (!powerCardObject) {
      throw new GraphQLError("Failed to create game: invalid power card entered");
    }

    // Set up the game config
    const gameConfig: ScumDb.GameConfigDBO = {
      deckCount,
      showHandCounts,
      explodePileCount,
      powerCard: powerCardObject,
    };

    // Finally, create the game!
    try {      
      const newGame = await scumDb.createGame(name, hostId, gameConfig);
      return newGame;
    } catch (err) {
      throw new GraphQLError(`Unable to create new user: ${err}`);
    }
  }
};