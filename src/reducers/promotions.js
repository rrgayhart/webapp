/* eslint-disable new-cap */
import Immutable from 'immutable'
import { PROMOTIONS } from '../constants/action_types'

const initialState = Immutable.Map({
  authentication: Immutable.List(),
  loggedIn: Immutable.List(),
  loggedOut: Immutable.List(),
})

export default (state = initialState, action) => {
  switch (action.type) {
    case PROMOTIONS.AUTHENTICATION_SUCCESS:
      return state.set('authentication', action.payload.response)
    case PROMOTIONS.LOGGED_IN_SUCCESS:
      return state.set('loggedIn', action.payload.response)
    case PROMOTIONS.LOGGED_OUT_SUCCESS:
      return state.set('loggedOut', action.payload.response)
    default:
      return state
  }
}

