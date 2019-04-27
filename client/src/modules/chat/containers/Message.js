import React, { useEffect } from 'react'
import { compose } from 'react-apollo';

import { messages, addMessage, deleteMessage, messagesSubscription} from '../providers';
import { MessageList, ChatForm } from '../components';
import { onAddMessage } from '../providers/addMessage'
import { onDeleteMessage } from '../providers/deleteMessage'
import '../styles/styles.css';

const Message = props => {
  const {messagesUpdated, updateQuery, messages, loading, addMessage, deleteMessage, chatId } = props;
  useEffect(() => {
    if (messagesUpdated) {
      const {mutation, message} = messagesUpdated;
      updateQuery(prev => {
        switch (mutation) {
          case 'CREATED':
            return onAddMessage(prev, message);
          case 'DELETED':
            return onDeleteMessage(prev, message.id);
          default:
            return prev;
        }
      });
    }
  }, [messagesUpdated]);

  return (<>
    <MessageList loading={loading} messages={messages} deleteMessage={deleteMessage}/>
    <ChatForm addMessage={addMessage} chatId={chatId}/>
  </>);
};

export default compose(messages, addMessage, deleteMessage, messagesSubscription)(Message);
