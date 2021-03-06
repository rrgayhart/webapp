import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import classNames from 'classnames'
import ToggleControl from '../forms/ToggleControl'

const Preference = ({ className, definition, id, isChecked, isDisabled, onToggleChange }) =>
  <form className={classNames(className, 'Preference')}>
    <dl>
      <dt>{definition.term ? definition.term : ''}</dt>
      <dd dangerouslySetInnerHTML={{ __html: definition.desc ? definition.desc : '' }} />
    </dl>
    <ToggleControl
      id={id}
      isChecked={isChecked}
      isDisabled={isDisabled}
      onChange={onToggleChange}
    />
  </form>

Preference.propTypes = {
  className: PropTypes.string,
  definition: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onToggleChange: PropTypes.func,
}

function mapStateToProps(state, ownProps) {
  return {
    isChecked: state.profile[camelize(ownProps.id)],
    isDisabled: !state.profile.isPublic && ownProps.id === 'has_sharing_enabled',
  }
}

export default connect(mapStateToProps)(Preference)

