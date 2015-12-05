import React from 'react'
import classNames from 'classnames'
import { loadAwesomePeople } from '../../actions/onboarding'
import StreamComponent from '../streams/StreamComponent'
import Picker from '../pickers/Picker'

class PeoplePicker extends Picker {
  render() {
    return (
      <div className={classNames('PeoplePicker', 'Panel', { isFollowingAll: this.isFollowingAll() })}>
        <button className="PickerButton" ref="followAllButton" onClick={() => this.followAll()}>
          <span>{this.renderBigButtonText()}</span>
        </button>
        <StreamComponent ref="streamComponent" action={loadAwesomePeople()} />
      </div>
    )
  }
}

export default PeoplePicker

