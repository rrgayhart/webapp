import { PROMOTIONS } from '../constants/action_types'

const initialState = {
  authentication: [],
}

export function promotions(state = initialState, action) {
  switch (action.type) {
    case PROMOTIONS.AUTHENTICATION_SUCCESS:
      return {
        ...state,
        authentication: action.payload.response,
      }
    default:
      return state
  }
}

export default promotions

