const { gql } = require('apollo-server-express');

// Construct a schema using GraphQL schema language
const typeDefs = gql`
  type Message {
    id: String
    text: String!
    createdAt: String!
    chatId: Int!
  }
  
  type Chat {
    id: Int!,
    name: String
  }
  
  type Query {
    chats: [Chat]
    messages(chatId: Int!): [Message]
  }
  
  type Mutation {
    addMessage(text: String!, chatId: Int!): Message
    deleteMessage(id: String!): Message
  }
    
  type Subscription {
   messagesUpdated: UpdateMessagesPayload
 }
 
  type UpdateMessagesPayload {
    mutation: String!
    message: Message
 }
`;

module.exports = typeDefs;

