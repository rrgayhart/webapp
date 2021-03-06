import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import reduce from 'lodash/reduce'
import values from 'lodash/values'
import { suggestEmoji } from '../components/completers/EmojiSuggester'
import { userRegex } from '../components/completers/Completer'
import { COMMENT, EDITOR, POST } from '../constants/action_types'

const methods = {}
const initialState = {
  collection: {},
  hasContent: false,
  hasMedia: false,
  hasMention: false,
  isLoading: false,
  isPosting: false,
  order: [],
  postBuyLink: null,
  shouldPersist: false,
  uid: 0,
}

methods.addCompletions = (state, action) => {
  const newState = cloneDeep(state)
  const { payload } = action
  if (payload && payload.response) {
    const { type = 'user', word } = payload
    if (type === 'user') {
      newState.completions = { data: payload.response.autocompleteResults, type }
    } else if (type === 'emoji') {
      newState.completions = { data: suggestEmoji(word, payload.response.emojis), type }
    }
  } else {
    newState.completions = null
  }
  return newState
}


methods.rehydrateEditors = (persistedEditors = {}) => {
  const editors = {}
  Object.keys(persistedEditors).forEach((item) => {
    const pe = persistedEditors[item]
    if (pe.shouldPersist) {
      // clear out the blobs
      Object.keys(pe.collection).forEach((uid) => {
        const block = pe.collection[uid]
        if (/image/.test(block.kind)) {
          delete block.blob
          pe.collection[uid] = block
        }
      })
      pe.isLoading = false
      pe.isPosting = false
      editors[item] = pe
    }
  })
  return editors
}

methods.addHasContent = (state) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  const firstBlock = collection[order[0]]
  if (!firstBlock) { return state }
  const hasContent = Boolean(
    order.length > 1 ||
    (firstBlock &&
    firstBlock.data.length &&
    firstBlock.data !== '<br>')
  )
  newState.hasContent = hasContent
  return newState
}

methods.addHasMedia = (state) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  newState.hasMedia = order.some(uid => /embed|image/.test(collection[uid].kind))
  return newState
}

methods.addHasMention = (state) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  let hasMention = false
  for (const uid of order) {
    const block = collection[uid]
    if (block && /text/.test(block.kind) && userRegex.test(block.data)) {
      hasMention = true
      break
    }
  }
  newState.hasMention = hasMention
  return newState
}

methods.addIsLoading = (state) => {
  const newState = cloneDeep(state)
  const { collection } = newState
  let isLoading = values(collection).some(block =>
    /image/.test(block.kind) && block.isLoading
  )
  if (!isLoading && newState.dragBlock) { isLoading = newState.dragBlock.isLoading }
  newState.isLoading = isLoading
  return newState
}

methods.add = ({ block, shouldCheckForEmpty = true, state }) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  const newBlock = { ...block, uid: newState.uid }
  if (newState.postBuyLink) {
    newBlock.linkUrl = newState.postBuyLink
  }
  collection[newState.uid] = newBlock
  order.push(newState.uid)
  newState.uid += 1
  if (shouldCheckForEmpty) { return methods.addEmptyTextBlock(newState) }
  return newState
}

methods.addEmptyTextBlock = (state, shouldCheckForEmpty = false) => {
  let newState = cloneDeep(state)
  const { collection, order } = newState
  if (order.length > 1) {
    const last = collection[order[order.length - 1]]
    const secondToLast = collection[order[order.length - 2]]
    if (/text/.test(secondToLast.kind) && /text/.test(last.kind) && !last.data.length) {
      return methods.remove({ shouldCheckForEmpty, state: newState, uid: last.uid })
    }
  }
  if (!order.length || !/text/.test(collection[order[order.length - 1]].kind)) {
    newState = methods.add({ block: { data: '', kind: 'text' }, state: newState })
  }
  return newState
}

methods.remove = ({ shouldCheckForEmpty = true, state, uid }) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  delete collection[uid]
  order.splice(order.indexOf(uid), 1)
  if (shouldCheckForEmpty) { return methods.addEmptyTextBlock(newState) }
  return newState
}

methods.removeEmptyTextBlock = (state) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  if (order.length > 0) {
    const last = collection[order[order.length - 1]]
    if (last && /text/.test(last.kind) && !last.data.length) {
      delete collection[last.uid]
      order.splice(order.indexOf(last.uid), 1)
    }
  }
  return newState
}

methods.updateBlock = (state, action) => {
  const newState = cloneDeep(state)
  const { block, uid } = action.payload
  newState.collection[uid] = block
  return newState
}

methods.reorderBlocks = (state, action) => {
  const newState = cloneDeep(state)
  const { order } = newState
  const { delta, uid } = action.payload
  const index = order.indexOf(uid)
  // remove from old spot
  order.splice(index, 1)
  // add to new spot
  order.splice(index + delta, 0, uid)
  return newState
}

methods.appendText = (state, text) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  const textBlocks = order.filter(orderUid => /text/.test(collection[orderUid].kind))
  const lastTextBlock = collection[textBlocks[textBlocks.length - 1]]
  if (lastTextBlock) {
    lastTextBlock.data += text
    collection[lastTextBlock.uid] = lastTextBlock
  }
  return newState
}

methods.appendUsernames = (state, usernames) => {
  const newState = cloneDeep(state)
  const { collection, order } = newState
  const textBlocks = order.filter(orderUid => /text/.test(collection[orderUid].kind))
  const lastTextBlock = collection[textBlocks[textBlocks.length - 1]]
  const text = reduce(usernames, (memo, { username }) => `${memo}@${username} `, '')
  if (lastTextBlock && !lastTextBlock.data.includes(text)) {
    lastTextBlock.data += text
    collection[lastTextBlock.uid] = lastTextBlock
  }
  return newState
}

methods.replaceText = (state, action) => {
  const newState = cloneDeep(state)
  const { collection } = newState
  const { editorId, uid } = action.payload
  if (/text/.test(collection[uid].kind)) {
    const selector = `[data-editor-id="${editorId}"][data-collection-id="${uid}"]`
    const elem = document.querySelector(selector)
    if (elem && elem.firstChild) {
      collection[uid].data = elem.firstChild.innerHTML
    }
  }
  return newState
}

methods.updateBuyLink = (state, action) => {
  const newState = cloneDeep(state)
  const { payload: { link } } = action
  // once individual blocks can get their own links
  // we can rip out this overall property on editor
  newState.postBuyLink = link
  newState.order.forEach((uid) => {
    const block = newState.collection[uid]
    if (link && link.length) {
      block.linkUrl = link
    } else {
      delete block.linkUrl
    }
  })
  return newState
}

methods.getEditorObject = (state = initialState, action) => {
  let newState = cloneDeep(state)
  switch (action.type) {
    case EDITOR.ADD_BLOCK:
      return methods.add({
        block: action.payload.block,
        state: newState,
        shouldCheckForEmpty: action.payload.shouldCheckForEmpty,
      })
    case EDITOR.ADD_DRAG_BLOCK:
      newState.dragBlock = action.payload.block
      return newState
    case EDITOR.ADD_EMPTY_TEXT_BLOCK:
      return methods.addEmptyTextBlock(newState)
    case EDITOR.APPEND_TEXT:
      return methods.appendText(newState, action.payload.text)
    case EDITOR.INITIALIZE:
      if (state.shouldPersist) {
        return state
      }
      return initialState
    case EDITOR.POST_PREVIEW_SUCCESS:
      newState = methods.removeEmptyTextBlock(newState)
      newState = methods.add({
        block: { ...action.payload.response.postPreviews.body[0] },
        state: newState,
      })
      return newState
    case EDITOR.REMOVE_BLOCK:
      return methods.remove({ state: newState, uid: action.payload.uid })
    case EDITOR.REMOVE_DRAG_BLOCK:
      delete newState.dragBlock
      return newState
    case EDITOR.REORDER_BLOCKS:
      return methods.reorderBlocks(newState, action)
    case EDITOR.REPLACE_TEXT:
      return methods.replaceText(newState, action)
    case COMMENT.CREATE_REQUEST:
    case COMMENT.UPDATE_REQUEST:
    case POST.CREATE_REQUEST:
    case POST.UPDATE_REQUEST:
      newState.isPosting = true
      return newState
    case COMMENT.CREATE_SUCCESS:
    case COMMENT.UPDATE_SUCCESS:
    case EDITOR.RESET:
    case POST.CREATE_SUCCESS:
    case POST.UPDATE_SUCCESS:
      return methods.addEmptyTextBlock({ ...initialState, uid: newState.uid })
    case COMMENT.CREATE_FAILURE:
    case COMMENT.UPDATE_FAILURE:
    case POST.CREATE_FAILURE:
    case POST.UPDATE_FAILURE:
      newState.isPosting = false
      return newState
    case EDITOR.LOAD_REPLY_ALL_SUCCESS:
      return methods.appendUsernames(newState, get(action, 'payload.response.usernames', []))
    case EDITOR.SAVE_ASSET_SUCCESS:
      if (newState.dragBlock && newState.dragBlock.uid === action.payload.uid) {
        newState.dragBlock = {
          ...newState.dragBlock,
          data: { url: action.payload.response.url },
          isLoading: false,
        }
      } else {
        newState.collection[action.payload.uid] = {
          ...newState.collection[action.payload.uid],
          data: { url: action.payload.response.url },
          isLoading: false,
        }
      }
      newState.isPosting = false
      return newState
    case EDITOR.TMP_IMAGE_CREATED:
      newState = methods.removeEmptyTextBlock(newState)
      newState = methods.add({
        block: {
          blob: action.payload.url,
          kind: 'image',
          data: {},
          isLoading: true,
        },
        state: newState,
      })
      return newState
    case EDITOR.UPDATE_BUY_LINK:
      return methods.updateBuyLink(newState, action)
    case EDITOR.UPDATE_BLOCK:
      newState = methods.updateBlock(newState, action)
      newState.isPosting = false
      return newState
    default:
      return state
  }
}

export default methods
export { initialState, methods }

