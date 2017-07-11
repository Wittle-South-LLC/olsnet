/* baseApp.js - Application reducer for redux state */
import { combineReducers } from 'redux-immutable'
import { fetchStatus } from './fetchStatus/fetchStatusReducer'
// import { testStuff } from './testStuff/testStuffReducer'
import { user } from './user/user'

const baseApp = combineReducers({
  fetchStatus,
  user
})

export default baseApp
