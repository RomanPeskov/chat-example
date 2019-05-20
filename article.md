# Apollo Subscriptions with WebSockets, React, and Express

In this how-to article, we review the steps you need to take when using GraphQL subscriptions to build a chat. We'll use
WebSockets and Apollo to deliver messages to all connected clients in our React and Express application.

But before we show you the code, we need to look at the Apollo project structure and dependencies.

## Apollo project structure and dependencies

Our sample Apollo project follows the modular approach. As you can see in the diagram below, both client and server
packages have the `modules` directory designated to store all the application modules.

In particular, the `server/modules/chat` and `client/modules/chat` directories contain the chat implementations for
Express and React applications respectively.

```
apollo-subscriptions
  client                 # Client package
    src
      config             # React application settings
      modules            # Client-side modules
      App.js             # React main component
      index.html         # React application template
      index.js           # React application entry point
  server                 # Server package
    config               # Express application configurations
    modules              # Server modules
    server.js            # Express application entry point
  package.json           # Project metadata and packages
  webpack.config.js      # Webpack configurations for React
```

You can check out this example in a <a href="https://github.com/RomanPeskov/chat-example" target="">dedicated
repository</a>.

The list of technologies includes:

* React
* Apollo Client
* Express
* Apollo Server
* WebSockets
* Webpack

We start with creating the server files &mdash; a GraphQL schema with subscriptions. Then, we create the frontend
implementation using Apollo Link and a few other libraries.

## Creating a GraphQL schema with subscriptions

A <a href="https://sysgears.com/articles/how-to-create-an-apollo-react-express-application/" target="">typical GraphQL and Express
server</a> without subscriptions creates an Express app, an instance of `ApolloServer`, and then creates the server.

However, when creating an Express server _with_ GraphQL subscriptions, a bit more work need to be done. In fact, we need
to pass the Express app to `createServer()` function taken from the Node.js 'http' module. Then, the created server must
be passed to Apollo's `installSubscriptionHandlers()`.

The following code snippet (look up <a href=https://github.com/RomanPeskov/chat-example/blob/master/server/server.js target="">the
  `server.js` file</a> in our repository) demonstrates the said approach:

```javascript
// In the file
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

// Import "createServer()" from Node.js "http" module
const { createServer } = require('http');

const typeDefs = require('./modules/chat/graphqlSchema');
const resolvers = require('./modules/chat/resolvers');

const app = express();

const apolloServer = new ApolloServer({ typeDefs, resolvers });
apolloServer.applyMiddleware({ app });

// Create an HTTP server and pass it to Apollo Server
// method "installSubscriptionHandlers()"
const httpServer = createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: 3000 }, () => {
    console.log(`Server ready at http://localhost:3000${apolloServer.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:3000${apolloServer.subscriptionsPath}`);
});
```

In the callback passed to `httpServer.listen()`, our server will log out the path for subscriptions that come over
WebSockets. The usual GraphQL queries and mutations will come to the default GraphQL path &mdash; `/graphql`.

To be able to use subscriptions, we haven't done enough, though. Our type definitions must contain a GraphQL
subscription type &mdash; besides the “standard” mutations and queries &mdash; and resolvers must have a dedicated
function to push incoming data (chat messages) to all client app instances that subscribed to a specific chat.

### GraphQL schema for Chat module

The schema has several usual types &mdash; `Query`, and `Mutation` &mdash; and two types specific for our app &mdash;
`Chat` and `Message`. But our schema also contains two more types that are more interesting in terms of our topic
&mdash; `Subscription` and `UpdateMessagesPayload`.

We define a subscription `messagesUpdated` to react to any events that happen to messages (in fact, the app handles only
  two events; see the `Mutation` type below). The payload type describes what the payload will contain: an added or
  deleted message and the event type (read: what kind of mutation was performed):

```js
const { gql } = require('apollo-server-express');

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
```

Now, let’s focus on the subscription resolver.
### GraphQL subscription resolvers for Chat module

Resolvers are located next to the GraphQL schema in the Chat module. To handle messages that come through a WebSocket
connection, we'll be using the publish-subscribe pattern. Whenever a new message is sent from the client or a message is
deleted, the app can react to an event by sending a notification (with or without the message itself) to all subscribed
client instances via WebSockets.

The `apollo-server-express` package has the `PubSub` class we can use.

The principle how the messages will be handled is straightforward:

* On the client, we send a subscription query `messagesUpdated` once the app is opened in the browser. When the
subscription query reaches our Express app, we handle it with the `subscribe()` resolver.

`subscribe()` uses the `pubsub` instance (created with `new PubSub()`) that iterates over all subscribers and sends them
the notification. The list of subscribers is stored by Apollo so we don't have to manage them manually.

Below, you can see the invocation of the `pubsub.asyncIterator()` method with `MESSAGES_SUBSCRIPTION` as an argument:

```js
const Chat = require('./models/chat');
const { PubSub } = require('apollo-server-express');

const pubsub = new PubSub();
const MESSAGES_SUBSCRIPTION = 'messages_subscription';

const resolvers = {
  Query: { /* */ },

  Mutation: { /* */ },

  Subscription: {
    messagesUpdated: {
      subscribe: () => pubsub.asyncIterator(MESSAGES_SUBSCRIPTION),
    },
  },
};

module.exports = resolvers;
```

Currently, we showed only the subscription resolver. But to actually make it work, we need to publish an event with the
incoming message, which will be pushed by our app through WebSocket connections to all subscribers.

We publish the event inside the mutation resolvers, as you might have figured it out.

```js
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
  Query: { /* */ },

  Mutation: {
    addMessage: (parent, { text }) => {
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

  Subscription: { /* */ },
};

module.exports = resolvers;
```

The two mutations, `addMessage` and `deleteMessage`, not only save the incoming messages, but also they use the instance
of `PubSub` to publish an event of the type `MESSAGES_SUBSCRIPTION`.

Notice that we create the basic chat data right in the file. We don't connect our Express server to any database for
simplicity.

## GraphQL subscriptions in React app with Apollo Client

Let’s revisit the structure of our React app that we already looked at in the beginning of our article. But this time,
we'll pay more attention to the building blocks of the Chat module:

```
apollo-subscriptions/client/src/modules
chat                             # The Chat module
    components
        ChatForm                 # Dumb component to render chat form
        index                    # Exports all Chat dumb components
        MessageList              # Dumb component to render messages
    containers
        Chat                     # Root Chat module container
        index                    # Exports all Chat containers
        Message                  # Exports the Message container
    providers
        addMessage               # Contains wrapper with ADD_MESSAGE mutation
        chats                    # Implements query component to get all chats
        deleteMessage            # Contains wrapper with DELETE_MESSAGE mutation
        index                    # Exports all providers
        messages                 # Implements query component to get all messages
        messagesSubscription     # Contains wrapper to handle subscriptions
    styles                       # Chat module styles
    index                        # Exports all Chat module files
index                            # Exports all custom modules
```

We’ll only focus on these files:

* `providers/messagesSubscription.js`, a provider that creates subscriptions queries
* `containers/Message.js`, a smart component that actually handles incoming subscription queries

The flow looks for adding messages looks like this:

1. The `ChatForm` dumb component has a form and runs the `addMessage` callback that was passed in `props` from
`Message.js`.
2. The `providers/addMessage` runs a mutation query with the chat and message data.
3. The Express server handles a respective mutation query (look up the `addMessage` resolver in
  `server/modules/chat/resolvers.js`) to add a new message and responds with the object
  `{ messagesUpdated: { mutation: 'DELETED', message }` where `message` is the original message object sent from the
  client.
4. The `containers/Message` component of the React app checks what kind of mutation was done to the chat, and then it
runs a respective function. When a message is added, `providers/addMessage` will run to add a new message.

One more aspect of our React app we'd like to clarify is that it already uses React Hooks extensively. If you're not
familiar with them, check out the <a href="https://reactjs.org/docs/hooks-intro.html" target="">React documentation on
hooks</a>.

Now, we can focus on the implementation details.

### Configuring Apollo Client for subscriptions

To be able to use subscription on the client, we need to configure Apollo Client. A typical configuration object gets a
string that our React application should send GraphQL queries to. But subscription queries must be sent to a different
URL than queries and mutations, so we also have to configure Apollo to work with WebSocket connections.

These Apollo libraries are necessary to configure our React app to use GraphQL subscriptions:

* `apollo-utilities`, provides the utility to parse outgoing GraphQL queries
* `apollo-link`, provides the utility to split queries
* `apollo-link-ws`, provides the utility to configure the WebSocket Apollo client.

`App.js` looks like this in our project:

```javascript
import React from 'react'
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Chat } from './modules/chat';

const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql',
});

const wsLink = new WebSocketLink({
  uri: `ws://localhost:3000/graphql`,
  options: {
    reconnect: true,
  },
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: ApolloLink.from([terminatingLink]),
  cache: new InMemoryCache()
});

export default class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Chat />
      </ApolloProvider>
    )
  }
}
```

The two key aspects of using WebSockets with Apollo and React are these:

* The WebSocket link configuration. We also set the `reconnect` option to `true` to re-establish to any broken WebSocket
connections:

```javascript
const wsLink = new WebSocketLink({
  uri: `ws://localhost:3000/graphql`,
  options: {
    reconnect: true,
  },
});
```

* The queries are split by links. Notice that we use the `split()` function from `apollo-link`. This function accepts a
callback that verifies if a GraphQL query has the operation `'subscription'`. Notice also that we use
`getMainDefinition()` from `apollo-utilities` library to get the current query definition. Finally, we pass the
WebSocket and HTTP configuration objects:

```javascript
const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);
```
### Updating messages

How will new messages be pushed into the chat? You can view the implementation of the `Message` container:

```javascript
import React, { useEffect } from 'react'

// Other code ...
const Message = props => {
  const { messagesUpdated, updateQuery, messages, loading, addMessage, deleteMessage, chatId } = props;
  useEffect(() => {
    if (!!messagesUpdated) {
      const {mutation, message} = messagesUpdated;
      updateQuery(prev => {
        switch (mutation) {
          case 'CREATED':
            return onAddMessage(prev, message);
          case 'DELETED':
            return onDeleteMessage(prev, message.id);
          default:
            return prev;
        }
      });
    }
  }, [messagesUpdated]);

  return (
    <>
      <MessageList loading={loading} messages={messages} deleteMessage={deleteMessage}/>
      <ChatForm addMessage={addMessage} chatId={chatId}/>
    </>
  );
};

// Other code ...
```

We use the `useEffect()` hook from React 16.8 to verify if the messages were updated. And if they did, we simply check
what kind of change happened and then update the state of the chat.

The `onAddMessage()` and `onDeleteMessage()` functions are provided by providers (pun intended)
`providers/addMessage.js` and `providers/deleteMessage.js`.

The subscription actually happens when we run the React application and the `Messages` component gets rendered. This
component is wrapped with a subscription component `messagesUpdated`. This happens on the last line in
`containers/Message.js`.

```javascript
export default compose(messages, addMessage, deleteMessage, messagesSubscription)(Message);
```

Let's also have a look at the GraphQL subscription in our React app:

```javascript
import React from 'react';
import { Subscription } from 'react-apollo';
import { gql } from 'apollo-boost';

export const MESSAGES_SUBSCRIPTION = gql`
  subscription onMessagesUpdated($chatId: Int!) {
    messagesUpdated(chatId: $chatId) {
      mutation
      message {
        id
        text
        createdAt
      }
    }
  }
`;

export default Component => {
  const WithMessagesSubscription = props => {
    return (
      <Subscription subscription={MESSAGES_SUBSCRIPTION} variables={{ chatId: props.chatId }}>
        {({data, loading}) => {
          if (!loading && data) {
            return <Component {...props} messagesUpdated={data.messagesUpdated}/>;
          }
          return <Component {...props} />;
        }}
      </Subscription>
    );
  };

  return WithMessagesSubscription;
};
```

As you can see, there's nothing special going on in this file. A GraphQL subscription is similar to a query or mutation:

* It can receive arguments. See the line with `chatId: $chatId`.
* It can specify what to return upon a request. See `mutation` and `message`.

A GraphQL `Subscription` is also a custom component, just like `Query` or `Mutation`, and it’s created with the help of
`react-apollo`. This component accepts the created subscription `MESSAGE_SUBSCRIPTION` and the variables, in this case,
the chat ID.

Let’s rewind back what we’ve discussed so far. The `messagesUpdated` provider send a subscription request and passes the
`messagesUpdated` data as props to the smart component `containers/Message`. The `Message` component checks what kind of
mutation happened and then updates the `components/MessageList` component accordingly.

___

That’s how you can build a simple JavaScript application with live chat functionality with the help of GraphQL.
