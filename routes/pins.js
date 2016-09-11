const debug = require('debug')('pupper:router')
const { camelCase } = require('lodash')

module.exports = (router, gpio, db) => {
  // Pins collection
  const pins = db.get('pins')

  // Date diff middleware
  // Checks if the request takes longer than the timeout specified,
  // useful for connection drops and reconnects.
  //
  // It defaults to one second and can be bypassed by setting
  // the "force" parameter to true.
  //
  // Server and client's datetime must be the same or close enough,
  // this can be calculated with the datePing helper.
  const dateDiff = (req, res, next) => {
    if (req.body.force) return next()

    if (!req.body.date) {
      return res
        .status(400)
        .json({ error: 'date param required' })
    }

    try {
      const dateDiff = Date.now() - parseInt(req.body.date)
      debug(`Check datediff: ${dateDiff}ms`)
      if (dateDiff > (req.body.timeout || 1000)) {
        return res
          .status(401)
          .json({ error: 'Time diff was longer than one second' })
      }
      req.dateDiff = dateDiff
      next()
    } catch (e) {
      return res
        .status(400)
        .json({ error: 'Incorrect date param format' })
    }
  }

  // Check pin middleware
  // Check if the pin exist and assign it to a request variable
  const checkPin = (req, res, next) => {
    const pin = gpio.pins.find(pin => pin.slug === req.params.slug)
    if (!pin) {
      return res
        .status(404)
        .json({ error: 'Pin not found' })
    }
    req.pin = pin
    next()
  }

  // API usage and available pins helper
  router.get('/', (req, res) => {
    const info = {
      read: {
        path: '/api/read/{slug}',
        method: 'GET'
      },
      write: {
        path: '/api/write/{slug}',
        method: 'POST',
        body: { value: 'Number' }
      },
      toggle: {
        path: '/api/toggle/{slug}',
        method: 'POST',
        body: {
          date: 'Number',
          force: 'Boolean',
          duration: 'Number'
        },
        headers: {
          authorization: 'Bearer <token>'
        }
      }
    }

    res.json({ pins: gpio.pins, info })
  })

  // Set new pin and export it
  router.post('/pin', (req, res) => {
    const { name, slug, num, dir, invert } = req.body
    const newSlug = slug || camelCase(name)
    if (
      pins.find({ num }).value() ||
      pins.find({ slug: newSlug }).value()
    ) {
      return res
        .status(409) // 409 Conflict
        .json({ error: 'Pin already set' })
    }

    const pin = pins
      .push({ name, slug: newSlug, num, dir, invert })
      .last()
      .value()

    gpio.open(pin)
    res.json({ data: pin })
  })

  // Remove a pin and unexport it
  router.delete('/pin/:slug', (req, res) => {
    const removed = pins
      .remove({ slug: req.params.slug })
      .value()

    if (!removed.num) {
      return res
        .status(404)
        .json({ error: 'Pin not found' })
    }

    gpio.close(removed.num)

    res.json({ data: { removed } })
  })

  // Get pin info by slug
  router.get('/pin/:slug', (req, res) => {
    const pin = pins.find({ slug: req.params.slug }).value()
    res.json({ data: { pin } })
  })

  // Get all pins
  router.get('/pin', (req, res) => {
    const allPins = pins
      .cloneDeep()
      .value()
      .map(pin => {
        pin.uri = `/api/pin/${pin.slug}`
        return pin
      })
    res.json({ data: { pins: allPins } })
  })

  // Read state of a pin
  router.get('/read/:slug', checkPin, (req, res) => {
    const { pin } = req
    res.json({
      data: { value: gpio.read(pin), pin }
    })
  })

  // Toggle a pin for a period of time
  router.post('/toggle/:slug', [checkPin, dateDiff], (req, res) => {
    try {
      const duration = req.body.duration && parseInt(req.body.duration)
      res.json({ data: gpio.toggle(req.pin, duration) })
    } catch (e) {
      res.status(500).json({ error: true })
    }
  })

  // Write value to a pin (1 or 0)
  router.post('/write/:slug', [checkPin, dateDiff], (req, res) => {
    if (req.body.value === undefined || req.body.value === '') {
      return res
        .status(400)
        .json({ error: 'value required' })
    }

    try {
      const value = parseInt(req.body.value)
      res.json({
        data: {
          value: value === 0 ? gpio.off(req.pin) : gpio.on(req.pin)
        }
      })
    } catch (e) {
      res.status(500).json({ error: true })
    }
  })

  router.get('/datePing', (req, res) =>
    res.json({ now: parseInt(req.query.now), received: Date.now() }))
}
