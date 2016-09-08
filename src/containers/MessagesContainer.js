import React, { Component, PropTypes } from 'react'

class MessagesContainer extends Component {

  static propTypes = {
    activeConversation: PropTypes.string,
  }

  render() {
    return (
      <div className="Dialog MessagesDialog">
        <h2>Messages</h2>
        <div className="Conversations">
        </div>
        <div className="Messages">
        </div>
        <input type="textarea" className="TextInput">
        </input>
      </div>
    )
  }
}

export default MessagesContainer

