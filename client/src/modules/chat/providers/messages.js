import React from 'react';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';

export const GET_MESSAGES = gql`
  query messages($chatId: Int!) {
    messages(chatId: $chatId) {
      _id
      text,
      createdAt
    }
  }
`;

const messages = Component => props => {
  return (
    <Query query={GET_MESSAGES} variables={{ chatId: 1 }}>
      {({ loading, data, subscribeToMore, updateQuery }) => {
        return (
          <Component {...props} updateQuery={updateQuery} subscribeToMore={subscribeToMore} loading={loading} messages={data.messages} />
        );
      }}
    </Query>
  );
};

export default messages;
