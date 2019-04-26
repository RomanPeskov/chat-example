import React, { Component } from 'react';
import { Button } from 'reactstrap';

export default class MessageList extends Component {
  renderMessages = () => {
    const {messages = [], loading, deleteMessage} = this.props;

    if (!loading && messages && messages.length > 0) {
      return messages.map(message => {
        return (
          <div key={message._id} className="message">
            <div className="message-info">
              <div>{message.text}</div>
              <Button close onClick={() => deleteMessage(message._id)}/>
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

  render() {
    return (
      <div className="messages">
        {this.renderMessages()}
      </div>
    );
  }
}
