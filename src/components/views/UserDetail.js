import React, { PropTypes } from 'react'
import StreamContainer from '../../containers/StreamContainer'
import { MainView } from '../views/MainView'
import { TabListButtons } from '../tabs/TabList'
import { ZeroStateCreateRelationship, ZeroStateFirstPost, ZeroStateSayHello } from '../zeros/Zeros'

const ZeroStates = ({
  isLoggedIn, isSelf, hasSaidHelloTo, hasZeroFollowers, hasZeroPosts, onSubmitHello, user,
  }) =>
    <div className="ZeroStates">
      {isSelf && hasZeroPosts ? <ZeroStateFirstPost /> : null}
      {!isSelf && hasZeroFollowers ? <ZeroStateCreateRelationship user={user} /> : null}
      {isLoggedIn && !isSelf && hasZeroPosts ?
        <ZeroStateSayHello
          onSubmit={() => onSubmitHello({ username: user.username })}
          hasPosted={hasSaidHelloTo}
          user={user}
        /> : null
      }
    </div>

ZeroStates.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isSelf: PropTypes.bool.isRequired,
  hasSaidHelloTo: PropTypes.bool.isRequired,
  hasZeroFollowers: PropTypes.bool.isRequired,
  hasZeroPosts: PropTypes.bool.isRequired,
  onSubmitHello: PropTypes.func,
  user: PropTypes.object.isRequired,
}


export const UserDetail = (props) => {
  // deconstruct props
  const { isLoggedIn, isPostHeaderHidden, isSelf } = props
  const { hasSaidHelloTo, hasZeroFollowers, hasZeroPosts } = props
  const { activeType, onSubmitHello, onTabClick, streamAction, tabs, user } = props

  // construct component props
  const tabProps = { activeType, className: 'LabelTabList', tabClasses: 'LabelTab', tabs }
  const streamProps = { action: streamAction, isPostHeaderHidden }
  const zeroProps = {
    isLoggedIn, isSelf, hasSaidHelloTo, hasZeroFollowers, hasZeroPosts, onSubmitHello, user,
  }
  return (
    <MainView className="UserDetail">
      <div className="UserDetails">
        {tabs ? <TabListButtons {...tabProps} onTabClick={({ type }) => onTabClick(type)} /> : null}
        {hasZeroPosts || hasZeroFollowers ? <ZeroStates {...zeroProps} /> : null}
        {streamAction ? <StreamContainer {...streamProps} /> : null}
      </div>
    </MainView>
  )
}

UserDetail.propTypes = {
  activeType: PropTypes.string,
  isLoggedIn: PropTypes.bool.isRequired,
  isPostHeaderHidden: PropTypes.bool,
  isSelf: PropTypes.bool.isRequired,
  hasSaidHelloTo: PropTypes.bool.isRequired,
  hasZeroFollowers: PropTypes.bool.isRequired,
  hasZeroPosts: PropTypes.bool.isRequired,
  onSubmitHello: PropTypes.func,
  onTabClick: PropTypes.func,
  streamAction: PropTypes.object,
  tabs: PropTypes.array,
  user: PropTypes.object.isRequired,
}


export const UserDetailError = ({ children }) =>
  <MainView className="UserDetail">
    <section className="StreamContainer isError">
      {children}
    </section>
  </MainView>

UserDetailError.propTypes = {
  children: PropTypes.node.isRequired,
}

