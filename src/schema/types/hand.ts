import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { ScumDb } from "../../services/scumDb";
import { GqlCard } from "./card";

export const GqlHand = new GraphQLObjectType<ScumDb.CardDBO[], {}>({
  name: "Hand",
  description: "The cards in a player's hand",
  fields: {
    cards: {
      type: new GraphQLNonNull(new GraphQLList(GqlCard)),
      resolve: (cards) => cards,
    }
  }
})