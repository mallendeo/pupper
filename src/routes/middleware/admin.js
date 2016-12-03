export const isAdmin = (db) => (req, res, next) => {
  console.log('key', req.query.key)
  const { name } = db.apiKeys.get(req.query.key)

  if (name !== 'Admin') {
    return res
      .status(401)
      .json({ error: 'Not allowed' })
  }

  next()
}
