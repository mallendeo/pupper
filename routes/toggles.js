module.exports = (router, gpio) => {
  router.post('/toggles/gate', (req, res) => {
    gpio.openGate()
    res.end()
  })

  router.post('/toggles/door', (req, res) => {
    gpio.openDoor()
    res.end()
  })
}
