import { checkTimeDiff } from '../lib/helpers'
import { isAdmin } from './middleware/admin'

export default (router, gpio, db) => {
  const checkAdmin = isAdmin(db)

  // Pins collection
  const { pins } = db

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
      if (!checkTimeDiff(req.body.date, req.body.timeout)) {
        return res
          .status(401)
          .json({ error: 'Time diff was longer than the timeout' })
      }
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

  // Set new pin and export it
  router.post('/pin', checkAdmin, (req, res) => {
    try {
      const pin = pins.add(req.body)
      gpio.open(pin)
      res.json({ data: pin })
    } catch (e) {
      // 409 Conflict
      res.status(409).json({ error: e.message })
    }
  })

  // Remove a pin and unexport it
  router.delete('/pin/:slug', checkAdmin, (req, res) => {
    try {
      const removed = pins.remove(req.params.slug)
      gpio.close(removed.num)
      res.json({ data: { removed } })
    } catch (e) {
      res.status(404).json({ error: 'Pin not found' })
    }
  })

  // Get all pins
  router.get('/pin', (req, res) => {
    const allPins = pins.all().map(pin => {
      pin.uri = `/api/pin/${pin.slug}`
      return pin
    })
    res.json({ data: { pins: allPins } })
  })

  // Get pin info by slug
  router.get('/pin/:slug', (req, res) => {
    const pin = pins.find(req.params.slug)
    if (!pin) return res.status(404).json({ error: 'Pin not found' })
    res.json({ data: { pin } })
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

    const value = parseInt(req.body.value)
    if (isNaN(value)) {
      return res
        .status(400)
        .json({ error: 'value must be a number' })
    }

    res.json({
      data: {
        value: value === 0 ? gpio.off(req.pin) : gpio.on(req.pin)
      }
    })
  })
}
