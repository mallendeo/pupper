import { isAdmin } from './middleware/admin'

export default (router, db) => {
  const checkAdmin = (req, res, next) => {
    if (!isAdmin(req.query.key, db)) {
      return res
        .status(401)
        .json({ error: 'Not allowed' })
    }

    next()
  }

  // Generate key for admin after install
  router.get('/apiKey/init', (req, res) => {
    if (db.apiKeys.all().length) {
      return res
        .status(403)
        .json({ error: 'Initial API key already claimed.' })
    }

    const apiKey = db.apiKeys.create('Admin')
    res.json({ data: apiKey })
  })

  router.post('/apiKey/claim', (req, res) => {
    try {
      const key = db.apiKeys.claim(req.body.code)
      res.json({ data: key })
    } catch (e) {
      return res
        .status(403)
        .json({ error: e.message })
    }
  })

  router.get('/apiKey', checkAdmin, (req, res) => {
    res.json({ data: db.apiKeys.all() })
  })

  router.post('/apiKey', checkAdmin, (req, res) => {
    if (!req.body.name) {
      return res
        .status(400)
        .json({ error: 'name param required' })
    }

    try {
      const apiKey = db.apiKeys.create(req.body.name)
      res.json({ data: apiKey })
    } catch (e) {
      res.status(501).json({ error: e.message })
    }
  })

  router.delete('/apiKey/:key', checkAdmin, (req, res) => {
    if (!req.params.key) {
      return res
        .status(400)
        .json({ error: 'key param required' })
    }

    const apiKey = db.apiKeys.remove(req.params.key)
    res.json({ data: apiKey })
  })
}
