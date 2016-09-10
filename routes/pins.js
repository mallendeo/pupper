const debug = require('debug')('alarmpi:router')

module.exports = (router, gpio) => {
  const dateDiff = (req, res, next) => {
    if (req.body.force) return next()

    if (!req.body.date) {
      return res.status(400).json({
        error: 'date param required'
      })
    }

    try {
      const dateDiff = Date.now() - parseInt(req.body.date)
      debug(`Check datediff: ${dateDiff}ms`)
      if (dateDiff > (req.body.timeout || 1000)) {
        return res.status(401).json({
          error: 'Time diff was longer than one second'
        })
      }
      req.dateDiff = dateDiff
      next()
    } catch (e) {
      return res.status(400).json({
        error: 'Incorrect date param format'
      })
    }
  }

  const checkPin = (req, res, next) => {
    const pin = gpio.pins[req.params.name]
    if (!pin) {
      return res.status(404).json({ error: 'Incorrect pin name' })
    }
    req.pin = pin
    next()
  }

  router.get('/read/:name', checkPin, (req, res) => {
    const { pin } = req
    res.json({
      data: { value: gpio.read(pin), pin }
    })
  })

  router.post('/toggle/:name', [checkPin, dateDiff], (req, res) => {
    try {
      const duration = req.body.duration && parseInt(req.body.duration)
      res.json({
        data: Object.assign({},
          gpio.toggle(req.pin, duration),
          { dateDiff: req.dateDiff }
        )
      })
    } catch (e) {
      res.status(500).json({ error: true })
    }
  })

  router.get('/datePing', (req, res) =>
    res.json({ now: parseInt(req.query.now), received: Date.now() }))
}
