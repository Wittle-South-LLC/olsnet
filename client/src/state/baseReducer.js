/* baseReducer.js - Default reducer for all domain objects. */

import { List } from 'immutable'
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS, VERB_NEW,
         VERB_EDIT, VERB_CREATE, VERB_DELETE, VERB_UPDATE,
         VERB_HYDRATE, VERB_LIST, VERB_LOGIN, VERB_LOGOUT } from './fetchStatus/fetchStatusActions'
import { RO_INIT_DATA } from './ReduxObject'

export default function baseReducer (state, action, path = undefined, Cls = undefined) {
  // Out method to access the ReduxObject depends on the path from the
  // root of state. If path is undefined, then state is a ReduxObject.
  // If it is one layer deep (e.g. under 'current' for user), then it is
  // a base get via an immutable Map. If it is deeper, then path is an
  // array of keys that can be used with the appropriate immutable type.
  let getObj
  let setObj
  switch (typeof path) {
    case 'undefined':
      getObj = (state) => state
      setObj = (state, obj) => obj
      break
    case 'string':
      getObj = (state) => state.get(path)
      setObj = (state, obj) => state.set(path, obj)
      break
    case 'object': // Presumably this is an array
      getObj = (state) => state.getIn(path)
      setObj = (state, obj) => state.setIn(path, obj)
  }
  if (action.hasOwnProperty('status')) {
    switch (action.status) {
      case FETCH_START:
        return action.verb !== VERB_LIST
          ? setObj(state, getObj(state).setFetching())
          : state.set('list', undefined).set('listFetching', true)
      case FETCH_ERROR:
        return action.verb !== VERB_LIST
          ? setObj(state, getObj(state).clearFetching())
          : state.delete('list').delete('listFetching')
      case FETCH_SUCCESS:
        switch (action.verb) {
          case VERB_CREATE:
            if (getObj(state).afterCreateSuccess) {
              return setObj(state, getObj(state).clearFetching().clearNew().clearDirty().afterCreateSuccess())
            } else {
              return setObj(state, getObj(state).clearFetching().clearNew().clearDirty())
            }
          case VERB_UPDATE:
            let newObj = action.reduxObj.afterUpdateSuccess
              ? action.reduxObj.clearFetching().clearDirty().afterUpdateSuccess()
              : action.reduxObj.clearFetching().clearDirty()
            if (action.reduxObj.getId() === getObj(state).getId()) {
              return setObj(state, newObj)
            } else if (state.has('list')) {
              let myIndex = state.get('list').findIndex((obj) => obj.getId() === newObj.getId())
              // TODO: The start of the below statement is a hack, the code in FETCH_START above
              //       should not be setting fetching if the object being updated is not the current
              //       object. Postponing addressing this until I make the change to have current
              //       be a pointer to the object in the collection rather than a stand-alone object
              return setObj(state, getObj(state).clearFetching()).setIn(['list', myIndex], newObj)
            } else {
              return state
            }
          case VERB_DELETE:
            if (state.has('list')) {
              let myIndex = state.get('list').findIndex((obj) => obj.getId() === action.reduxObj.getId())
              if (myIndex >= 0) {
                return state.deleteIn(['list', myIndex])
              } else {
                return state
              }
            } else {
              return state
            }
          case VERB_LOGIN:
          case VERB_HYDRATE:
            return setObj(state, new Cls({ [RO_INIT_DATA]: action.receivedData }))
          case VERB_LOGOUT:
            return setObj(state, new Cls())
          case VERB_LIST:
            let ret = List([])
            for (let u of action.receivedData) {
              ret = ret.push(new Cls({ [RO_INIT_DATA]: u }))
            }
            return state.set('list', ret).delete('listFetching')
          default: // Covers all other action verbs
            return setObj(state, getObj(state).clearFetching())
        }
      default:
        return state
    }
  } else {
    switch (action.verb) {
      case VERB_NEW:
        return setObj(state, new Cls().setNew())
      case VERB_EDIT:
        if (!action.editObj) {
          return setObj(state, getObj(state).updateField(action.fieldName, action.fieldValue).setDirty())
        } else {
          if (state.has('list')) {
            let myIndex = state.get('list').findIndex((item) => item.getId() === action.editObj.getId())
            return state.setIn(['list', myIndex], state.getIn(['list', myIndex]).updateField(action.fieldName, action.fieldValue).setDirty())
          } else {
            console.log('VERB_EDIT action without list!')
            return state
          }
        }
      default:
        return state
    }
  }
}
