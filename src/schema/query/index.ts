import { GraphQLObjectType, GraphQLString } from "graphql";

export const query = new GraphQLObjectType<null, null>({
  name: "Query",
  description: "Top level query node.",
  fields: {
    helloWorld: {
      description: "Say hello",
      type: GraphQLString,
      resolve() {
        return "Hello world!";
      },
    },
  },
});