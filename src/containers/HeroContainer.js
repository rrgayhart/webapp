import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import get from 'lodash/get'
import sample from 'lodash/sample'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import { DISCOVER, FOLLOWING, STARRED } from '../constants/locales/en'
import { getLinkObject } from '../helpers/json_helper'
import { selectIsLoggedIn } from '../selectors/authentication'
import {
  selectCoverDPI,
  selectLastDiscoverBeaconVersion,
  selectLastFollowingBeaconVersion,
  selectLastStarredBeaconVersion,
} from '../selectors/gui'
import {
  selectAuthPromotionals,
  selectCategoryData,
  selectIsPagePromotion,
  selectPagePromotionals,
} from '../selectors/promotions'
import { selectPathname, selectViewNameFromRoute } from '../selectors/routing'
import { selectUserFromUsername } from '../selectors/user'
import { trackEvent } from '../actions/analytics'
import {
  setLastDiscoverBeaconVersion,
  setLastFollowingBeaconVersion,
  setLastStarredBeaconVersion,
} from '../actions/gui'
import { openModal } from '../actions/modals'
import ShareDialog from '../components/dialogs/ShareDialog'
import {
  HeroBackgroundCycle,
  HeroBroadcast,
  HeroProfile,
  HeroPromotionAuth,
  HeroPromotionCategory,
  HeroPromotionPage,
} from '../components/heros/HeroRenderables'

const selectJson = state => get(state, 'json')
export const selectIsAuthentication = createSelector(
  [selectViewNameFromRoute], viewName => viewName === 'authentication'
)

export const selectIsBackgroundCycle = createSelector(
  [selectViewNameFromRoute], viewName => viewName === 'join'
)

export const selectIsUserProfile = createSelector(
  [selectViewNameFromRoute], viewName => viewName === 'userDetail'
)

export const selectBroadcast = createSelector(
  [selectIsLoggedIn, selectViewNameFromRoute, selectLastDiscoverBeaconVersion, selectLastFollowingBeaconVersion, selectLastStarredBeaconVersion], // eslint-disable-line
  (isLoggedIn, viewName, lastDiscoverBeaconVersion, lastFollowingBeaconVersion, lastStarredBeaconVersion) => { // eslint-disable-line
    if (!isLoggedIn) { return null }
    if (viewName === 'discover') {
      return lastDiscoverBeaconVersion !== DISCOVER.BEACON_VERSION ? DISCOVER.BEACON_TEXT : null
    } else if (viewName === 'following') {
      return lastFollowingBeaconVersion !== FOLLOWING.BEACON_VERSION ? FOLLOWING.BEACON_TEXT : null
    } else if (viewName === 'starred') {
      return lastStarredBeaconVersion !== STARRED.BEACON_VERSION ? STARRED.BEACON_TEXT : null
    }
    return null
  }
)

function mapStateToProps(state, props) {
  const categoryData = selectCategoryData(state)
  const user = selectUserFromUsername(state, props)
  const isAuthentication = selectIsAuthentication(state)
  const isPagePromotion = selectIsPagePromotion(state)
  let promotions
  if (isAuthentication) {
    promotions = selectAuthPromotionals(state)
  } else if (isPagePromotion) {
    promotions = selectPagePromotionals(state)
  } else if (categoryData) {
    promotions = categoryData.promotionals
  }
  return {
    authPromotionals: selectAuthPromotionals(state),
    broadcast: selectBroadcast(state),
    categoryData,
    dpi: selectCoverDPI(state),
    isAuthentication,
    isBackgroundCycle: selectIsBackgroundCycle(state),
    isLoggedIn: selectIsLoggedIn(state),
    isPagePromotion,
    isUserProfile: selectIsUserProfile(state, props),
    json: selectJson(state),
    promotions,
    pathname: selectPathname(state),
    useGif: user && (user.viewsAdultContent || !user.postsAdultContent),
    userCoverImage: user && user.coverImage,
    userId: user && `${user.id}`,
    username: user && user.username,
    viewName: selectViewNameFromRoute(state, props),
  }
}

class HeroContainer extends Component {
  static propTypes = {
    broadcast: PropTypes.string,
    categoryData: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    dpi: PropTypes.string.isRequired,
    isAuthentication: PropTypes.bool,
    isBackgroundCycle: PropTypes.bool,
    isLoggedIn: PropTypes.bool.isRequired,
    isPagePromotion: PropTypes.bool,
    isUserProfile: PropTypes.bool,
    json: PropTypes.object,
    pathname: PropTypes.string.isRequired,
    useGif: PropTypes.bool,
    userCoverImage: PropTypes.object,
    userId: PropTypes.string,
    username: PropTypes.string,
    viewName: PropTypes.string.isRequired,
  }

  static childContextTypes = {
    onClickShareProfile: PropTypes.func,
    onClickTrackCredits: PropTypes.func,
    onClickTrackCTA: PropTypes.func,
  }

  getChildContext() {
    return {
      onClickShareProfile: this.onClickShareProfile,
      onClickTrackCredits: this.onClickTrackCredits,
      onClickTrackCTA: this.onClickTrackCTA,
    }
  }

  componentWillMount() {
    this.state = { promotion: null, broadcast: this.props.broadcast }
  }

  componentWillReceiveProps(nextProps) {
    const { broadcast, isPagePromotion, pathname } = nextProps
    const hasPathChanged = this.props.pathname !== pathname

    if ((hasPathChanged && isPagePromotion) || !this.state.promotion) {
      this.setState({ promotion: sample(nextProps.promotions) })
    } else if (hasPathChanged || !this.state.promotion) {
      this.setState({ promotion: sample(nextProps.promotions) })
    }

    if (broadcast !== this.state.broadcast) {
      this.setState({ broadcast })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  onClickShareProfile = () => {
    const { dispatch, username } = this.props
    const action = bindActionCreators(trackEvent, dispatch)
    dispatch(openModal(<ShareDialog username={username} trackEvent={action} />))
    dispatch(trackEvent('open-share-dialog-profile'))
  }

  onClickTrackCredits = () => {
    const { dispatch, categoryData, isPagePromotion } = this.props
    let label = 'promoByline_clicked_'
    if (categoryData) {
      label += categoryData.category.name
    } else if (isPagePromotion) {
      label += 'general'
    } else {
      label += 'auth'
    }
    dispatch(trackEvent(label))
  }

  onClickTrackCTA = () => {
    const { dispatch, categoryData } = this.props
    let label = 'promoCTA_clicked_'
    label += categoryData ? categoryData.category.name : 'general'
    dispatch(trackEvent(label))
  }

  onDismissBroadcast = () => {
    const { dispatch, viewName } = this.props
    if (viewName === 'discover') {
      dispatch(setLastDiscoverBeaconVersion({ version: DISCOVER.BEACON_VERSION }))
      return
    } else if (viewName === 'following') {
      dispatch(setLastFollowingBeaconVersion({ version: FOLLOWING.BEACON_VERSION }))
      return
    } else if (viewName === 'starred') {
      dispatch(setLastStarredBeaconVersion({ version: STARRED.BEACON_VERSION }))
      return
    }
  }

  getHeroProfile() {
    const { dpi, userCoverImage, useGif, userId } = this.props
    const props = { dpi, sources: userCoverImage, useGif, userId }
    return <HeroProfile key="HeroProfile" {...props} />
  }

  getHeroPromotionAuth() {
    const { dpi } = this.props
    const { promotion } = this.state
    const creditSources = get(promotion, 'avatar', null)
    const creditUsername = get(promotion, 'username', null)
    const sources = get(promotion, 'coverImage', null)
    const props = { creditSources, creditUsername, dpi, sources }
    return <HeroPromotionAuth key="HeroPromotionAuth" {...props} />
  }

  getHeroPromotionCategory() {
    const { categoryData, dpi, isLoggedIn, json } = this.props
    const { category } = categoryData
    const { promotion } = this.state
    const name = get(category, 'name', '')
    const description = get(category, 'description', '')
    const isSponsored = get(category, 'isSponsored', '')
    const ctaCaption = get(category, 'ctaCaption')
    const ctaHref = get(category, 'ctaHref')
    const sources = get(promotion, 'image')
    const user = getLinkObject(promotion, 'user', json)
    const creditSources = get(user, 'avatar', null)
    const creditUsername = get(user, 'username', null)
    const creditLabel = isSponsored ? 'Sponsored by' : 'Posted by'
    const props = {
      creditLabel,
      creditSources,
      creditUsername,
      ctaCaption,
      ctaHref,
      description,
      dpi,
      isLoggedIn,
      name,
      sources,
    }
    return <HeroPromotionCategory key="HeroPromotionCategory" {...props} />
  }

  getHeroPromotionPage() {
    const { dpi, isLoggedIn, json } = this.props
    const { promotion } = this.state
    const header = get(promotion, 'header', '')
    const subheader = get(promotion, 'subheader', '')
    const user = getLinkObject(promotion, 'user', json)
    const creditSources = get(user, 'avatar', null)
    const creditUsername = get(user, 'username', null)
    const ctaCaption = get(promotion, 'ctaCaption')
    const ctaHref = get(promotion, 'ctaHref')
    const sources = get(promotion, 'image', null)
    const props = { creditSources, creditUsername, dpi, header, sources, subheader }
    const ctaProps = { ctaCaption, ctaHref, isLoggedIn }
    return <HeroPromotionPage key="HeroPromotionPage" {...props} {...ctaProps} />
  }

  render() {
    const children = []
    const { broadcast } = this.state
    const { categoryData, isAuthentication, isBackgroundCycle,
      isPagePromotion, isUserProfile, userId } = this.props

    if (broadcast) {
      const props = { broadcast, onDismiss: this.onDismissBroadcast }
      children.push(<HeroBroadcast key="HeroBroadcast" {...props} />)
    }

    // Pick a background
    if (categoryData) {
      children.push(this.getHeroPromotionCategory())
    } else if (isPagePromotion) {
      children.push(this.getHeroPromotionPage())
    } else if (isUserProfile && userId) {
      children.push(this.getHeroProfile())
    } else if (isAuthentication) {
      children.push(this.getHeroPromotionAuth())
    } else if (isBackgroundCycle) {
      children.push(<HeroBackgroundCycle key="HeroBackgroundCycle" />)
    }
    return (
      <div className="Hero">
        {children}
      </div>
    )
  }
}

export default connect(mapStateToProps)(HeroContainer)

