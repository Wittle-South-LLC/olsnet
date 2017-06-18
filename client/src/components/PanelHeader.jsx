// SiteMenu.jsx - Implements a site-wide menu
import React from 'react'

export default class Login extends React.Component {
  render () {
    return (
      <div className="panel-heading">
        {this.props.children}
      </div>
    )
  }
}
