import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { ADD_NEW_IDS_TO_RESULT, MODAL, SET_LAYOUT_MODE } from '../constants/action_types'
import { SESSION_KEYS } from '../constants/gui_types'
import { logout } from '../actions/authentication'
import { setProfileMenuState } from '../actions/gui'
import { checkForNewNotifications } from '../actions/notifications'
import { openOmnibar } from '../actions/omnibar'
import { updateRelationship } from '../actions/relationships'
import { NavbarLoggedIn, NavbarLoggedOut } from '../components/navbar/Navbar'
import Session from '../vendor/session'
import { scrollToTop } from '../vendor/scrollTop'

class NavbarContainer extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isGridMode: PropTypes.bool,
    isProfileMenuActive: PropTypes.bool,
    isLoggedIn: PropTypes.bool.isRequired,
    isNotificationsActive: PropTypes.bool,
    pathname: PropTypes.string.isRequired,
  }

  componentWillMount() {
    this.checkForNotifications()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  componentDidUpdate(prevProps) {
    if (typeof window === 'undefined' || !prevProps.pathname || !this.props.pathname) { return }
    if (prevProps.pathname !== this.props.pathname) {
      this.checkForNotifications()
    }
  }

  componentWillUnmount() {
    this.deactivateProfileMenu()
  }

  onClickAvatar = () => {
    const { isProfileMenuActive } = this.props
    return isProfileMenuActive ? this.deactivateProfileMenu() : this.activateProfileMenu()
  }

  onClickDocument = () => {
    this.deactivateProfileMenu()
  }

  onClickNotification = (e) => {
    if (e) { e.preventDefault() }
    const { dispatch, isNotificationsActive } = this.props
    dispatch({
      type: MODAL.TOGGLE_NOTIFICATIONS,
      payload: { isNotificationsActive: !isNotificationsActive },
    })
  }

  onClickLoadMorePosts = () => {
    const { dispatch } = this.props
    dispatch({ type: ADD_NEW_IDS_TO_RESULT })
    scrollToTop()
  }

  onClickOmniButton = () => {
    const { dispatch } = this.props
    dispatch(openOmnibar())
    scrollToTop()
  }

  onClickToggleLayoutMode = () => {
    const { dispatch, isGridMode } = this.props
    const newMode = isGridMode ? 'list' : 'grid'
    dispatch({ type: SET_LAYOUT_MODE, payload: { mode: newMode } })
  }

  onDragOverOmniButton = (e) => {
    e.preventDefault()
    this.onClickOmniButton()
  }

  onDragOverStreamLink = (e) => {
    e.preventDefault()
    e.target.classList.add('hasDragOver')
  }

  onDragLeaveStreamLink = (e) => {
    e.target.classList.remove('hasDragOver')
  }

  onDropStreamLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.target.classList.remove('hasDragOver')
    if (e.dataTransfer.types.indexOf('application/json') > -1) {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.userId && data.priority) {
        const newPriority = e.target.getAttribute('href') === '/starred' ? 'noise' : 'friend'
        this.props.dispatch(updateRelationship(data.userId, newPriority, data.priority))
      }
    }
  }

  // TODO: probably need to handle this a bit better
  onLogOut = async() => {
    const { dispatch } = this.props
    this.deactivateProfileMenu()
    await dispatch(logout())
    dispatch(push('/enter'))
  }

  // if we're viewing notifications, don't change the lightning-bolt link.
  // on any other page, we have the notifications link go back to whatever
  // category you were viewing last.
  getNotificationCategory() {
    const { pathname } = this.props
    if (pathname.match(/^\/notifications\b/)) { return '' }
    return (
      Session.getItem(SESSION_KEYS.NOTIFICATIONS_FILTER) ?
        `/${Session.getItem(SESSION_KEYS.NOTIFICATIONS_FILTER)}` : ''
    )
  }

  checkForNotifications() {
    const { dispatch, isLoggedIn } = this.props
    if (isLoggedIn) { dispatch(checkForNewNotifications()) }
  }

  activateProfileMenu() {
    const { dispatch, isProfileMenuActive } = this.props
    if (isProfileMenuActive) { return }
    document.addEventListener('click', this.onClickDocument)
    dispatch(setProfileMenuState({ isActive: true }))
  }

  deactivateProfileMenu() {
    const { dispatch, isProfileMenuActive } = this.props
    if (!isProfileMenuActive) { return }
    document.removeEventListener('click', this.onClickDocument)
    dispatch(setProfileMenuState({ isActive: false }))
  }

  render() {
    const { isLoggedIn } = this.props
    if (isLoggedIn) {
      return (
        <NavbarLoggedIn
          { ...this.props }
          notificationCategory={ this.getNotificationCategory() }
          onClickAvatar={ this.onClickAvatar }
          onClickDocument={ this.onClickDocument }
          onClickLoadMorePosts={ this.onClickLoadMorePosts }
          onClickNotification={ this.onClickNotification }
          onClickOmniButton={ this.onClickOmniButton }
          onClickToggleLayoutMode={ this.onClickToggleLayoutMode }
          onDragLeaveStreamLink={ this.onDragLeaveStreamLink }
          onDragOverOmniButton={ this.onDragOverOmniButton }
          onDragOverStreamLink={ this.onDragOverStreamLink }
          onDropStreamLink={ this.onDropStreamLink }
          onLogOut={ this.onLogOut }
        />
      )
    }
    return (
      <NavbarLoggedOut
        { ...this.props }
        onClickLoadMorePosts={ this.onClickLoadMorePosts }
      />
    )
  }
}

const mapStateToProps = (state) => {
  const { authentication, gui, json, modal, profile, routing } = state

  const currentStream = gui.currentStream
  const isLoggedIn = authentication.isLoggedIn
  const pathname = routing.location.pathname
  const result = json.pages ? json.pages[pathname] : null
  const hasLoadMoreButton = Boolean(result && result.newIds)

  if (isLoggedIn) {
    return {
      avatar: profile.avatar,
      currentStream,
      hasLayoutTool: gui.hasLayoutTool,
      hasLoadMoreButton,
      hasNotifications: gui.newNotificationContent,
      isGridMode: gui.isGridMode,
      isLoggedIn,
      isNotificationsActive: modal.isNotificationsActive,
      isProfileMenuActive: gui.isProfileMenuActive,
      pathname,
      username: profile.username,
      viewportDeviceSize: gui.viewportDeviceSize,
    }
  }
  return {
    currentStream,
    hasLoadMoreButton,
    isLoggedIn,
    pathname,
  }
}

export default connect(mapStateToProps)(NavbarContainer)
