module.exports = (router, gpio) => {
  router.get('/datePing', (req, res) =>
    res.json({ now: parseInt(req.query.now), received: Date.now() }))

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
}
