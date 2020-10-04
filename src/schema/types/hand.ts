import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { resolve } from "path";
import { GraphQlContext } from "../..";
import { ScumDb } from "../../services/scumDb";
import { GqlCard } from "./card";
import { GqlPlayer } from "./player";

export const GqlHand = new GraphQLObjectType<ScumDb.HandDBO, GraphQlContext>({
  name: "Hand",
  description: "The cards in a player's hand",
  fields: {
    player: {
      type: new GraphQLNonNull(GqlPlayer),
      description: "The player to whom this hand belongs",
      async resolve({ playerId }, _, { scumDb }) {
        
      }
    },
    cards: {
      type: new GraphQLNonNull(new GraphQLList(GqlCard)),
      resolve: (cards) => cards,
    }
  }
})