import React from 'react';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';

const ADD_MESSAGE = gql`
  mutation($text: String!) {
    addMessage(text: $text) {
      text
    }
  }
`;

const withAddMessage = Component => props => {
  return (
    <Mutation mutation={ADD_MESSAGE}>
      {addMessage => {
        return (
          <Component {...props} addMessage={text => addMessage({ variables: { text } })}
          />
        )
      }}
    </Mutation>
  );
};

export default withAddMessage;