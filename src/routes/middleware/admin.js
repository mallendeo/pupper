// Check user type middleware
export const checkAdmin = (req, res, next) => {
  if (req.user.name !== 'Admin') {
    return res
      .status(401)
      .json({ error: 'Not allowed' })
  }

  next()
}
