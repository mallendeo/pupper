module.exports = (router, gpio) => {
  router.get('/sensors/proximity', (req, res) => {
    res.json({ data: gpio.read(gpio.pins.proximitySensor) })
  })

  router.get('/sensors/magnetic', (req, res) => {
    res.json({ data: gpio.read(gpio.pins.magneticSensor) })
  })

  // Gate sensor (check if it's open or closed)
  router.get('/sensors/intercomBtn', (req, res) => {
    res.json({ data: gpio.read(gpio.pins.intercomBtn) })
  })
}
