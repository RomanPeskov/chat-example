import React, { useEffect } from 'react'
import { compose } from 'react-apollo';

import { messages, addMessage, deleteMessage, messagesSubscription} from '../providers';
import { MessageList, ChatForm } from '../components';
import '../styles/styles.css';


const onAddMessage = (prev, newMessage) => {
  // ignore if duplicate
  if (prev.messages && prev.messages.some(({_id}) => _id === newMessage._id)) {
    return prev;
  }

  return {...prev, messages: [...prev.messages, {...newMessage, __typename: 'Message'}]}
};

const onDeleteMessage = (prev, id) => ({...prev, messages: prev.messages.filter(({_id}) => id !== _id)});

const Message = props => {
  const {messagesUpdated, updateQuery, messages, loading, addMessage, deleteMessage } = props;
  useEffect(() => {
    if (messagesUpdated) {
      const {mutation, message} = messagesUpdated;
      updateQuery(prev => {
        switch (mutation) {
          case 'CREATED':
            return onAddMessage(prev, message);
          case 'DELETED':
            return onDeleteMessage(prev, message._id);
          default:
            return prev;
        }
      });
    }
  }, [messagesUpdated]);

  return (<>
    <MessageList loading={loading} messages={messages} deleteMessage={deleteMessage}/>
    <ChatForm addMessage={addMessage}/>
  </>);
};

export default compose(messages, addMessage, deleteMessage, messagesSubscription)(Message);
