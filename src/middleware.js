const cache = require('./cache')
const db = require('./db')

function userMiddleware(req, res, next) {
  const userId = req.params.id
  const user = cache.get(userId)
  if (!user) {
    db.findUserById(userId).then((result) => {
      res.body = result
      next()
    })
  } else {
    res.body = user
    next()
  }
}

module.exports = {
  userMiddleware
}
