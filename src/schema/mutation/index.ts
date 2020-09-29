import { GraphQLObjectType } from "graphql";
import { startRound } from "./startRound";

export const mutation = new GraphQLObjectType<null, null>({
  name: "Mutation",
  description: "Top level mutation node.",
  fields: {
    startRound,
  },
});