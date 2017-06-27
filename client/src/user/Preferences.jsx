/* Preferences.jsx - Will become page for user preferences */
import React from 'react'
import PropTypes from 'prop-types'
import { intlShape, defineMessages } from 'react-intl'

export default class Preferences extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.componentText = defineMessages({
      pageName: { id: 'Preferences.pageName', defaultMessage: 'Preferences Page' }
    })
  }
  render () {
    return (
      <div>
        <p>{this.context.intl.formatMessage(this.componentText.pageName)}</p>
        <p>Preferences for {this.context.reduxState.getIn(['user','username'])}</p>
      </div>
    )
  }
}

Preferences.contextTypes = {
  intl: intlShape,
  reduxState: PropTypes.object
}