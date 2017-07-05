/* Container.jsx - The application container for the top level route

  This module is responsible for:
  - Redux change handling by listening for Redux store change events,
    and propating them through the rest of the React application. I 
    dislike HOC, so this is an alternative to React-Redux's HOC approach. 
  - Defines the navigation structure for the overall app
  - Defines dynamic chunk loading, which should correspond closely to the
    navigation 
*/

import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Grid, Row } from 'react-bootstrap'
import SiteMenu from './navigation/SiteMenu'
import { setMessage } from './state/fetchStatus/fetchStatusActions'
import { intlShape, defineMessages } from 'react-intl'
import { getUserName, getUserId } from './state/user/user'

/* The following code enables bundle separation and dynamic
   loading. It is baesd on this:
   https://gist.github.com/acdlite/a68433004f9d6b4cbc83b5cc3990c194
   The 'System.import' is a Webpack 2 signal for code split,
   and the rest is React / Promise magic */
import asyncComponent from './utils/asyncComponent'
const Home = asyncComponent(() =>
  System.import('./navigation/Home').then(module => module.default)
)
const Preferences = asyncComponent(() =>
  System.import('./user/Preferences').then(module => module.default)
)

/* Container will receive the Redux store via props, and will set
 * its state to the current store. The container also puts the
 * redux state in context, along with the dispatch method. Finally,
 * it subscribes to store updates, and resets its state based on
 * those updates. The state reset should trigger an update throughout
 * the route tree, and the current state and dispatch method can be
 * pulled from the context by any component that is a child of the
 * container (which should be all of them if the routes are built
 * correctly) */
export default class Container extends React.Component {
  constructor (props, context) {
    super(props, context)

    // Method passed to store.subscribe, is called for each state change
    this.listenStore = this.listenStore.bind(this)
    this.init = this.init.bind(this)

    // Will be set when subscribe is called
    this.unsubscribe = undefined

    // Define the localized messages owned by this component
    this.componentText = defineMessages({
      navHomeLink: { id: 'container.home_link', defaultMessage: 'Home' },
      navUserLink: { id: 'container.user_link', defaultMessage: 'Preferences' },
      enLocaleDesc: { id: 'container.en_locale_description', defaultMessage: 'English' },
      frLocaleDesc: { id: 'container.fr_locale_description', defaultMessage: 'French' },
      containerGreetingStatus: {
        id: 'container.greeting_status',
        defaultMessage: 'Simple and effective structure for applications'
      },
      containerTitle: {
        id: 'container.title',
        defaultMessage: 'Application Structure Playground'
      }
    })
    // Set the initial status message for newly activated application
    this.props.store.dispatch(setMessage(this.componentText.containerGreetingStatus))

    // Initialize the state to the current store state
    this.state = {
      reduxState: props.store.getState()
    }
    this.currentLocale = props.getCurrentLocale()
    this.init()
  }
  // Put the Redux state and dispatch method into context
  getChildContext () {
    return {
      reduxState: this.props.store.getState(),
      dispatch: this.props.store.dispatch
    }
  }
  init () {
    // Define the locales we will support; needs to be done in render because locale can change
    this.availableLocales = [
      {localeCode: 'en', localeDesc: this.context.intl.formatMessage(this.componentText.enLocaleDesc)},
      {localeCode: 'fr', localeDesc: this.context.intl.formatMessage(this.componentText.frLocaleDesc)}
    ]

    // Define the site-level navigation options that correspond to the routes shown above; needs to be done
    // in render because locales can change
    this.navOptions = [
      { path: '/home', class: 'home', label: this.context.intl.formatMessage(this.componentText.navHomeLink) },
      { path: '/user', class: 'user', label: this.context.intl.formatMessage(this.componentText.navUserLink) }
    ]
  }
  // After Container mounts initially, subscribe to store updates
  // and save the unsubscribe callback for when the component is
  // going to be unmounted
  componentDidMount () {
    this.unsubscribe = this.props.store.subscribe(this.listenStore)
  }
  // During unmount, unsubscribe from the redux store
  componentWillUnmount () {
    if (this.unsubscribe) { this.unsubscribe() }
  }
  // Callback method to receive state updates
  listenStore () {
    // If the state update contains a route transition, execute it
    if (this.props.store.getState().hasIn(['fetchStatus', 'transitionTo'])) {
      this.context.router.history.push(this.props.store.getState().getIn(['fetchStatus', 'transitionTo']))
    }
    this.setState({
      reduxState: this.props.store.getState()
    })
  }
  // Render the container and its children
  render () {
    let locale = this.props.getCurrentLocale()
    if (locale !== this.currentLocale) {
      this.currentLocale = locale
      this.init()
    }
    return (
      <SiteMenu title={this.context.intl.formatMessage(this.componentText.containerTitle)}
                navOptions={this.navOptions}
                availableLocales={this.availableLocales}
                changeLocale={this.props.changeLocale}
                currentLocale={locale}
                userId={getUserId(this.state.reduxState.getIn(['user', 'current']))}
                username={getUserName(this.state.reduxState.getIn(['user', 'current']))}
                messageType={this.state.reduxState.getIn(['fetchStatus', 'messageType'])}
                message={this.context.intl.formatMessage(this.state.reduxState.getIn(['fetchStatus', 'message']))}>
        <Grid fluid={true} id="appName">
          <Row>
            <Switch>
              <Route path={'/home'} component={Home} />
              <Route path={'/user'} component={Preferences} />
            </Switch>
          </Row>
        </Grid>
      </SiteMenu>
    )
  }
}

Container.contextTypes = {
  intl: intlShape.isRequired,
  router: PropTypes.object
}

// Define the types of child context the container will produce
Container.childContextTypes = {
  dispatch: PropTypes.func,
  reduxState: PropTypes.object
}
