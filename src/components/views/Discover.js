import React, { PropTypes } from 'react'
import StreamContainer from '../../containers/StreamContainer'
import { MainView } from '../views/MainView'

export const Discover = ({
  pageTitle,
  streamAction,
  }) =>
    <MainView className="Discover">
      {pageTitle ? <h1 className="DiscoverPageTitle">{pageTitle}</h1> : null}
      <StreamContainer action={streamAction} />
    </MainView>

Discover.propTypes = {
  pageTitle: PropTypes.string,
  streamAction: PropTypes.object.isRequired,
}

export default Discover

