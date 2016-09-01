const express = require('express')
const bodyParser = require('body-parser')
const sensorsRouter = require('./routes/sensors')
const togglesRouter = require('./routes/toggles')
const config = require('./config')
const gpio = require('./lib/gpio')

if (!config.authKey) throw Error('authKey not set!')

const PORT = config.port || 8080

gpio.init().then(() => {
  const router = new express.Router()
  const app = express()

  app.use(express.static('public'))
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use((req, res, next) => {
    if (req.headers.authorization !== config.authKey) {
      return res.status(401).json({ error: 'Invalid key' })
    }
    next()
  })

  sensorsRouter(router, gpio)
  togglesRouter(router, gpio)

  app.use('/', router)
  app.listen(PORT)

  console.log(`Listening on port ${PORT}`)
})

process.on('SIGINT', () => process.exit())
