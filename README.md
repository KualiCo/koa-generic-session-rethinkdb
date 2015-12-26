# koa-generic-session-rethinkdb

This is a module for storing sessions from the [koa-generic-session](https://github.com/koajs/generic-session)
module in [RethinkDB](http://rethinkdb.com).


## Installation

```bash
npm i --save koa-generic-session-rethinkdb
```

## Usage

### Example
```JavaScript
var koa = require('koa')
// for use with koa-generic-session
var session = require('koa-generic-session')
var co = require('co')
var RethinkSession = require('koa-generic-session-rethinkdb')
var rethinkdb = require('rethinkdbdash')

var connection = rethinkdb({
  host: 'localhost',
  port: 28015
})

var sessionStore = new RethinkSession({connection: connection})
// create the db, table and indexes to store sessions
co(function*() { yield sessionStore.setup() })



var app = koa()
// used for cookie stuffs
app.keys = ['foo', 'bar']

app.use(session({
  store: sessionStore
})
```

### `new RethinkSession(opts)`
Return a new RethinkSession store. `opts` are options.

#### Options

* `connection` - a [rethinkdbdash](https://github.com/neumino/rethinkdbdash)
  connection to a rethink server or cluster. required.
* `dbName` - the name of a db to connnect to or create. optional.
* `tableName` - the name of the table to store session in. optional.


## Contributing

Run the tests with `npm test`. Please add tests to cover new functionality.
