/* eslint-disable no-constant-condition */
import React from 'react'
import { camelizeKeys } from 'humps'
import {
  actionChannel,
  call,
  fork,
  put,
  select,
  take,
} from 'redux-saga/effects'

import { PROFILE, EDITOR } from '../constants/action_types'

import { s3CredentialsPath } from '../networking/api'
import FileTypeDialog from '../containers/dialogs/FileTypeDialog'

import { accessTokenSelector } from './selectors'
import { openAlert } from '../actions/modals'
import { temporaryEditorAssetCreated } from '../actions/editor'
// import { temporaryAssetCreated } from '../actions/profile'
import { isValidFileType, processImage, SUPPORTED_IMAGE_TYPES } from '../helpers/file_helper'

function getCredentialsHeader(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

function imageGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = (c === 'x' ? r : r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const uploadTypes = [
  PROFILE.SAVE_AVATAR,
  PROFILE.SAVE_COVER,
  EDITOR.SAVE_ASSET,
]

export function checkStatus(response) {
  if (response.ok) {
    return response
  }
  const error = new Error(response.statusText)
  error.response = response
  throw error
}

export function parseJSON(response) {
  return (response.status === 200) ? response.json() : response
}

export function* fetchCredentials(accessToken) {
  const response = yield call(fetch, s3CredentialsPath().path, {
    method: 'GET',
    headers: getCredentialsHeader(accessToken),
  })

  yield call(checkStatus, response)
  return yield call(parseJSON, response)
}

// TODO: can remove this export once the exif branch is merged
export function* popAlertsForFile({ fileType, isValid }, { type }) {
  if (isValid) {
    if (fileType === SUPPORTED_IMAGE_TYPES.GIF &&
        (type === PROFILE.SAVE_AVATAR ||
         type === PROFILE.SAVE_COVER)) {
      yield put(openAlert(
        <FileTypeDialog
          title="Looks like you uploaded a .gif."
          body="If it’s animated people will only see the animation on your profile page."
        />
      ))
    }
  } else {
    yield put(openAlert(
      <FileTypeDialog
        title="Invalid file type"
        body="We support .jpg, .gif, .png, and .bmp files."
      />
    ))
    throw new Error('Invalid file type')
  }
}

function getFilename(type) {
  return `ello-${imageGuid() + type.replace('image/', '.')}`
}

function getFileKey(prefix, filename) {
  return `${prefix}/${encodeURIComponent(filename)}`
}

function getAssetUrl(endpoint, key) {
  return `${endpoint}/${key}`
}

function getUploadData(key, credentials, file, fileData) {
  const data = new FormData()
  data.append('key', key)
  data.append('AWSAccessKeyId', credentials.access_key)
  data.append('acl', 'public-read')
  data.append('success_action_status', '201')
  data.append('policy', credentials.policy)
  data.append('signature', credentials.signature)
  data.append('Content-Type', file.type)
  data.append('file', fileData || file)
  return data
}

function* performUpload(action) {
  const { payload, type, meta } = action
  const { endpoint, file } = payload
  const REQUEST = `${type}_REQUEST`
  const SUCCESS = `${type}_SUCCESS`
  const FAILURE = `${type}_FAILURE`
  const accessToken = yield select(accessTokenSelector)
  let assetUrl
  let uid

  function* postAsset(credentials, fileData) {
    const filename = getFilename(file.type)
    const { prefix, endpoint: assetEndpoint } = credentials
    const key = getFileKey(prefix, filename)
    assetUrl = getAssetUrl(assetEndpoint, key)

    const fetchCall = call(fetch, assetEndpoint, {
      method: 'POST',
      body: getUploadData(key, credentials, file, fileData),
    })
    const response = yield fetchCall
    yield call(checkStatus, response)
    return response
  }


  // Dispatch start of request
  yield put({ type: REQUEST, payload, meta })

  try {
    const fileData = yield call(isValidFileType, file)
    yield call(popAlertsForFile, fileData, action)
    // TODO: add max width/height for avatars
    // TODO: figure out a cool way to display the initial image before processing
    const objectURL = URL.createObjectURL(file)
    const imageData = yield call(processImage, { ...fileData, file: objectURL })
    if (type === EDITOR.SAVE_ASSET) {
      const { editorId } = payload
      yield put(temporaryEditorAssetCreated(imageData.objectURL, editorId))
      // The - 2 should always be consistent. The reason is that when a tmp image
      // gets created at say uid 1 an additional text block is added to the bottom
      // of the editor at uid 2 and the uid of the editor is now sitting at 3
      // since it gets incremented after a block is added. So the - 2 gets us from
      // the 3 back to the 1 where the image should reconcile back to.
      uid = yield select(state => state.editor[editorId].uid - 2)
    }
    const { credentials } = yield call(fetchCredentials, accessToken)
    yield call(postAsset, credentials, imageData.blob)

    if (!endpoint) {
      payload.response = { url: assetUrl }
      payload.uid = uid
      yield put({ meta, payload, type: SUCCESS })
      return
    }

    const saveLocationToApi = function* saveLocationToApi() {
      const vo = (type === PROFILE.SAVE_AVATAR) ?
            { remote_avatar_url: assetUrl } :
            { remote_cover_image_url: assetUrl }
      const response = yield call(fetch, endpoint.path, {
        method: 'PATCH',
        headers: getCredentialsHeader(accessToken),
        body: JSON.stringify(vo),
      })
      yield call(checkStatus, response)
      return yield call(parseJSON, response)
    }

    const response = yield call(saveLocationToApi)
    payload.response = {
      ...camelizeKeys(response),
      assetUrl,
    }
    yield put({ meta, payload, type: SUCCESS })
  } catch (error) {
    yield put({ error, meta, payload, type: FAILURE })
  }
}

function* handleUpload(uploadChannel) {
  while (true) {
    const action = yield take(uploadChannel)
    yield fork(performUpload, action)
  }
}

export default function* uploader() {
  const uploadChannel = yield actionChannel(uploadTypes)
  yield fork(handleUpload, uploadChannel)
}
