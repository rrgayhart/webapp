import React, { Component, PropTypes } from 'react'
import FormButton from '../components/forms/FormButton'

class MessagesContainer extends Component {

  static propTypes = {
    activeConversation: PropTypes.string,
  }

  onClickStartConversation = () => {
    console.log('click start convo')
  }

  render() {
    return (
      <div className="Dialog MessagesDialog">
        <h2>Messages</h2>
        <FormButton
          className="FormButton isRounded isAutoSize"
          onClick={this.onClickStartConversation}
        >
          Start Conversation
        </FormButton>
        <div className="Conversations" />
        <div className="Messages" />
        <input type="textarea" className="TextInput" />
        <FormButton
          className="FormButton isRounded isAutoSize Send"
          onClick={this.onClickStartConversation}
        >
          Send
        </FormButton>
      </div>
    )
  }
}

export default MessagesContainer

