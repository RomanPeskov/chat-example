import React, {Component} from 'react'
import { Container, Row, Col, Label, Input } from 'reactstrap';

import { chats, messages, addMessage, deleteMessage, messagesSubscription} from '../providers';
import {MessageList, ChatForm} from '../components';
import '../styles/styles.css';


const onAddMessage = (prev, newMessage) => {
  // ignore if duplicate
  if (prev.messages && prev.messages.some(({_id}) => _id === newMessage._id)) {
    return prev;
  }

  return {...prev, messages: [...prev.messages, {...newMessage, __typename: 'Message'}]}
};

const onDeleteMessage = (prev, id) => ({...prev, messages: prev.messages.filter(({_id}) => id !== _id)});

@chats
@messages
@addMessage
@deleteMessage
@messagesSubscription
export default class Chat extends Component {
  componentDidUpdate() {
    const {messagesUpdated, updateQuery} = this.props;
    if (messagesUpdated) {
      this.updateMessages(messagesUpdated, updateQuery);
    }
  }

  updateMessages = (messagesUpdated, updateQuery) => {
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
  };

  renderChatOptions = () => {
    const { chats } = this.props;
    return chats ? chats.map(({ id, name }) => <option key={id} value={id}>{name}</option>) : null;
  };

  render() {
    const {messages, loading, addMessage, deleteMessage} = this.props;
    return (
      <Container>
        <Row>
          <Col>
            <h2 className="text-center chat-title">Chat</h2>
            <hr/>
            <Label for="exampleSelect">Select Chat</Label>
            <Input type="select" name="select" id="exampleSelect" onChange={({ target: { value } }) => console.log('value === ', value)} >
              {this.renderChatOptions()}
            </Input>
            <hr/>
            <div className="chat-container">
              <MessageList loading={loading} messages={messages} deleteMessage={deleteMessage}/>
              <ChatForm addMessage={addMessage}/>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}
