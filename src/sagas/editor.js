/* eslint-disable no-constant-condition */
import { get } from 'lodash'
import { actionChannel, call, fork, put, select, take } from 'redux-saga/effects'
import * as ACTION_TYPES from '../constants/action_types'
import { temporaryAssetCreated, uploadAsset } from '../actions/editor'
import { isValidFileType } from '../helpers/file_helper'
import { popAlertsForFile } from './uploader'

export function* saveAsset(channel) {
  while (true) {
    const action = yield take(channel)
    const editorId = get(action, 'payload.editorId')
    const file = get(action, 'payload.file')

    // The - 2 should always be consistent. The reason is that when a tmp image
    // gets created at say uid 1 an additional text block is added to the bottom
    // of the editor at uid 2 and the uid of the editor is now sitting at 3
    // since it gets incremented after a block is added. So the - 2 gets us from
    // the 3 back to the 1 where the image should reconcile back to.
    if (editorId && file) {
      try {
        const fileData = yield call(isValidFileType, file)
        yield call(popAlertsForFile, fileData, action)
        yield put(temporaryAssetCreated(URL.createObjectURL(file), editorId))
        const uid = yield select(state => state.editor[editorId].uid - 2)
        yield put(uploadAsset(ACTION_TYPES.EDITOR.SAVE_IMAGE, file, editorId, uid))
      } catch (error) {
        // don't upload the file
      }
    }
  }
}

export default function* editor() {
  const channel = yield actionChannel(ACTION_TYPES.EDITOR.SAVE_ASSET)
  yield fork(saveAsset, channel)
}
