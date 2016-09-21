import chalk from 'chalk'
import debug from 'debug'
import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import socketio from 'socket.io'
import jwt from 'express-jwt'
import cors from 'cors'

import initDb from './lib/database'
import websocket from './lib/websocket'
import pinsRouter from './routes/pins'
import helpersRouter from './routes/helpers'
import authRouter from './routes/auth'

let log = debug('pupper:app')

const db = initDb('db.json')
const pinsConfig = db.pins.all()

const { NODE_ENV, PORT, JWT_SECRET } = process.env

// GPIO lib
// Must use CommonJS for conditional require
const gpio = NODE_ENV === 'development'
  ? require('./lib/fakeGpio')(pinsConfig)
  : require('./lib/gpio')(pinsConfig, require('rpio'))

const router = new express.Router()
const app = express()
const server = http.createServer(app)
const io = socketio(server)

if (NODE_ENV === 'development') {
  log(chalk.bold.yellow('env: development'))
}

app.use(express.static(`${__dirname}/public`))

// Protect all API routes but renewToken
app.use(jwt({ secret: JWT_SECRET }).unless({
  path: [
    '/api/token/renew',
    '/api/token/verify',
    '/api/apiKey/init'
  ]
}))

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' })
  }
})

websocket(io, gpio)

pinsRouter(router, gpio, db)
helpersRouter(router, gpio)
authRouter(router, db)


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use('/api', router)

const listener = server.listen(PORT || 8080, () =>
  log(chalk.green(`Listening on port ${listener.address().port} 🐶`)))

// Graceful shutdown
process.on('SIGINT', () => process.exit())
