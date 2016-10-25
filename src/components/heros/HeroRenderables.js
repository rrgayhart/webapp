import React, { PropTypes } from 'react'
import BackgroundImage from '../assets/BackgroundImage'
import {
  HeroAppStores,
  HeroPromotionCredits,
  HeroPromotionCTA,
  HeroScrollToContentButton,
  HeroShareUserButton,
} from './HeroParts'
import { ZeroStream } from '../zeros/Zeros'
import UserContainer from '../../containers/UserContainer'

// -------------------------------------

export const HeroBackgroundCycle = () =>
  <div className="HeroBackgroundCycle fullscreen" />

// -------------------------------------

export const HeroBroadcast = ({ broadcast, onDismiss }) =>
  <ZeroStream onDismiss={onDismiss}>{broadcast}</ZeroStream>

HeroBroadcast.propTypes = {
  broadcast: PropTypes.string.isRequired,
  onDismiss: PropTypes.func,
}

// -------------------------------------

export const HeroProfile = ({ dpi, sources, userId, useGif }) =>
  <div className="HeroProfile">
    <BackgroundImage
      className="inHeroProfile hasOverlay6"
      dpi={dpi}
      sources={sources}
      useGif={useGif}
    />
    <UserContainer userId={userId} type="profile" />
    <HeroShareUserButton />
    <HeroScrollToContentButton />
  </div>

HeroProfile.propTypes = {
  dpi: PropTypes.string.isRequired,
  sources: PropTypes.object,
  userId: PropTypes.string,
  useGif: PropTypes.bool,
}

// -------------------------------------

export const HeroPromotionAuth = (props) => {
  const { creditSources, creditUsername, dpi, sources } = props
  return (
    <div className="HeroPromotionAuth fullscreen">
      <BackgroundImage className="hasOverlay3" dpi={dpi} sources={sources} />
      <HeroPromotionCredits sources={creditSources} username={creditUsername} />
      <HeroAppStores />
    </div>
  )
}

HeroPromotionAuth.propTypes = {
  creditSources: PropTypes.object,
  creditUsername: PropTypes.string,
  dpi: PropTypes.string.isRequired,
  sources: PropTypes.object,
}

// -------------------------------------

export const HeroPromotionCategory = (props) => {
  const { creditLabel, creditSources, creditUsername, description, dpi, name, sources } = props
  const { ctaCaption, ctaHref, isLoggedIn } = props
  return (
    <div className="HeroPromotion HeroPromotionCategory">
      <BackgroundImage className="hasOverlay3" dpi={dpi} sources={sources} />
      <div className="HeroPromotionCaption isCentered">
        <h1 className="HeroPromotionCategoryHeading"><span>{name}</span></h1>
        <p className="HeroPromotionCategoryCopy">{description}</p>
        <HeroPromotionCTA caption={ctaCaption} isLoggedIn={isLoggedIn} to={ctaHref} />
      </div>
      <HeroPromotionCredits label={creditLabel} sources={creditSources} username={creditUsername} />
    </div>
  )
}

HeroPromotionCategory.propTypes = {
  creditLabel: PropTypes.string,
  creditSources: PropTypes.object,
  creditUsername: PropTypes.string,
  ctaCaption: PropTypes.string,
  ctaHref: PropTypes.string,
  description: PropTypes.string.isRequired,
  dpi: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  sources: PropTypes.object,
}

// -------------------------------------

export const HeroPromotionSampled = (props) => {
  const { caption, creditSources, creditUsername, dpi, sources } = props
  const { ctaCaption, ctaHref, isLoggedIn } = props
  return (
    <div className="HeroPromotion HeroPromotionSampled">
      <BackgroundImage className="hasOverlay3" dpi={dpi} sources={sources} />
      <div className="HeroPromotionCaption">
        <h1 className="HeroPromotionHeading">{caption}</h1>
        <HeroPromotionCTA caption={ctaCaption} isLoggedIn={isLoggedIn} to={ctaHref} />
      </div>
      <HeroPromotionCredits sources={creditSources} username={creditUsername} />
    </div>
  )
}

HeroPromotionSampled.propTypes = {
  caption: PropTypes.string,
  creditSources: PropTypes.object,
  creditUsername: PropTypes.string,
  ctaCaption: PropTypes.string,
  ctaHref: PropTypes.string,
  dpi: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  sources: PropTypes.object,
}

