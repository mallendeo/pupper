const chalk = require('chalk')
const express = require('express')
const bodyParser = require('body-parser')
const debug = require('debug')('alarmpi')
const config = require('./pinsConfig')

const { AUTH_KEY, NODE_ENV, PORT } = process.env

const gpio = NODE_ENV === 'development'
  ? require('./lib/fakeGpio')(config)
  : require('./lib/gpio')(config)

// Routes
const sensorsRouter = require('./routes/sensors')
const togglesRouter = require('./routes/toggles')

const router = new express.Router()
const app = express()

const websocket = require('./lib/websocket')
const server = require('http').createServer(app)
const io = require('socket.io')(server)

websocket(io, gpio)

if (!AUTH_KEY) throw Error('AUTH_KEY not set!')

if (NODE_ENV === 'development') {
  debug(chalk.bold.yellow('env: development'))
}

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  if (req.headers.authorization !== AUTH_KEY) {
    return res.status(401).json({ error: 'Invalid key' })
  }
  next()
})

sensorsRouter(router, gpio)
togglesRouter(router, gpio)

app.use('/', router)

const listener = server.listen(PORT || 8080, () =>
  debug(chalk.green(`Listening on port ${listener.address().port} 😎 👌`)))

// Graceful shutdown
process.on('SIGINT', () => process.exit())
