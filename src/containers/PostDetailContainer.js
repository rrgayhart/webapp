import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import * as ACTION_TYPES from '../constants/action_types'
import * as MAPPING_TYPES from '../constants/mapping_types'
import { selectIsLoggedIn } from '../selectors/authentication'
import { selectParamsToken, selectParamsUsername } from '../selectors/params'
import { selectPostFromToken } from '../selectors/post'
import { selectStreamType } from '../selectors/stream'
import { loadComments, loadPostDetail, toggleLovers, toggleReposters } from '../actions/posts'
import { ErrorState4xx } from '../components/errors/Errors'
import { PostDetail, PostDetailError } from '../components/views/PostDetail'

// A lot of information needs to get generated in the meta tags for this page
// before it ever hits React's virtual DOM so it's really beneficial to
// optimzize the amount of times render is called.
export function shouldContainerUpdate(thisProps, nextProps, thisState, nextState) {
  const { author, isLoggedIn, paramsToken, paramsUsername, post } = thisProps
  if (thisState.isStreamFailing !== nextState.isStreamFailing) {
    return true
  } else if (!nextProps.author || !nextProps.post) {
    return false
  }
  if (paramsToken !== nextProps.paramsToken ||
      paramsUsername !== nextProps.paramsUsername ||
      isLoggedIn !== nextProps.isLoggedIn) {
    return true
  }
  if (!isEqual(author, nextProps.author) || !isEqual(post, nextProps.post)) {
    return true
  }
  return false
}

export function mapStateToProps(state, props) {
  const post = selectPostFromToken(state, props)
  return {
    author: post ? state.json[MAPPING_TYPES.USERS][post.authorId] : null,
    isLoggedIn: selectIsLoggedIn(state),
    paramsToken: selectParamsToken(state, props),
    paramsUsername: selectParamsUsername(state, props),
    post,
    streamType: selectStreamType(state),
  }
}

class PostDetailContainer extends Component {

  static propTypes = {
    author: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    post: PropTypes.object,
    paramsToken: PropTypes.string.isRequired,
    paramsUsername: PropTypes.string.isRequired,
  }

  static preRender = (store, routerState) => {
    const params = routerState.params
    return store.dispatch(loadPostDetail(`~${params.token}`, `~${params.username}`))
  }

  componentWillMount() {
    const { dispatch, paramsToken, paramsUsername, post } = this.props
    if (post) {
      this.lovesWasOpen = post.showLovers
      this.repostsWasOpen = post.showReposters
    }
    this.state = { isStreamFailing: false }
    dispatch(loadPostDetail(`~${paramsToken}`, `~${paramsUsername}`))
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, paramsToken, paramsUsername } = this.props
    if (paramsToken !== nextProps.paramsToken || paramsUsername !== nextProps.paramsUsername) {
      dispatch(loadPostDetail(`~${nextProps.paramsToken}`, `~${nextProps.paramsUsername}`))
    }
    if (nextProps.streamType === ACTION_TYPES.POST.DETAIL_SUCCESS) {
      this.setState({ isStreamFailing: false })
    } else if (nextProps.streamType === ACTION_TYPES.POST.DETAIL_FAILURE) {
      this.setState({ isStreamFailing: true })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldContainerUpdate(this.props, nextProps, this.state, nextState)
  }

  componentWillUnmount() {
    const { dispatch, isLoggedIn, post } = this.props
    // this prevents the lover/reposters from firing since logout clears the json store
    if (!isLoggedIn) { return }
    if (!this.lovesWasOpen) {
      dispatch(toggleLovers(post, false))
    }
    if (!this.repostsWasOpen) {
      dispatch(toggleReposters(post, false))
    }
  }

  render() {
    const { author, paramsToken, post } = this.props
    const { isStreamFailing } = this.state
    if (isStreamFailing) {
      return (
        <PostDetailError>
          <ErrorState4xx />
        </PostDetailError>
      )
    }
    const props = {
      author,
      hasEditor: author && author.hasCommentingEnabled && !(post.isReposting || post.isEditing),
      key: `postDetail_${paramsToken}`,
      post,
      streamAction: author && author.hasCommentingEnabled ? loadComments(post, false) : null,
    }
    return <PostDetail {...props} />
  }
}

export default connect(mapStateToProps)(PostDetailContainer)

