import React, { Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { MainView } from '../components/views/MainView'
import RegistrationRequestForm from '../components/forms/RegistrationRequestForm'

export default class SignUpContainer extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    return (
      <MainView className="Authentication isSignUp">
        <div className="AuthenticationFormDialog">
          <RegistrationRequestForm />
        </div>
      </MainView>
    )
  }
}

