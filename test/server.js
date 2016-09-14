import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import socketio from 'socket.io'
import jwt from 'express-jwt'

import initDb from '../src/lib/database'
import websocket from '../src/lib/websocket'
import pinsRouter from '../src/routes/pins'
import helpersRouter from '../src/routes/helpers'
import authRouter from '../src/routes/auth'

const db = initDb('db-test.json')
const pinsConfig = db.pins.all()

// define env variables
const PORT = 3000
const JWT_SECRET = 'secret'

// Lib
const gpio = require('../src/lib/fakeGpio')(pinsConfig)

const router = new express.Router()
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(jwt({ secret: JWT_SECRET }).unless({
  path: [
    '/api/token/renew',
    '/api/token/verify'
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
app.use('/api', router)

server.listen(PORT)

process.on('SIGINT', () => process.exit())
