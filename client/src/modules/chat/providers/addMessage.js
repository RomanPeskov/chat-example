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

const onAddMessage = (prev, newMessage) => {
  // ignore if duplicate
  if (prev.messages && prev.messages.some(({id}) => id === newMessage.id)) {
    return prev;
  }

  return {...prev, messages: [...prev.messages, {...newMessage, __typename: 'Message'}]}
};

export default withAddMessage;
export { onAddMessage };