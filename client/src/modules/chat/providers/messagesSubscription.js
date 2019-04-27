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
  return class WithMessagesSubscription extends React.Component {
    render() {
      return (
        <Subscription subscription={MESSAGES_SUBSCRIPTION} variables={{ chatId: this.props.chatId }}>
          {({data, loading}) => {
            if (!loading && data) {
              return <Component {...this.props} messagesUpdated={data.messagesUpdated}/>;
            }
            return <Component {...this.props} />;
          }}
        </Subscription>
      );
    }
  };
};
