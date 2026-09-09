import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null

  if (!token) return res.status(401).json({ message: 'Authentication required.' })

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId
    next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' })
  }
}
