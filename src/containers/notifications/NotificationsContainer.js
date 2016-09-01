import React, { Component, PropTypes } from 'react'
import { ScrollContainer } from 'react-router-scroll'
import _ from 'lodash'
import { connect } from 'react-redux'
import { GUI, LOAD_STREAM_SUCCESS } from '../../constants/action_types'
import { scrollElToTop } from '../../vendor/scrolling'
import { toggleNotifications } from '../../actions/gui'
import { loadNotifications } from '../../actions/notifications'
import StreamContainer from '../../containers/StreamContainer'
import {
  BubbleIcon,
  HeartIcon,
  RepostIcon,
  RelationshipIcon,
} from '../../components/notifications/NotificationIcons'
import { TabListButtons } from '../../components/tabs/TabList'
import { Paginator } from '../../components/streams/Paginator'

class NotificationsContainer extends Component {

  static propTypes = {
    activeTabType: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    streamAction: PropTypes.object,
  }

  static defaultProps = {
    activeTabType: 'all',
  }

  componentWillMount() {
    this.body = document.body
    this.state = { isReloading: false }
  }

  componentDidMount() {
    document.addEventListener('click', this.onClickDocument)
    document.addEventListener('touchstart', this.onClickDocument)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.streamType === LOAD_STREAM_SUCCESS) {
      this.setState({ isReloading: false })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeTabType !== this.props.activeTabType && this.scrollContainer) {
      this.scrollContainer.scrollTop = 0
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClickDocument)
    document.removeEventListener('touchstart', this.onClickDocument)
  }

  onMouseOver = () => {
    this.body.classList.add('isNotificationsScrolling')
  }

  onMouseOut = () => {
    this.body.classList.remove('isNotificationsScrolling')
  }

  onClickTab = ({ type }) => {
    const { dispatch } = this.props
    if (this.state.activeTabType === type) {
      scrollElToTop(this.scrollContainer)
      this.setState({ isReloading: true })
    } else {
      dispatch({
        type: GUI.NOTIFICATIONS_TAB,
        payload: { activeTabType: type },
      })
    }
    this.setState({ activeTabType: type })
  }

  onClickSelf = (e) => {
    if (!e.metaKey && !e.which === 2) {
      e.preventDefault()
    }
    this.ignoreNext = true
    setTimeout(() => { this.ignoreNext = false }, 1)
  }

  onClickDocument = (e) => {
    if (this.ignoreNext) {
      return
    }
    const classList = e.target.classList
    if (classList.contains('TabButton') ||
        classList.contains('RelationshipButton') ||
        classList.contains('StarshipButton')
       ) { return }
    const { dispatch } = this.props
    dispatch(toggleNotifications({ isActive: false }))
  }

  render() {
    const { activeTabType, streamAction } = this.props
    const { isReloading } = this.state
    const tabs = [
      { type: 'all', children: 'All' },
      { type: 'comments', children: <BubbleIcon /> },
      { type: 'mentions', children: '@' },
      { type: 'loves', children: <HeartIcon /> },
      { type: 'reposts', children: <RepostIcon /> },
      { type: 'relationships', children: <RelationshipIcon /> },
    ]
    return (
      <div
        className="NotificationsContainer"
        onClick={this.onClickSelf}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <TabListButtons
          activeType={activeTabType}
          className="IconTabList NotificationsContainerTabs"
          onTabClick={this.onClickTab}
          tabClasses="IconTab"
          tabs={tabs}
        />
        <ScrollContainer
          scrollKey="notificationPopover"
        >
          <div
            className="Scrollable"
            ref={(comp) => { this.scrollContainer = comp }}
          >
            {
              isReloading ?
                <Paginator
                  className="NotificationReload"
                  isHidden={false}
                  totalPages={0}
                  totalPagesRemaining={0}
                /> :
                null
            }
            <StreamContainer
              action={streamAction}
              className="isFullWidth"
              key={`notificationView_${activeTabType}`}
              isModalComponent
              scrollContainer={this.scrollContainer}
            />
          </div>
        </ScrollContainer>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const activeTabType = state.gui.activeNotificationsType
  return {
    activeTabType,
    streamAction: loadNotifications({ category: activeTabType }),
    streamType: _.get(state, 'stream.type'),
  }
}

export default connect(mapStateToProps)(NotificationsContainer)

