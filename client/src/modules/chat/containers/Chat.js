import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Label, Input } from 'reactstrap';
import { compose } from 'react-apollo';

import { chats } from '../providers';
import { Message } from './';
import '../styles/styles.css';

const Chat = props => {
  const { chats } = props;
  const [ chatId, setChatId ] = useState(null);

  useEffect(() => {
    if (!chatId && chats) {
      setChatId(+chats[0].id)
    }
  }, [chats]);

  const renderChatOptions = () => {
    const { chats } = props;
    return chats ? chats.map(({ id, name }) => <option key={id} value={id}>{name}</option>) : null;
  };

    return (
      <Container>
        <Row>
          <Col>
            <h2 className="text-center chat-title">Chat</h2>
            <hr/>
            <Label for="exampleSelect">Select Chat</Label>
            <Input type="select" name="select" id="exampleSelect" onChange={({ target: { value } }) => setChatId(+value)} >
              {renderChatOptions()}
            </Input>
            <hr/>
            <div className="chat-container">
              <Message chatId={chatId} />
            </div>
          </Col>
        </Row>
      </Container>
    );
};

export default compose(chats)(Chat);
