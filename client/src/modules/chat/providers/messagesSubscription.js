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
