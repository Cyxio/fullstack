require('dotenv').config()

const mongoUrl = process.env.MONGODB_URL
const PORT = process.env.PORT

module.exports = {
  mongoUrl,
  PORT
}
