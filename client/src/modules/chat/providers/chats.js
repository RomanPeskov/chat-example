import React from 'react';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';

export const CHATS = gql`
  query chats {
    chats {
      id
      name
    }
  }
`;

const chats = Component => props => {
  return (
    <Query query={CHATS}>
      {({ data }) => {
        if (data) {
          return (
            <Component {...props} chats={data.chats} />
          );
        }
        return <Component {...props} />
      }}
    </Query>
  );
};

export default chats;
