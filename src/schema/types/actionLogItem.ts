import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date"
import { ScumDb } from "../../services/scumDb";

export const ActionLogItem = new GraphQLObjectType<ScumDb.ActionLogItemDBO, {}>({
  name: "ActionLogItem",
  description: "A single message from the action log.",
  fields: {
    time: {
      type: new GraphQLNonNull(GraphQLDateTime),
      description: "The timestamp of this message",
      resolve: ({ time }) => time,
    },
    message: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The message logged",
      resolve: ({ message }) => message,
    },
  },
});