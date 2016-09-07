module.exports = (router, gpio) => {
  router.post('/toggles/gate', (req, res) => {
    res.json({ data: gpio.toggle(gpio.pins.gateRelay) })
  })

  router.post('/toggles/door', (req, res) => {
    res.json({ data: gpio.toggle(gpio.pins.doorRelay) })
  })
}
