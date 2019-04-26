const Chat = require('./models/chat');
const {PubSub} = require('apollo-server-express');

const pubsub = new PubSub();
const MESSAGES_SUBSCRIPTION = 'messages_subscription';

let chat = [{ id: 1, name: 'chat1' }, { id: 2, name: 'chat2' }];
let messages = [{ id: 1, text: 'test', createdAt: new Date(), chatId: 1 }, {
  id: 2,
  text: 'test2',
  createdAt: new Date(),
  chatId: 2
}];

// Provide resolver functions for the GraphQL schema
const resolvers = {
  Query: {
    messages: async (parent, { chatId }) => {
      return messages.filter(message => message.chatId === chatId);
    }
  },

  Mutation: {
    addMessage: async (parent, { text }) => {
      // const message = await new Chat({text}).save();
      const message = { text, createdAt: new Date() };
      chat.push(message);
      pubsub.publish(MESSAGES_SUBSCRIPTION, {messagesUpdated: {mutation: 'CREATED', message}});
      return message;
    },

    deleteMessage: async (parent, {id}) => {
      const message = await Chat.findById(id);
      await Chat.deleteOne({_id: id}).exec();
      pubsub.publish(MESSAGES_SUBSCRIPTION, {messagesUpdated: {mutation: 'DELETED', message}});
      return message
    }
  },

  Subscription: {
    messagesUpdated: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator(MESSAGES_SUBSCRIPTION),
    },
  },
};

module.exports = resolvers;
