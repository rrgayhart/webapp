import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import get from 'lodash/get'
import sample from 'lodash/sample'
import shallowCompare from 'react-addons-shallow-compare'
import { connect } from 'react-redux'
import { DISCOVER, FOLLOWING, STARRED } from '../constants/locales/en'
import { selectIsLoggedIn } from '../selectors/authentication'
import {
  selectCoverDPI,
  selectLastDiscoverBeaconVersion,
  selectLastFollowingBeaconVersion,
  selectLastStarredBeaconVersion,
} from '../selectors/gui'
import { selectCurrentPromotions } from '../selectors/promotions'
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
  HeroPromotionSampled,
} from '../components/heros/HeroRenderables'

export const selectIsAuthentication = createSelector(
  [selectViewNameFromRoute], viewName => viewName === 'authentication'
)

export const selectIsBackgroundCycle = createSelector(
  [selectViewNameFromRoute], viewName => viewName === 'join'
)

export const selectIsSampledPromotion = createSelector(
  [selectViewNameFromRoute, selectPathname], (viewName, pathname) =>
    (viewName === 'search') ||
    (viewName === 'discover' && pathname === '/') ||
    (viewName === 'discover' && pathname === '/discover') ||
    (viewName === 'discover' && pathname === '/discover/all') ||
    (viewName === 'discover' && /\/featured\b|\/trending\b|\/recent\b/.test(pathname))
)

export const selectIsCategoryPromotion = createSelector(
  [selectViewNameFromRoute, selectIsSampledPromotion], (viewName, isSampledPromotion) =>
    (viewName === 'discover' && !isSampledPromotion)
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
  const user = selectUserFromUsername(state, props)
  return {
    broadcast: selectBroadcast(state),
    dpi: selectCoverDPI(state),
    isAuthentication: selectIsAuthentication(state),
    isCategoryPromotion: selectIsCategoryPromotion(state),
    isBackgroundCycle: selectIsBackgroundCycle(state),
    isLoggedIn: selectIsLoggedIn(state),
    isSampledPromotion: selectIsSampledPromotion(state),
    isUserProfile: selectIsUserProfile(state, props),
    pathname: selectPathname(state),
    promotions: selectCurrentPromotions(state),
    useGif: user && (user.viewsAdultContent || !user.postsAdultContent),
    userCoverImage: user && user.coverImage,
    userId: user && user.id,
    username: user && user.username,
    viewName: selectViewNameFromRoute(state, props),
  }
}

class HeroContainer extends Component {
  static propTypes = {
    broadcast: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    dpi: PropTypes.string.isRequired,
    isAuthentication: PropTypes.bool,
    isCategoryPromotion: PropTypes.bool,
    isBackgroundCycle: PropTypes.bool,
    isLoggedIn: PropTypes.bool.isRequired,
    isSampledPromotion: PropTypes.bool,
    isUserProfile: PropTypes.bool,
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
  }

  getChildContext() {
    return {
      onClickShareProfile: this.onClickShareProfile,
      onClickTrackCredits: this.onClickTrackCredits,
    }
  }

  componentWillMount() {
    this.state = { promotion: null, broadcast: this.props.broadcast }
  }

  componentWillReceiveProps(nextProps) {
    const { broadcast, isCategoryPromotion, isSampledPromotion, pathname } = nextProps
    const hasPathChanged = this.props.pathname !== pathname

    if ((hasPathChanged && isSampledPromotion) || !this.state.promotion) {
      this.setState({ promotion: sample(nextProps.promotions) })
    } else if ((hasPathChanged && isCategoryPromotion) || !this.state.promotion) {
      // TODO epic/promos-2.0 Should be handed the promotion from the category API
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
    const { dispatch, isCategoryPromotion, isSampledPromotion } = this.props
    // TODO epic/promos-2.0 This is going to change, waiting for feedback in the google doc
    const label = `${isSampledPromotion || isCategoryPromotion ? 'banderole' : 'authentication'}-credits-clicked`
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

  // TODO epic/promos-2.0 Grab the real props
  getHeroPromotionCategory() {
    const { dpi, isLoggedIn } = this.props
    const { promotion } = this.state
    const heading = 'Architecture' || get(promotion, 'heading', '') // TODO epic/promos-2.0 get from API
    const subheading = 'Subheading' || get(promotion, 'subheading', '') // TODO epic/promos-2.0 get from API
    const txt = 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. ' // eslint-disable-line
    const copy = txt + txt || get(promotion, 'description', '') // TODO epic/promos-2.0 get from API
    const creditSources = get(promotion, 'avatar', null)
    const creditUsername = get(promotion, 'username', null)
    const ctaCaption = get(promotion, 'cta.caption')
    const ctaHref = get(promotion, 'cta.href')
    const sources = get(promotion, 'coverImage', null)
    const props = { copy, creditSources, creditUsername, dpi, heading, sources, subheading }
    const ctaProps = { ctaCaption, ctaHref, isLoggedIn }
    return <HeroPromotionCategory key="HeroPromotionCategory" {...props} {...ctaProps} />
  }

  getHeroPromotionSampled() {
    const { dpi, isLoggedIn } = this.props
    const { promotion } = this.state
    const caption = get(promotion, 'caption', '')
    const creditSources = get(promotion, 'avatar', null)
    const creditUsername = get(promotion, 'username', null)
    const ctaCaption = get(promotion, 'cta.caption')
    const ctaHref = get(promotion, 'cta.href')
    const sources = get(promotion, 'coverImage', null)
    const props = { caption, creditSources, creditUsername, dpi, sources }
    const ctaProps = { ctaCaption, ctaHref, isLoggedIn }
    return <HeroPromotionSampled key="HeroPromotionSampled" {...props} {...ctaProps} />
  }

  render() {
    const children = []
    const { broadcast } = this.state
    const { isAuthentication, isBackgroundCycle } = this.props
    const { isCategoryPromotion, isSampledPromotion, isUserProfile, userId } = this.props

    if (broadcast) {
      const props = { broadcast, onDismiss: this.onDismissBroadcast }
      children.push(<HeroBroadcast key="HeroBroadcast" {...props} />)
    }

    // Pick a background
    if (isCategoryPromotion) {
      children.push(this.getHeroPromotionCategory())
    } else if (isSampledPromotion) {
      children.push(this.getHeroPromotionSampled())
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

