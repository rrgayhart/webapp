import React, { Component, PropTypes } from 'react'
import FormControl from './FormControl'
import { TabListButtons } from '../tabs/TabList'

class SearchControl extends Component {

  static propTypes = {
    activeType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    text: PropTypes.string,
    tabs: PropTypes.array.isRequired,
  }

  static defaultProps = {
    className: 'SearchControl',
    id: 'terms',
    label: 'Search',
    name: 'search[terms]',
    placeholder: 'Search',
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.text.input.focus()
    })
  }

  shouldComponentUpdate(nextProps) {
    return this.props.text !== nextProps.text || this.props.activeType !== nextProps.activeType
  }

  render() {
    const { activeType, onChange, onSubmit, tabs } = this.props
    return (
      <form className="SearchBar" onSubmit={onSubmit}>
        <FormControl
          {...this.props}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          key={activeType}
          ref={(comp) => { this.text = comp }}
          type="text"
        />
        <TabListButtons
          activeType={activeType}
          className="SearchTabList"
          onTabClick={onChange}
          tabClasses="LabelTab SearchLabelTab"
          tabs={tabs}
        />
      </form>
    )
  }
}

export default SearchControl

