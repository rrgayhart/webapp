/* eslint-disable new-cap */
import Immutable from 'immutable'
import { REHYDRATE } from 'redux-persist/constants'
import { AUTHENTICATION, PROFILE } from '../constants/action_types'
import Session from '../lib/session'

export const initialState = Immutable.Map({
  accessToken: null,
  createdAt: null,
  expirationDate: null,
  expiresIn: null,
  isLoggedIn: false,
  refreshToken: null,
  tokenType: null,
})

export default (state = initialState, action) => {
  let auth
  switch (action.type) {
    case AUTHENTICATION.CLEAR_STORE:
    case PROFILE.DELETE_SUCCESS:
      return initialState
    case AUTHENTICATION.LOGOUT_SUCCESS:
    case AUTHENTICATION.LOGOUT_FAILURE:
      Session.clear()
      return initialState
    case AUTHENTICATION.USER_SUCCESS:
    case AUTHENTICATION.REFRESH_SUCCESS:
    case PROFILE.SIGNUP_SUCCESS:
      auth = action.payload.response
      return state.merge({
        ...auth,
        expirationDate: new Date((auth.createdAt + auth.expiresIn) * 1000),
        isLoggedIn: true,
      }).toJS()
    case REHYDRATE:
      auth = action.payload.authentication
      if (auth) {
        return state.merge({
          ...auth,
          expirationDate: new Date((auth.createdAt + auth.expiresIn) * 1000),
        }).toJS()
      }
      return state
    default:
      return state
  }
}

