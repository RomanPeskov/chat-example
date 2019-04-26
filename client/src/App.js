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

const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
    link,
    cache,
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

