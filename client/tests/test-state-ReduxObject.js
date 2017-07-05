/* test-state-ReduxObject.js - Tests ReduxObject metadata operations */
import { describe, it } from 'mocha'
import { Map } from 'immutable'
import expect from 'expect'
import * as ReduxObject from '../src/state/ReduxObject'
import { isd } from './TestUtils'

let baseObj = new Map({}).set(ReduxObject.RO_META, new Map({}).set(ReduxObject.RO_NEW, false)
                                                              .set(ReduxObject.RO_FETCHING, false)
                                                              .set(ReduxObject.RO_DIRTY, false))
let userObj = Map({username: 'Test'})
let testUser = baseObj.set('username', 'Test')

describe('ReduxObject: testing metadata operations', () => {
  it('Adds a new metadata object to an existing object', () => {
    expect(isd(ReduxObject.addMeta(userObj), testUser)).toEqual(true)
  })
  it('Removes a metadata object from an existing object', () => {
    expect(isd(ReduxObject.deleteMeta(testUser), userObj)).toEqual(true)
  })
  let testUserDirty = testUser.setIn([ReduxObject.RO_META, ReduxObject.RO_DIRTY], true)
  it('Sets an object to dirty with setDirty()', () => {
    expect(isd(ReduxObject.setDirty(testUser, true), testUserDirty)).toEqual(true)
  })
  it('Checks that an object is dirty with isDirty()', () => {
    expect(ReduxObject.isDirty(testUserDirty)).toEqual(true)
  })
  let testUserNew = testUser.setIn([ReduxObject.RO_META, ReduxObject.RO_NEW], true)
  it('Sets an object to new with setNew()', () => {
    expect(isd(ReduxObject.setNew(testUser, true), testUserNew)).toEqual(true)
  })
  it('Checks that an object is new with isNew()', () => {
    expect(ReduxObject.isNew(testUserNew)).toEqual(true)
  })
  let testUserFetching = testUser.setIn([ReduxObject.RO_META, ReduxObject.RO_FETCHING], true)
  it('Sets an object to fetching with setFetching', () => {
    expect(isd(ReduxObject.setFetching(testUser, true), testUserFetching)).toEqual(true)
  })
  it('Checks that an object is fetching with isFetching()', () => {
    expect(ReduxObject.isFetching(testUserFetching)).toEqual(true)
  })
})
