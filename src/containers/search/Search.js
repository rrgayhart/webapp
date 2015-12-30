import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { replaceState } from 'redux-router'
import debounce from 'lodash.debounce'
import * as ACTION_TYPES from '../../constants/action_types'
import * as SearchActions from '../../actions/search'
import { updateQueryParams } from '../../components/base/uri_helper'
import SearchControl from '../../components/forms/SearchControl'
import StreamComponent from '../../components/streams/StreamComponent'
import SearchTabs from '../../components/tabs/SearchTabs'

class Search extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      query: PropTypes.shape({
        terms: PropTypes.string,
        type: PropTypes.string,
      }).isRequired,
    }).isRequired,
    search: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context)
    this.state = this.props.search
    const terms = props.location.query.terms
    const type = props.location.query.type
    if (terms) {
      this.state.terms = terms
    }
    if (type && (type === 'users' || type === 'posts')) {
      this.state.type = type
    } else {
      this.state.type = 'posts'
    }
    this.updateLocation({ ...this.state })
  }

  componentWillMount() {
    this.search = debounce(this.search, 300)
    this.updateLocation = debounce(this.updateLocation, 300)
  }

  getAction() {
    const { terms, type } = this.state
    if (terms && terms.length > 1) {
      if (type === 'users') {
        return SearchActions.searchForUsers(terms)
      }
      return SearchActions.searchForPosts(terms)
    }
    return null
  }

  search() {
    const { dispatch } = this.props
    dispatch({
      type: ACTION_TYPES.SEARCH.SAVE,
      payload: this.state,
    })
    const action = this.getAction()
    if (action) {
      this.refs.streamComponent.refs.wrappedInstance.setAction(action)
    }
  }

  updateLocation(vo) {
    const { dispatch } = this.props
    if (typeof vo.terms === 'string' && vo.terms.length < 2) {
      vo.terms = null
    }
    if (typeof vo.type === 'string' && vo.type === 'posts') {
      vo.type = null
    }
    const uri = document.location.pathname + updateQueryParams(vo)
    dispatch(replaceState(window.history.state, uri))
  }

  handleControlChange(vo) {
    this.setState(vo)
    this.search()
    this.updateLocation(vo)
  }

  render() {
    const { terms, type } = this.state
    const tabs = [
      { type: 'posts', children: 'Posts' },
      { type: 'users', children: 'People' },
    ]
    return (
      <section className="Search Panel">
        <div className="SearchBar">
          <SearchControl
            controlWasChanged={ ::this.handleControlChange }
            text={ terms }
          />
          <SearchTabs
            onTabClick={ ::this.handleControlChange }
            tabs={ tabs }
            type={ type }
          />
        </div>
        <StreamComponent action={ this.getAction() } ref="streamComponent" />
      </section>
    )
  }
}

function mapStateToProps(state) {
  return {
    search: state.search,
  }
}

export default connect(mapStateToProps)(Search)

