/* ReduxObject.js - Base object for Redux state
   Provides a set of helper functions for shared state of
   a Redux domain object. Intent is to add a 'meta' member
   to a domain object that holds its state relative to the
   server.
   - new      => Exists locally but not in the server
   - dirty    => Different locally than on the server
   - fetching => Server operation on this object is in process
*/

export const RO_COPY_FROM = 'copyFrom'
export const RO_INIT_DATA = 'initData'
const MAX_HASH_CODE = 199999999

export class ReduxObject {
  constructor (paramObj) {
    this.fetching = paramObj && paramObj.hasOwnProperty(RO_COPY_FROM) ? paramObj.copyFrom.fetching : false
    this.new = paramObj && paramObj.hasOwnProperty(RO_COPY_FROM) ? paramObj.copyFrom.new : false
    this.dirty = paramObj && paramObj.hasOwnProperty(RO_COPY_FROM) ? paramObj.copyFrom.dirty : false
    this._hashCode = Math.floor(Math.random() * MAX_HASH_CODE)
  }
  hashCode () {
    return this._hashCode
  }
  equals (obj) {
    if (obj.hashCode() === this._hashCode) { return true }
    if (obj.new === this.new &&
        obj.dirty === this.dirty &&
        obj.fetching === this.fetching) { return true }
  }
  // Returns a copy of this instance with new set to false
  clearNew () {
    return this.new ? Object.assign(new this.constructor({[RO_COPY_FROM]: this}), {new: false}) : this
  }
  // Returns a copy of this instance with dirty set to false
  clearDirty () {
    return this.dirty ? Object.assign(new this.constructor({[RO_COPY_FROM]: this}), {dirty: false}) : this
  }
  // Returns a copy of this instance with fetching set to false
  clearFetching () {
    return this.fetching ? Object.assign(new this.constructor({[RO_COPY_FROM]: this}), {fetching: false}) : this
  }
  // Returns a copy of this instance with new set to true
  setNew () {
    return !this.new ? Object.assign(new this.constructor({[RO_COPY_FROM]: this}), {new: true}) : this
  }
  // Returns a copy of this instance with dirty set to true
  setDirty () {
    return !this.dirty ? Object.assign(new this.constructor({[RO_COPY_FROM]: this}), {dirty: true}) : this
  }
  // Returns a copy of this instance with fetching set to true
  setFetching () {
    return !this.fetching ? Object.assign(new this.constructor({[RO_COPY_FROM]: this}), {fetching: true}) : this
  }
}
