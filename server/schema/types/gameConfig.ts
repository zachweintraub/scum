import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { ScumDb } from "../../services/scumDb";

export const GqlGameConfig= new GraphQLObjectType<ScumDb.GameConfigDBO, {}>({
  name: "GameConfig",
  description: "The various rules/settings for this game.",
  fields: {
    deckCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The numeric value of the card in the context of scum rules",
      resolve: ({ deckCount }) => deckCount,
    },
    showHandCounts: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "The full name of the card (i.e. Queen of Hearts)",
      resolve: ({ showHandCounts }) => showHandCounts,
    },
    explodePileCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "The number of consecutive matching cards required to 'explode' the pile.",
      resolve: ({ explodePileCount }) => explodePileCount,
    },
    powerCardAlias: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The elected power card for this game (default is three of clubs).",
      resolve: ({ powerCardAlias }) => powerCardAlias,
    },
  },
});