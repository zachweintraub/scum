import { GraphQLBoolean, GraphQLError, GraphQLFieldConfig, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { Deck } from "../types/deck";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
import { GqlGame } from "../types/game";

type Args = {
  hostId: string,
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
      type: new GraphQLNonNull(GraphQLString),
      description: "The ID of the host",
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
    deckCount,
    showHandCounts,
    explodePileCount,
    powerCard,
  }, { scumDb }) {

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
  },
};