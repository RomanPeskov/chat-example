import React from 'react';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';

export const MESSAGES = gql`
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
    <Query query={MESSAGES} variables={{ chatId: +props.chatId }} skip={!props.chatId} fetchPolicy={'network-only'} >
      {({ loading, data, subscribeToMore, updateQuery }) => {
        if (data) {
          return <Component {...props} updateQuery={updateQuery} subscribeToMore={subscribeToMore} loading={loading} messages={data.messages} />
        }
        return <Component {...props} />
      }}
    </Query>
  );
};

export default messages;
