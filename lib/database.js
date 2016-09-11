const low = require('lowdb')
const fileAsync = require('lowdb/lib/file-async')
const db = low('db.json', { storage: fileAsync })

db.defaults({ pins: [], settings: {} }).value()

module.exports = db
