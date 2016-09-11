const chalk = require('chalk')
const debug = require('debug')('pupper:app')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')
const db = require('./lib/database')

const pinsConfig = db.get('pins').value()

const { AUTH_KEY, NODE_ENV, PORT } = process.env

// Lib
const gpio = NODE_ENV === 'development'
  ? require('./lib/fakeGpio')(pinsConfig)
  : require('./lib/gpio')(pinsConfig, require('rpio'))
const websocket = require('./lib/websocket')

const pinsRouter = require('./routes/pins')

const router = new express.Router()
const app = express()
const server = http.createServer(app)
const io = socketio(server)

if (!AUTH_KEY) throw Error('AUTH_KEY not set!')

if (NODE_ENV === 'development') {
  debug(chalk.bold.yellow('env: development'))
}

app.use(express.static('public'))

app.use('/api/*', (req, res, next) => {
  if (req.headers.authorization !== AUTH_KEY) {
    return res.status(401).json({ error: 'Invalid key' })
  }
  next()
})

io.use((socket, next) => {
  if (socket.request._query.auth !== AUTH_KEY) {
    return next(Error('Invalid key'))
  }
  next()
})

websocket(io, gpio)

pinsRouter(router, gpio, db)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/api', router)

const listener = server.listen(PORT || 8080, () =>
  debug(chalk.green(`Listening on port ${listener.address().port} 🐶`)))

// Graceful shutdown
process.on('SIGINT', () => process.exit())
