const express = require('express');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./modules/chat/graphqlSchema');
const resolvers = require('./modules/chat/resolvers');

const app = express();

const apolloServer = new ApolloServer({ typeDefs, resolvers });
apolloServer.applyMiddleware({ app });

const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 3000 }, () =>{
    console.log(`🚀 Server ready at http://localhost:3000${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:3000${apolloServer.subscriptionsPath}`);
});
