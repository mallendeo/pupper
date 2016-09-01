module.exports = (router, gpio) => {
  router.get('/sensors/proximity', (req, res) => {
    gpio.getProx().then(data => res.json({ data }))
  })

  router.get('/sensors/ringBtn', (req, res) => {
    gpio.getBtn().then(data => res.json({ data }))
  })

  router.get('/sensors/magnetic', (req, res) => {
    gpio.getMag().then(data => res.json({ data }))
  })
}
