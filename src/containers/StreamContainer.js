import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import _ from 'lodash'
import { runningFetches } from '../sagas/requester'
import * as ACTION_TYPES from '../constants/action_types'
import { findModel } from '../helpers/json_helper'
import {
  addScrollObject,
  addScrollTarget,
  removeScrollObject,
  removeScrollTarget,
} from '../components/viewport/ScrollComponent'
import { ElloMark } from '../components/svg/ElloIcons'
import { Paginator } from '../components/streams/Paginator'
import { ErrorState4xx } from '../components/errors/Errors'
import { makeSelectStreamProps, selectRoutingPathname } from '../selectors'

export function shouldContainerUpdate(thisProps, nextProps, thisState, nextState) {
  const { stream } = nextProps
  const { action } = nextState
  const updateKey = _.get(action, 'meta.updateKey')
  const streamPath = _.get(stream, 'payload.endpoint.path', '')
  // this prevents nested stream components from clobbering parents
  if (updateKey && !streamPath.match(updateKey)) {
    return false
    // when hitting the back button the result can update and
    // try to feed wrong results to the actions render method
    // thus causing errors when trying to render wrong results
  } else if (nextProps.resultPath !== thisProps.resultPath) {
    return false
  } else if (nextProps.isGridMode !== thisProps.isGridMode) {
    return true
  } else if (thisProps.columnCount !== nextProps.columnCount && nextProps.isGridMode) {
    return true
    // allow page loads to fall through and also allow stream
    // load requests to fall through to show the loader
    // on an initial page load when endpoints don't match
  } else if (!/LOAD_NEXT_CONTENT|POST\.|COMMENT\./.test(stream.type) &&
             stream.type !== ACTION_TYPES.LOAD_STREAM_REQUEST &&
             streamPath !== _.get(action, 'payload.endpoint.path')) {
    return false
  } else if (_.isEqual(nextState, thisState) && _.isEqual(nextProps, thisProps)) {
    return false
  }
  return true
}

export function makeMapStateToProps() {
  const getStreamProps = makeSelectStreamProps()
  const mapStateToProps = (state, props) => {
    const streamProps = getStreamProps(state, props)
    return {
      ...streamProps,
      columnCount: state.gui.columnCount,
      history: state.gui.history,
      innerHeight: state.gui.innerHeight,
      innerWidth: state.gui.innerWidth,
      json: state.json,
      isGridMode: state.gui.isGridMode,
      omnibar: state.omnibar,
      pathname: selectRoutingPathname(state),
      routerState: state.routing.location.state || {},
      stream: state.stream,
    }
  }
  return mapStateToProps
}

class StreamContainer extends Component {

  static propTypes = {
    action: PropTypes.object,
    children: PropTypes.any,
    className: PropTypes.string,
    columnCount: PropTypes.number,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    ignoresScrollPosition: PropTypes.bool.isRequired,
    initModel: PropTypes.object,
    innerHeight: PropTypes.number,
    innerWidth: PropTypes.number,
    isGridMode: PropTypes.bool,
    isModalComponent: PropTypes.bool,
    isUserDetail: PropTypes.bool.isRequired,
    json: PropTypes.object.isRequired,
    omnibar: PropTypes.object,
    paginatorText: PropTypes.string,
    pathname: PropTypes.string,
    renderObj: PropTypes.object.isRequired,
    result: PropTypes.object.isRequired,
    resultPath: PropTypes.string,
    routerState: PropTypes.object,
    scrollContainer: PropTypes.object,
    stream: PropTypes.object.isRequired,
  }

  static defaultProps = {
    paginatorText: 'Loading',
    ignoresScrollPosition: false,
    isUserDetail: false,
    isModalComponent: false,
  }

  componentWillMount() {
    const { action, dispatch, omnibar } = this.props
    if (typeof window !== 'undefined' && action) {
      dispatch(action)
    }

    this.state = { action }
    this.wasOmnibarActive = omnibar.isActive
  }

  componentDidMount() {
    if (window.embetter) {
      window.embetter.reloadPlayers()
    }

    const { isModalComponent } = this.props
    if (!isModalComponent) {
      this.scrollObject = this
      addScrollObject(this.scrollObject)
    }
    if (this.props.isUserDetail) {
      this.scrollToUserDetail()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { stream } = nextProps
    const { action } = this.state
    if (this.props.isModalComponent && !this.props.scrollContainer && nextProps.scrollContainer) {
      this.scrollObject = { component: this, element: nextProps.scrollContainer }
      addScrollTarget(this.scrollObject)
    }
    if (!action) { return }
    if (stream.type === ACTION_TYPES.LOAD_NEXT_CONTENT_SUCCESS) {
      this.setState({ hidePaginator: true })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldContainerUpdate(this.props, nextProps, this.state, nextState)
  }

  componentDidUpdate() {
    if (window.embetter) {
      window.embetter.reloadPlayers()
    }

    const { omnibar, isUserDetail } = this.props
    if (isUserDetail && !omnibar.isActive && this.wasOmnibarActive) {
      this.scrollToUserDetail()
    }
    this.wasOmnibarActive = omnibar.isActive
  }

  componentWillUnmount() {
    if (window.embetter) {
      window.embetter.stopPlayers()
    }
    removeScrollObject(this.scrollObject)
    removeScrollTarget(this.scrollObject)
    this.saveScroll = false
  }

  onScrollBottom() {
    this.onLoadNextPage()
  }

  onScrollBottomTarget() {
    this.onLoadNextPage()
  }

  onLoadNextPage = () => {
    this.loadPage('next')
  }

  setAction(action) {
    this.setState({ action })
    this.props.dispatch(action)
  }

  scrollToUserDetail() {
    const { innerWidth } = this.props
    const offset = Math.round((innerWidth * 0.5625)) - 200
    window.scrollTo(0, offset)
  }

  loadPage(rel) {
    const { dispatch, result, stream } = this.props
    const { action } = this.state
    if (!action) { return }
    const { meta } = action
    const { pagination } = result
    if (!action.payload.endpoint || !pagination[rel] ||
        parseInt(pagination.totalPagesRemaining, 10) === 0 || !action ||
        (stream.type === ACTION_TYPES.LOAD_NEXT_CONTENT_SUCCESS &&
         _.get(stream, 'payload.serverStatus', 0) === 204)) { return }
    if (runningFetches[pagination[rel]]) { return }
    this.setState({ hidePaginator: false })
    const infiniteAction = {
      ...action,
      type: ACTION_TYPES.LOAD_NEXT_CONTENT,
      payload: {
        endpoint: { path: pagination[rel] },
      },
      meta: {
        mappingType: action.payload.endpoint.pagingPath || meta.mappingType,
        resultFilter: meta.resultFilter,
        resultKey: meta.resultKey,
      },
    }
    // this is used for updating the postId on a comment
    // so that the post exsists in the store after load
    if (action.payload.postIdOrToken) {
      infiniteAction.payload.postIdOrToken = action.payload.postIdOrToken
    }
    dispatch(infiniteAction)
  }

  renderError() {
    const { action } = this.props
    const { meta } = action
    return (
      <section className="StreamContainer isError">
        {meta && meta.renderStream && meta.renderStream.asError ?
          meta.renderStream.asError :
          <ErrorState4xx />
        }
      </section>
    )
  }

  renderLoading() {
    const { className } = this.props
    return (
      <section className={classNames('StreamContainer isBusy', className)} >
        <div className="StreamBusyIndicator">
          <ElloMark />
        </div>
      </section>
    )
  }

  renderZeroState() {
    const { action } = this.props
    if (!action) { return null }
    const { meta } = action
    return (
      <section className="StreamContainer">
        {meta && meta.renderStream && meta.renderStream.asZero ?
          meta.renderStream.asZero :
          null
        }
      </section>
    )
  }

  render() {
    const { className, columnCount, initModel, isGridMode, json,
      paginatorText, renderObj, result, stream } = this.props
    const { action, hidePaginator } = this.state
    if (!action) { return null }
    const model = findModel(json, initModel)
    if (model) {
      renderObj.data.push(model)
    } else if (!renderObj.data.length) {
      switch (stream.type) {
        case ACTION_TYPES.LOAD_STREAM_SUCCESS:
          return this.renderZeroState()
        case ACTION_TYPES.LOAD_STREAM_REQUEST:
          return this.renderLoading()
        case ACTION_TYPES.LOAD_STREAM_FAILURE:
          if (stream.error) {
            return this.renderError()
          }
          return null
        default:
          return null
      }
    }
    const { meta } = action
    const renderMethod = isGridMode ? 'asGrid' : 'asList'
    const pagination = result.pagination
    return (
      <section className={classNames('StreamContainer', className)}>
        {meta.renderStream[renderMethod](renderObj, columnCount)}
        {this.props.children}
        <Paginator
          hasShowMoreButton={
            typeof meta.resultKey !== 'undefined' && typeof meta.updateKey !== 'undefined'
          }
          isHidden={hidePaginator}
          loadNextPage={this.onLoadNextPage}
          messageText={paginatorText}
          totalPages={parseInt(pagination.totalPages, 10)}
          totalPagesRemaining={parseInt(pagination.totalPagesRemaining, 10)}
        />
      </section>
    )
  }
}

export default connect(makeMapStateToProps)(StreamContainer)

