import React from 'react';
import { Button } from 'reactstrap';

const MessageList = props => {
  const renderMessages = () => {
    const {messages = [], loading, deleteMessage} = props;

    if (!loading && messages && messages.length > 0) {
      return messages.map(message => {
        return (
          <div key={message.id} className="message">
            <div className="message-info">
              <div>{message.text}</div>
              <Button close onClick={() => deleteMessage(message.id)}/>
            </div>
            <div className="time">{new Date(+message.createdAt).toTimeString().slice(0, 5)}</div>
          </div>
        );
      });
    } else {
      return (
        <div>
          <h3>No messages available</h3>
        </div>
      );
    }
  };

    return (
      <div className="messages">
        {renderMessages()}
      </div>
    );
};

export default MessageList;
