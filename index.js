var _ = require('lodash')

function RethinkSession(opts) {
  this.connection = opts.connection
  this.dbName = opts.db || 'sessions'
  this.tableName = opts.table || 'sessions'
}

RethinkSession.prototype.setup = function*() {
  var errors = []
  try {
    yield this.connection.dbCreate(this.dbName)
  } catch (e) {
    errors.push(e)
  }

  try {
    yield this.connection.db(this.dbName).tableCreate(this.tableName)
  } catch (e) {
    errors.push(e)
  }

  try {
    yield this.connection.db(this.dbName).table(this.tableName).indexCreate('sid')
  } catch (e) {
    errors.push(e)
  }

  return errors
}

RethinkSession.prototype.table = function() {
  return this.connection.db(this.dbName).table(this.tableName)
}

RethinkSession.prototype.get = function* (sid) {
  var res = yield this.table().getAll(sid, {index: 'sid'})
  return res[0]
}

RethinkSession.prototype.set = function* (sid, session) {
  // check if there is a doc with that id
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
  var res = yield this.table().getAll(sid, {index: 'sid'})
  if (res[0]) {
    return yield this.table().get(res[0].id).delete()
  }
}

module.exports = RethinkSession
