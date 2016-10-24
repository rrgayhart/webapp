import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Avatar from '../assets/Avatar'
import { ShareIcon } from '../assets/Icons'
import { AppleStore, GooglePlayStore } from '../assets/Sprites'
import { SVGIcon } from '../svg/SVGComponents'

// -------------------------------------

export const HeroAppStores = () =>
  <div className="HeroAppStores">
    <AppleStore />
    <GooglePlayStore />
  </div>

// -------------------------------------

export const HeroPromotionCredits = ({ sources, username }, { onClickTrackCredits }) =>
  <Link className="HeroPromotionCredits" onClick={onClickTrackCredits} to={`/${username}`}>
    <span className="HeroPromotionCreditsBy">Posted by</span>
    <span className="HeroPromotionCreditsAuthor">@{username}</span>
    <Avatar className="inHeroPromotionCredits" sources={sources} username={username} />
  </Link>

HeroPromotionCredits.contextTypes = {
  onClickTrackCredits: PropTypes.func.isRequired,
}

HeroPromotionCredits.propTypes = {
  sources: PropTypes.object,
  username: PropTypes.string,
}

// -------------------------------------

export const HeroPromotionCTA = ({ caption, isLoggedIn, to }) => {
  if (caption && to) {
    return <a className="HeroPromotionCTA" href={to}>{caption}</a>
  } else if (!isLoggedIn) {
    return <Link className="HeroPromotionCTA" to="https://ello.co/signup">Sign Up</Link>
  }
  return null
}

HeroPromotionCTA.propTypes = {
  caption: PropTypes.string,
  isLoggedIn: PropTypes.bool,
  to: PropTypes.string,
}

// -------------------------------------

export const HeroScrollToContentButton = (props, { onClickScrollToContent }) =>
  <button className="HeroScrollToContentButton" onClick={onClickScrollToContent}>
    <SVGIcon className="ScrollToContentIcon">
      <g>
        <polyline points="13.5,8 10,12 6.5,8" />
        <circle cx="10" cy="10" r="7" />
      </g>
    </SVGIcon>
  </button>

HeroScrollToContentButton.contextTypes = {
  onClickScrollToContent: PropTypes.func.isRequired,
}

// -------------------------------------

export const HeroShareUserButton = (props, { onClickShareProfile }) =>
  <button className="HeroShareUserButton" onClick={onClickShareProfile} >
    <ShareIcon />
  </button>

HeroShareUserButton.contextTypes = {
  onClickShareProfile: PropTypes.func.isRequired,
}

