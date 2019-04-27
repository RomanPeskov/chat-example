import React from 'react';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';

const ADD_MESSAGE = gql`
  mutation($text: String!, $chatId: Int!) {
    addMessage(text: $text, chatId: $chatId) {
      id
      text
      createdAt
      chatId
    }
  }
`;

const withAddMessage = Component => props => {
  return (
    <Mutation mutation={ADD_MESSAGE}>
      {addMessage => {
        return (
          <Component {...props} addMessage={({ text, chatId }) => addMessage({ variables: { text, chatId } })} />
        )
      }}
    </Mutation>
  );
};

export default withAddMessage;