import 'babel-polyfill'
import 'isomorphic-fetch'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { applyRouterMiddleware, browserHistory, Router } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { useScroll } from 'react-router-scroll'
import { persistStore, storages } from 'redux-persist'

import './main.sass'
import { addFeatureDetection, isIOS } from './vendor/jello'
import { scrollToOffsetTop } from './vendor/scrolling'
import { updateStrings as updateTimeAgoStrings } from './vendor/time_ago_in_words'
import store from './store'
import createRoutes from './routes'
import session from './vendor/session'
import Honeybadger from './vendor/honeybadger'
import MemoryStore from './vendor/memory_store'

import './vendor/embetter'
import './vendor/embetter_initializer'

/* eslint-disable global-require */
// only use fastclick if we are on iOS
if (isIOS()) {
  require('react-fastclick')
}
/* eslint-enable global-require */

Honeybadger.configure({
  api_key: ENV.HONEYBADGER_API_KEY,
  environment: ENV.HONEYBADGER_ENVIRONMENT,
})

updateTimeAgoStrings({ about: '' })

function shouldScroll(prevRouterProps, { location }) {
  return !!(location.action === 'REPLACE')
}

const APP_VERSION = '3.0.21'

const history = syncHistoryWithStore(browserHistory, store)
const routes = createRoutes(store)
const element = (
  <Provider store={store}>
    <Router
      history={history}
      render={applyRouterMiddleware(useScroll(shouldScroll))}
      routes={routes}
    />
  </Provider>
)

const whitelist = ['authentication', 'editor', 'gui', 'json', 'profile']

const launchApplication = (storage, hasLocalStorage = false) => {
  addFeatureDetection()
  const persistor = persistStore(store, { storage, whitelist }, () => {
    const root = document.getElementById('root')
    ReactDOM.render(element, root)

    // Scroll fix for layouts with Covers and universal rendering Normally we
    // call this in componentDidMount, but for the server rendered pages that
    // happens well after the page has drawn. Calling it here tries to prevent
    // the jumpiness for the initial page load.
    const viewport = root.querySelector('.Viewport.isOffsetLayout')
    if (viewport) {
      scrollToOffsetTop()
    }
  })

  // check and update current version and only kill off the persisted reducers
  // due to the async nature of the default storage we need to check against the
  // real localStorage to determine if we should purge to avoid a weird race condition
  if (hasLocalStorage) {
    if (localStorage.getItem('APP_VERSION') !== APP_VERSION) {
      persistor.purge(['json'])
      session.clear()
      storage.setItem('APP_VERSION', APP_VERSION, () => {})
    }
  } else {
    storage.getItem('APP_VERSION', (error, result) => {
      if (result && result !== APP_VERSION) {
        persistor.purge(['json'])
        session.clear()
        storage.setItem('APP_VERSION', APP_VERSION, () => {})
      }
    })
  }
}

// this will fail in a safari private window
function isLocalStorageSupported() {
  if (typeof window === 'undefined') { return false }
  const testKey = 'test-localStorage'
  const storage = window.localStorage
  try {
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

if (isLocalStorageSupported()) {
  // use localStorage as indexedDB seems to
  // have issues in chrome and firefox private
  launchApplication(storages.asyncLocalStorage, true)
} else {
  // localStorage fails, use an in-memory store
  launchApplication(MemoryStore)
}

