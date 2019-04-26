import React, { Component } from 'react';

import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';

export default class ChatForm extends Component {
  state = {
    text: ''
  };

  onSubmit = () => {
    this.props.addMessage(this.state.text);
    this.setState({ text: '' });
  };

  render() {
    const { text } = this.state;
    return (
      <InputGroup className="chat-form">
        <Input onChange={({ target: { value } }) => this.setState({ text: value })} value={text} />
        <InputGroupAddon addonType="append">
          <Button color="secondary" onClick={() => this.onSubmit()}>Submit</Button>
        </InputGroupAddon>
      </InputGroup>
    );
  }
}