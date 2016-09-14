const jwt = require('jsonwebtoken')

const generateToken = (type = 'app', expire = 600) =>
  jwt.sign({ type }, process.env.JWT_SECRET, {
    issuer: 'pupper',
    expiresIn: expire
  })

export default (router, db) => {
  router.post('/token/renew', (req, res) => {
    if (req.body.password) {
      if (!db.settings.checkPassword(req.body.password)) {
        return res
          .status(401)
          .json({ error: 'Incorrect password' })
      }
      return res.json({
        token: generateToken('admin')
      })
    }

    if (db.apiKeys.verify(req.body.key, req.body.secret)) {
      return res.json({ token: generateToken() })
    }

    res.status(401).json({ error: 'Invalid key' })
  })

  router.post('/token/verify', (req, res) => {
    const token = req.headers.authorization.replace('Bearer ', '')
    try {
      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
      res.json({ valid: true, token: verifiedToken })
    } catch (e) {
      res.json({ valid: false, error: e.message })
    }
  })

  // Check user type middleware
  router.use(['/apiKey*', '/password'], (req, res, next) => {
    if (req.user.type !== 'admin') {
      return res
        .status(401)
        .json({ error: 'Not allowed' })
    }

    next()
  })

  router.get('/apiKey', (req, res) => {
    res.json({ data: db.apiKeys.all() })
  })

  router.post('/apiKey', (req, res) => {
    if (!req.body.name) {
      return res
        .status(400)
        .json({ error: `'name' parameter required` })
    }

    try {
      const apiKey = db.apiKeys.create(req.body.name)
      res.json({ data: apiKey })
    } catch (e) {
      res.status(501).json({ error: e.message })
    }
  })

  router.delete('/apiKey/:key', (req, res) => {
    if (!req.params.key) {
      return res
        .status(400)
        .json({ error: `'key' param required` })
    }

    const apiKey = db.apiKeys.remove(req.body.key)
    res.json({ data: apiKey })
  })

  router.put('/password', (req, res) => {
    if (!req.body.old || !req.body.new) {
      return res
        .status(400)
        .json({ error: 'Old and new passwords required' })
    }

    if (db.settings.updatePassword(req.body.old, req.body.new)) {
      return res.json({ updated: true })
    }

    return res
      .status(500)
      .json({ error: `Couldn't update the password` })
  })
}
