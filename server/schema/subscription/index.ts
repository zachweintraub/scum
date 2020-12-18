import { GraphQLObjectType } from "graphql";
import { GraphQlContext } from "../..";
import { game } from "./game";

export const subscription = new GraphQLObjectType<null, GraphQlContext>({
  name: "Subscription",
  description: "Top level subscription node.",
  fields: {
    game,
  },
});