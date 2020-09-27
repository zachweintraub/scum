import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { Card } from "./deck";
import { GqlCard } from "./card";

export const GqlHand = new GraphQLObjectType<Card[], {}>({
  name: "Hand",
  description: "The cards in a player's hand",
  fields: {
    cards: {
      type: new GraphQLNonNull(new GraphQLList(GqlCard)),
      resolve: (cards) => cards,
    }
  }
})