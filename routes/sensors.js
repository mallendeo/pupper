module.exports = (router, gpio) => {
  // Intercom proximity sensor
  router.get('/sensors/proximity', (req, res) => {
    gpio.getProx().then(data => res.json({ data }))
  })
  
  // Intercom call button
  router.get('/sensors/ringBtn', (req, res) => {
    gpio.getBtn().then(data => res.json({ data }))
  })

  // Gate sensor (check if it's open or closed)
  router.get('/sensors/magnetic', (req, res) => {
    gpio.getMag().then(data => res.json({ data }))
  })
}
