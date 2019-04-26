const { gql } = require('apollo-server-express');

// Construct a schema using GraphQL schema language
const typeDefs = gql`
  type Message {
    _id: String
    text: String!
    createdAt: String!
    chat: Int!
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
    addMessage(text: String!): Message
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

