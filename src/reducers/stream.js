/* eslint-disable new-cap */
import Immutable from 'immutable'
import { AUTHENTICATION, POST, PROFILE, USER } from '../constants/action_types'

const initialState = Immutable.Map()

export default (state = initialState, action = { type: '' }) => {
  if (action.type === AUTHENTICATION.LOGOUT || action.type === PROFILE.DELETE_SUCCESS) {
    return initialState
  } else if (!(action.type === POST.DETAIL_SUCCESS || action.type === USER.DETAIL_SUCCESS ||
               action.type === POST.DETAIL_FAILURE || action.type === USER.DETAIL_FAILURE) &&
             !(action.type.indexOf('COMMENT.') === 0 && action.type.indexOf('SUCCESS') > -1) &&
             action && action.meta && action.meta.updateResult === false) {
    return state
  } else if (action.type === POST.DETAIL_SUCCESS ||
             action.type === USER.DETAIL_SUCCESS ||
             action.type === POST.DETAIL_FAILURE ||
             action.type === USER.DETAIL_FAILURE ||
             action.type.indexOf('LOAD_STREAM_') === 0 ||
             action.type.indexOf('LOAD_NEXT_CONTENT_') === 0 ||
             (action.type.indexOf('COMMENT.') === 0 && action.type.indexOf('SUCCESS') > -1) ||
             (action.type.indexOf('POST.') === 0 && action.type.indexOf('SUCCESS') > -1)) {
    return state.merge(action)
  }
  return state
}

