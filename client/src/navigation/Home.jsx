/* Home.jsx - home page for users who are not authenticated */
import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route } from 'react-router-dom'
import { intlShape, defineMessages } from 'react-intl'
import Login from '../user/Login'
// import Register from '../user/Register'
import UserEdit from '../user/UserEdit'

export default class Home extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.componentText = defineMessages({
      pageName: { id: 'Home.pageName', defaultMessage: 'Hello World!' }
    })
  }
  render () {
    return (
      <div>
        <Switch>
          <Route path={'/home/login'} component={Login} />
          <Route path={'/home/register'} render={() => (
            <UserEdit user={this.context.reduxState.getIn(['user', 'current'])} />)} />
        </Switch>
        <p>{this.context.intl.formatMessage(this.componentText.pageName)}</p>
      </div>
    )
  }
}

Home.contextTypes = {
  intl: intlShape,
  reduxState: PropTypes.object,
  router: PropTypes.object
}
