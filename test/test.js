var RethinkSession = require('../index')
var assert = require('assert')
var rethinkdb = require('rethinkdbdash')

require('co-mocha')

describe('RethinkSession', function() {
  var connection = rethinkdb()
  var TEST_DB = 'koarethinkdbsession'
  var TEST_TABLE = 'session'

  function makeRS() {
    return new RethinkSession({
      connection: connection,
      db: TEST_DB,
      table: TEST_TABLE
    })
  }

  before(function*() {
    try {
      yield connection.dbDrop(TEST_DB)
      // drop the default db too
      yield connection.dbDrop('sessions')
    } catch (e) {}
  })

  it('has a `setup` function that creates a db, table, and indexes', function*() {
    var rs = makeRS()

    yield rs.setup()
    var res = yield connection.db(TEST_DB).table(TEST_TABLE)
    assert(Array.isArray(res))
    assert.equal(res.length, 0)

    var indices = yield connection.db(TEST_DB).table(TEST_TABLE).indexList()
    assert(Array.isArray(indices))
    assert.equal(indices.length, 1)
  })

  it('sets sessions', function* () {
    var rs = makeRS()
    var session = { wut: 'okay' }
    yield rs.set('bar', session)

    var sessions = yield connection.db(TEST_DB).table(TEST_TABLE).getAll('bar', {index: 'sid'})

    assert(Array.isArray(sessions))
    assert.equal(sessions[0].sid, 'bar')
    assert.equal(sessions[0].wut, session.wut)
  })

  it('gets sessions', function* () {
    var rs = makeRS()
    var session = { sid: 'butts', yolo: 'swaggins' }
    yield connection.db(TEST_DB).table(TEST_TABLE).insert(session)
    var res = yield rs.get(session.sid)
    assert.equal(res.yolo, session.yolo)
    assert.equal(res.sid, session.sid)
  })

  it('deletes sessions', function* () {
    var rs = makeRS()
    var session = { deleteTest: 'okay' }
    var sid = 'stuff'
    yield rs.set(sid, session)
    var sessions = yield connection.db(TEST_DB).table(TEST_TABLE).getAll(sid, {index: 'sid'})
    assert.equal(sessions.length, 1)
    yield rs.destroy(sid)
    sessions = yield connection.db(TEST_DB).table(TEST_TABLE).getAll(sid, {index: 'sid'})
    assert.equal(sessions.length, 0)
  })

  it('falls back to a default db and table if you dont specify them', function* () {
    var rs = new RethinkSession({
      connection: connection
    })
    yield rs.setup()
    var res = yield connection.db(rs.dbName).table(rs.tableName)
    assert(Array.isArray(res))
    assert.equal(res.length, 0)
    var session = yield rs.get('fooooooooooooo')
    assert.equal(null, session)
  })
})
