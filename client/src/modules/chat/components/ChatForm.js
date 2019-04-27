import React, { useState } from 'react';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';

const ChatForm = props => {
  const { addMessage, chatId } = props;
  const [ text, setText ] = useState('');

  const onSubmit = () => {
    addMessage({ text, chatId });
    setText('');
  };

  return (
    <InputGroup className="chat-form">
      <Input onChange={({ target: { value } }) => setText(value)} value={text} />
      <InputGroupAddon addonType="append">
        <Button color="secondary" onClick={() => onSubmit()}>Submit</Button>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default ChatForm;