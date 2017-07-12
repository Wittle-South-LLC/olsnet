/* Preferences.jsx - Will become page for user preferences */
import React from 'react'
import PropTypes from 'prop-types'
import { intlShape, defineMessages } from 'react-intl'
import { getCurrentUser } from '../state/user/user'
import UserEdit from './UserEdit'

export default class Preferences extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.componentText = defineMessages({
      pageName: { id: 'Preferences.pageName', defaultMessage: 'Preferences Page' }
    })
  }
  render () {
    let user = getCurrentUser(this.context.reduxState)
    return (
      <div>
        { user.getUserId() && <UserEdit user={user} /> }
        <p>{this.context.intl.formatMessage(this.componentText.pageName)}</p>
        <p>Preferences page for {user.getUserName()}</p>
      </div>
    )
  }
}

Preferences.contextTypes = {
  intl: intlShape,
  reduxState: PropTypes.object
}
