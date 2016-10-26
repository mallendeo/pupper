import bodyParser from 'body-parser'
import chalk from 'chalk'
import cors from 'cors'
import debug from 'debug'
import express from 'express'
import http from 'http'
import jwt from 'express-jwt'
import socketio from 'socket.io'

import initDb from './lib/database'
import websocket from './lib/websocket'
import pinsRouter from './routes/pins'
import authRouter from './routes/auth'

const log = debug('pupper:app')

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

// Protect all API routes but the token renew ones
app.use(jwt({ secret: JWT_SECRET }).unless({
  path: [
    '/api/token/renew',
    '/api/token/verify',
    '/api/apiKey/init',
    '/api/apiKey/claim'
  ]
}))

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Invalid token' })
  }
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

websocket(io, gpio)

pinsRouter(router, gpio, db)
authRouter(router, db)
app.use('/api', router)

const listener = server.listen(PORT || 8080, () =>
  log(chalk.green(`Listening on port ${listener.address().port} 🐶`)))

// Graceful shutdown
process.on('SIGINT', () => process.exit())
