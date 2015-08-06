var _ = require('lodash')
var debug = require('debug')('koa:generic-session-rethinkdb')

function RethinkSession(opts) {
  this.r = opts.r
  this.dbName = opts.db || 'sessions'
  this.tableName = opts.table || 'sessions'
}

RethinkSession.prototype.setup = function*() {
  var errors = []
  try {
    yield this.r.dbCreate(this.dbName)
  } catch (e) {
    errors.push(e)
  }

  try {
    yield this.r.db(this.dbName).tableCreate(this.tableName)
  } catch (e) {
    errors.push(e)
  }

  try {
    yield this.r.db(this.dbName).table(this.tableName).indexCreate('sid')
  } catch (e) {
    errors.push(e)
  }

  return errors
}

RethinkSession.prototype.table = function() {
  return this.r.db(this.dbName).table(this.tableName)
}

RethinkSession.prototype.get = function* (sid) {
  debug('get', sid)
  var res = yield this.table().getAll(sid, {index: 'sid'})
  debug('got', res[0])
  return res[0]
}

RethinkSession.prototype.set = function* (sid, session) {
  // check if there is a doc with that id
  debug('set', sid, session)
  var res = yield this.table().getAll(sid, {index: 'sid'})
  if (res[0]) {
    res = res[0]
    var payload = _.extend({
      sid: sid,
      id: res.id
    }, session)

    return yield this.table().get(res.id).replace(payload)
  } else {
    return yield this.table().insert(_.extend({
      sid: sid
    }, session))
  }
}

RethinkSession.prototype.destroy = function* (sid) {
  debug('destroy', sid)
  var res = yield this.table().getAll(sid, {index: 'sid'})
  if (res[0]) {
    debug('found session to destroy', res[0])
    return yield this.table().get(res[0].id).delete()
  }
}

module.exports = RethinkSession
