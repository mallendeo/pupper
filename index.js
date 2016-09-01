const express = require('express')
const bodyParser = require('body-parser')

// Routes
const sensorsRouter = require('./routes/sensors')
const togglesRouter = require('./routes/toggles')

const config = require('./config')

if (!config.authKey) throw Error('authKey not set!')

const PORT = config.port || 8080
const init = gpio => gpio.init().then(() => {
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

if (process.env.NODE_ENV === 'development') {
  const fakeGpio = () => {
    return {
      init: () => Promise.resolve(),
      getProx: () => Promise.resolve(1)
    }
  }

  init(fakeGpio(config))
}

init(require('./lib/gpio')(config))

// Graceful shutdown
process.on('SIGINT', () => process.exit())
