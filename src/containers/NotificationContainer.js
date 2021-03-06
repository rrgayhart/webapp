import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import shallowCompare from 'react-addons-shallow-compare'
import { getLinkObject } from '../helpers/json_helper'
import * as MAPPING_TYPES from '../constants/mapping_types'
import {
  CommentNotification,
  CommentMentionNotification,
  CommentOnOriginalPostNotification,
  CommentOnRepostNotification,
  InvitationAcceptedNotification,
  LoveNotification,
  LoveOnOriginalPostNotification,
  LoveOnRepostNotification,
  NewFollowerPost,
  NewFollowedUserPost,
  PostMentionNotification,
  RepostNotification,
  WatchNotification,
  WatchCommentNotification,
  WatchOnOriginalPostNotification,
  WatchOnRepostNotification,
} from '../components/notifications/NotificationRenderables'

const NOTIFICATION_KIND = {
  COMMENT: 'comment_notification',
  COMMENT_MENTION: 'comment_mention_notification',
  COMMENT_ORIGINAL: 'comment_on_original_post_notification',
  COMMENT_REPOST: 'comment_on_repost_notification',
  INVITATION_ACCEPTED: 'invitation_accepted_post',
  LOVE: 'love_notification',
  LOVE_ORIGINAL: 'love_on_original_post_notification',
  LOVE_REPOST: 'love_on_repost_notification',
  NEW_FOLLOWED_USER: 'new_followed_user_post',
  NEW_FOLLOWER: 'new_follower_post',
  POST_MENTION: 'post_mention_notification',
  REPOST: 'repost_notification',
  WATCH: 'watch_notification',
  WATCH_COMMENT: 'watch_comment_notification',
  WATCH_ORIGINAL: 'watch_on_original_post_notification',
  WATCH_REPOST: 'watch_on_repost_notification',
  WELCOME: 'welcome_notification',
}

const SUBJECT_TYPE = {
  LOVE: 'love',
  POST: 'post',
  USER: 'user',
  WATCH: 'watch',
}

function mapStateToProps(state, ownProps) {
  const { notification } = ownProps
  const subject = getLinkObject(notification, 'subject', state.json)

  // postActions are used for loves/watches
  let postActionPost = null
  let postActionAuthor = null
  let postActionUser = null

  let postAuthor = null
  let repost = null
  let repostAuthor = null
  let repostedSource = null
  let repostedSourceAuthor = null
  let parentPost = null
  let parentPostAuthor = null

  // subject is a post or comment
  if (notification.subjectType.toLowerCase() === SUBJECT_TYPE.POST) {
    postAuthor = getLinkObject(subject, 'author', state.json) ||
      state.json[MAPPING_TYPES.USERS][subject.authorId]
    // comment
    if (subject.postId) {
      parentPost = getLinkObject(subject, 'parentPost', state.json)
      parentPostAuthor = getLinkObject(parentPost, 'author', state.json) ||
        state.json[MAPPING_TYPES.USERS][parentPost.authorId]
    }
    // repost
    if (parentPost && parentPost.repostId) {
      repost = parentPost
      repostAuthor = getLinkObject(repost, 'author', state.json) ||
        state.json[MAPPING_TYPES.USERS][repost.authorId]
      repostedSource = getLinkObject(repost, 'repostedSource', state.json)
      repostedSourceAuthor = getLinkObject(repostedSource, 'author', state.json) ||
        state.json[MAPPING_TYPES.USERS][repostedSource.authorId]
    }
  }
  // subject is a love or a watch
  if (notification.subjectType.toLowerCase() === SUBJECT_TYPE.LOVE ||
      notification.subjectType.toLowerCase() === SUBJECT_TYPE.WATCH) {
    postActionUser = getLinkObject(subject, 'user', state.json)
    postActionPost = getLinkObject(subject, 'post', state.json)
    postActionAuthor = getLinkObject(postActionPost, 'author', state.json) ||
      state.json[MAPPING_TYPES.USERS][postActionPost.authorId]
    // repost
    if (postActionPost.repostId) {
      repost = postActionPost
      repostAuthor = getLinkObject(repost, 'author', state.json)
      repostedSource = getLinkObject(repost, 'repostedSource', state.json)
      repostedSourceAuthor = getLinkObject(repostedSource, 'author', state.json) ||
        state.json[MAPPING_TYPES.USERS][repostedSource.authorId]
    }
  }
  // subject can be a user as well but we don't
  // need to add any additional properties

  return {
    assets: state.json.assets,
    createdAt: notification.createdAt,
    kind: notification.kind,
    parentPost,
    parentPostAuthor,
    postActionAuthor,
    postActionPost,
    postActionUser,
    postAuthor,
    repost,
    repostAuthor,
    repostedSource,
    repostedSourceAuthor,
    subject,
  }
}

class NotificationParser extends Component {
  static propTypes = {
    assets: PropTypes.object,
    createdAt: PropTypes.string.isRequired,
    kind: PropTypes.string,
    parentPost: PropTypes.object,
    parentPostAuthor: PropTypes.object,
    postActionAuthor: PropTypes.object,
    postActionPost: PropTypes.object,
    postActionUser: PropTypes.object,
    postAuthor: PropTypes.object,
    repost: PropTypes.object,
    repostAuthor: PropTypes.object,
    repostedSource: PropTypes.object,
    repostedSourceAuthor: PropTypes.object,
    subject: PropTypes.object.isRequired,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const {
      assets,
      createdAt,
      kind,
      parentPost,
      parentPostAuthor,
      postActionAuthor,
      postActionPost,
      postActionUser,
      postAuthor,
      repost,
      repostAuthor,
      repostedSource,
      repostedSourceAuthor,
      subject,
    } = this.props

    switch (kind) {
      case NOTIFICATION_KIND.COMMENT:
        return (
          <CommentNotification
            assets={assets}
            author={postAuthor}
            comment={subject}
            createdAt={createdAt}
            parentPost={parentPost}
            parentPostAuthor={parentPostAuthor}
          />
        )
      case NOTIFICATION_KIND.COMMENT_MENTION:
        return (
          <CommentMentionNotification
            assets={assets}
            author={postAuthor}
            comment={subject}
            createdAt={createdAt}
            parentPost={parentPost}
            parentPostAuthor={parentPostAuthor}
          />
        )
      case NOTIFICATION_KIND.COMMENT_ORIGINAL:
        return (
          <CommentOnOriginalPostNotification
            assets={assets}
            author={postAuthor}
            comment={subject}
            createdAt={createdAt}
            repost={repost}
            repostAuthor={repostAuthor}
            repostedSource={repostedSource}
            repostedSourceAuthor={repostedSourceAuthor}
          />
        )
      case NOTIFICATION_KIND.COMMENT_REPOST:
        return (
          <CommentOnRepostNotification
            assets={assets}
            author={postAuthor}
            comment={subject}
            createdAt={createdAt}
            repost={repost}
            repostAuthor={repostAuthor}
          />
        )
      case NOTIFICATION_KIND.INVITATION_ACCEPTED:
        return <InvitationAcceptedNotification createdAt={createdAt} user={subject} />
      case NOTIFICATION_KIND.LOVE:
        return (
          <LoveNotification
            assets={assets}
            author={postActionAuthor}
            createdAt={createdAt}
            post={postActionPost}
            user={postActionUser}
          />
        )
      case NOTIFICATION_KIND.LOVE_ORIGINAL:
        return (
          <LoveOnOriginalPostNotification
            assets={assets}
            createdAt={createdAt}
            repost={repost}
            repostAuthor={repostAuthor}
            repostedSource={repostedSource}
            repostedSourceAuthor={repostedSourceAuthor}
            user={postActionUser}
          />
        )
      case NOTIFICATION_KIND.LOVE_REPOST:
        return (
          <LoveOnRepostNotification
            assets={assets}
            createdAt={createdAt}
            repost={repost}
            repostAuthor={repostAuthor}
            user={postActionUser}
          />
        )
      case NOTIFICATION_KIND.NEW_FOLLOWER:
        return <NewFollowerPost createdAt={createdAt} user={subject} />
      case NOTIFICATION_KIND.NEW_FOLLOWED_USER:
        return <NewFollowedUserPost createdAt={createdAt} user={subject} />
      case NOTIFICATION_KIND.POST_MENTION:
        return (
          <PostMentionNotification
            assets={assets}
            author={postAuthor}
            createdAt={createdAt}
            post={subject}
          />
        )
      case NOTIFICATION_KIND.REPOST:
        return (
          <RepostNotification
            assets={assets}
            author={postAuthor}
            createdAt={createdAt}
            post={subject}
          />
        )
      case NOTIFICATION_KIND.WATCH:
        return (
          <WatchNotification
            assets={assets}
            author={postActionAuthor}
            createdAt={createdAt}
            post={postActionPost}
            user={postActionUser}
          />
        )
      case NOTIFICATION_KIND.WATCH_COMMENT:
        return (
          <WatchCommentNotification
            assets={assets}
            author={postAuthor}
            comment={subject}
            createdAt={createdAt}
            parentPost={parentPost}
            parentPostAuthor={parentPostAuthor}
          />
        )
      case NOTIFICATION_KIND.WATCH_ORIGINAL:
        return (
          <WatchOnOriginalPostNotification
            assets={assets}
            createdAt={createdAt}
            repost={repost}
            repostAuthor={repostAuthor}
            repostedSource={repostedSource}
            repostedSourceAuthor={repostedSourceAuthor}
            user={postActionUser}
          />
        )
      case NOTIFICATION_KIND.WATCH_REPOST:
        return (
          <WatchOnRepostNotification
            assets={assets}
            createdAt={createdAt}
            repost={repost}
            repostAuthor={repostAuthor}
            user={postActionUser}
          />
        )
      case NOTIFICATION_KIND.WELCOME:
        return <p>Welcome to Ello!</p>
      default:
        return null
    }
  }
}

export default connect(mapStateToProps)(NotificationParser)

