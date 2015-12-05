import * as ACTION_TYPES from '../constants/action_types'
import * as MAPPING_TYPES from '../constants/mapping_types'
import * as api from '../networking/api'
import * as StreamRenderables from '../components/streams/StreamRenderables'

let cachedCommunity
let cachedUsers

export function loadCommunities() {
  if (cachedCommunity) {
    cachedCommunity.payload.endpoint = null
    return cachedCommunity
  }
  const cache = {
    type: ACTION_TYPES.LOAD_STREAM,
    payload: { endpoint: api.communitiesPath(), vo: {} },
    meta: {
      defaultMode: 'grid',
      mappingType: MAPPING_TYPES.USERS,
      renderStream: {
        asList: StreamRenderables.usersAsCards,
        asGrid: StreamRenderables.usersAsCards,
      },
    },
  }

  cachedCommunity = {
    ...cache,
    ...{ type: ACTION_TYPES.LOAD_STREAM_SUCCESS },
  }
  return cache
}

export function loadAwesomePeople() {
  if (cachedUsers) {
    cachedUsers.payload.endpoint = null
    return cachedUsers
  }
  const cache = {
    type: ACTION_TYPES.LOAD_STREAM,
    payload: { endpoint: api.awesomePeoplePath(), vo: {} },
    meta: {
      defaultMode: 'grid',
      mappingType: MAPPING_TYPES.USERS,
      renderStream: {
        asList: StreamRenderables.usersAsList,
        asGrid: StreamRenderables.usersAsGrid,
      },
    },
  }

  cachedUsers = {
    ...cache,
    ...{ type: ACTION_TYPES.LOAD_STREAM_SUCCESS },
  }
  return cache
}

export function relationshipBatchSave(ids, priority = 'friend') {
  return {
    type: ACTION_TYPES.POST_JSON,
    meta: { mappingType: MAPPING_TYPES.RELATIONSHIPS },
    payload: {
      method: 'POST',
      endpoint: api.relationshipBatchPath(),
      body: JSON.stringify({ user_ids: ids, priority: priority }),
    },
  }
}

