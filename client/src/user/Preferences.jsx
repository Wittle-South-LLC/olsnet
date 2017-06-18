/* Preferences.jsx - Will become page for user preferences */
import React from 'react'
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
      </div>
    )
  }
}

User.contextTypes = {
  intl: intlShape
}
