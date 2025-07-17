const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

const tokenExtractor = (request, response, next) => {
    try {
        const decodedToken = getTokenFrom(request)
        request.token = decodedToken
    } catch (error) {
        request.token = null
    }
  next()
}

module.exports = tokenExtractor