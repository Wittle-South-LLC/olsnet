/* index.jsx - Root component for application

   This module is responsible for establishing the overall application
   environment, which includes the following
   - Creating the core React environment and binding it to the page
   - Create the Redux environment and setting up the store
   - Establishing the React Router container; since we're using v4,
     the routes are spread through the application
   - Establishing the core internationalization environment using
     react-intl. Currently the application attempts to maintain a 
     fake French translation
*/
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import 'bootstrap/dist/css/bootstrap.css'
import fetch from 'isomorphic-fetch'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import { BrowserRouter } from 'react-router-dom'
import { IntlProvider, addLocaleData, defineMessages } from 'react-intl'
import fr from 'react-intl/locale-data/fr'
import baseApp from './state/baseApp'
import Container from './Container'
import { hydrateApp } from './state/user/userActions'
import './index.css'

let defaultLocaleData = {}

export class App extends React.Component {
  constructor (props, context) {
    super(props, context)

    // Bind the two helper methods for dynamic loading of components
    this.changeLocale = this.changeLocale.bind(this)
    this.loadLocale = this.loadLocale.bind(this)
    this.setLocale = this.setLocale.bind(this)
    this.getLocale = this.getLocale.bind(this)

    // Establish the Redux store that will hold the data model
    // state for this application
    // --> baseApp is the root reducer
    // --> baseApp(undefined, {}) creates an initial state
    // --> thunkMiddleware allows us to use async functions as Redux actions
    this.store = createStore(baseApp,
                             baseApp(undefined, {}),
                             applyMiddleware(thunkMiddleware))

    // Set a basic message to see if we're fucked for some unknown reason
    this.componentText = defineMessages({
      testMessage: { id: 'app.testMessage', defaultMessage: 'This is a another test' }
    })

    // Set the default locale in state
    this.state = {
      locale: 'en'
    }
    this.localeData = defaultLocaleData
  }
  // Utility to load a locale dynamically
  loadLocale (loc) {
    let _self = this
    // This code should initialize the locale based on the actual locale
    fetch(`/lang/${loc}.json`)
      .then((res) => {
        if (res.status >= 400) {
          throw new Error('Bad response from server');
        }
        return res.json()
      })
      .then((localeData) => {
        if (loc === 'fr') {
          addLocaleData(fr)
        }
        _self.localeData = localeData
        this.setLocale(loc)
      }).catch((error) => {
        console.error(error)
      })
  }
  componentDidMount() {
    this.store.dispatch(hydrateApp())
  }
  changeLocale (loc) {
    this.loadLocale(loc.target.value)
  }
  setLocale (loc) {
    this.setState({
      locale: loc
    })
  }
  getLocale () {
    return this.state.locale
  }
  render () {
    return (
      <IntlProvider locale={this.state.locale} messages={this.localeData}>
        <BrowserRouter>
          <Container store={this.store}
                     changeLocale={this.changeLocale}
                     getCurrentLocale={this.getLocale} />
        </BrowserRouter>
      </IntlProvider>
    )
  }
}

fetch(`/lang/en.json`)
  .then((res) => {
    if (res.status >= 400) {
      throw new Error('Bad response from server')
    }
    return res.json()
  })
  .then((localeData) => {
    defaultLocaleData = localeData
  }).catch((error) => {
    console.error(error)
  })

ReactDOM.render(<App />, document.getElementById('app'))
