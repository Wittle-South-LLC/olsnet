/* baseApp.js - Application reducer for redux state */
import { combineReducers } from 'redux-immutable'
import { fetchStatus } from './fetchStatus/fetchStatusReducer'
import { testStuff } from './testStuff/testStuffReducer'
import { user } from './user/userReducer'

const baseApp = combineReducers({
  fetchStatus,
  testStuff,
  user
})

export default baseApp
