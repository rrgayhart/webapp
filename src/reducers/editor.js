/* eslint-disable new-cap */
import Immutable from 'immutable'
import { REHYDRATE } from 'redux-persist/constants'
import get from 'lodash/get'
import { AUTHENTICATION, EDITOR, PROFILE } from '../constants/action_types'
import editorMethods from '../helpers/editor_helper'

export const initialState = Immutable.Map({ completions: Immutable.Map() })

export default (state = initialState, action) => {
  const editorId = get(action, 'payload.editorId')
  const editor = state.get(`${editorId}`)
  let updatedState = null
  if (editorId) {
    updatedState = state.set(`${editorId}`, editorMethods.getEditorObject(editor, action))
    if (action.type === EDITOR.INITIALIZE) {
      updatedState = state.setIn([editorId, 'shouldPersist'], get(action, 'payload.shouldPersist', false))
    } else if (editor) {
      updatedState = state.setIn([editorId, 'hasContent'], editorMethods.hasContent(editor))
        .state.setIn([editorId, 'hasMedia'], editorMethods.hasMedia(editor))
        .state.setIn([editorId, 'hasMention'], editorMethods.hasMention(editor))
        .state.setIn([editorId, 'isLoading'], editorMethods.isLoading(editor))
    }
    console.log('editor stuff', updatedState)
    return updatedState
  }
  switch (action.type) {
    case AUTHENTICATION.LOGOUT:
    case PROFILE.DELETE_SUCCESS:
      return initialState
    case EDITOR.CLEAR_AUTO_COMPLETERS:
      return state.set('completions', null)
    case EDITOR.EMOJI_COMPLETER_SUCCESS:
    case EDITOR.USER_COMPLETER_SUCCESS:
      return state.set('completions', editorMethods.getCompletions(action))
    case REHYDRATE:
      if (action.payload.editor) {
        return editorMethods.rehydrateEditors(action.payload.editor)
      }
      return state
    default:
      return state
  }
}

export { editorMethods }

