const chalk = require('chalk')
const debug = require('debug')('alarmpi:app')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')

const config = require('./pinsConfig')

const { AUTH_KEY, NODE_ENV, PORT } = process.env

// Lib
const gpio = NODE_ENV === 'development'
  ? require('./lib/fakeGpio')(config)
  : require('./lib/gpio')(config, require('rpio'))
const websocket = require('./lib/websocket')

const sensorsRouter = require('./routes/sensors')
const togglesRouter = require('./routes/toggles')


const router = new express.Router()
const app = express()
const server = http.createServer(app)
const io = socketio(server)

if (!AUTH_KEY) throw Error('AUTH_KEY not set!')

if (NODE_ENV === 'development') {
  debug(chalk.bold.yellow('env: development'))
}


app.use((req, res, next) => {
  if (req.headers.authorization !== AUTH_KEY) {
    return res.status(401).json({ error: 'Invalid key' })
  }
  next()
})

sensorsRouter(router, gpio)
togglesRouter(router, gpio)

websocket(io, gpio)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use('/', router)

const listener = server.listen(PORT || 8080, () =>
  debug(chalk.green(`Listening on port ${listener.address().port} 😎 👌`)))

// Graceful shutdown
process.on('SIGINT', () => process.exit())
