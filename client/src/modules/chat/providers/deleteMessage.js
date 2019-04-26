import React from 'react';
import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo';

const DELETE_MESSAGE = gql`
  mutation($id: String!) {
    deleteMessage(id: $id) {
      _id
    }
  }
`;

const withDeleteMessage = Component => props => {
  return (
    <Mutation mutation={DELETE_MESSAGE}>
      {deleteMessage => {
        return (
          <Component {...props} deleteMessage={ id => deleteMessage({ variables: { id } })}
          />
        )
      }}
    </Mutation>
  );
};

export default withDeleteMessage;