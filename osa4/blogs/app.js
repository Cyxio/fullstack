const express = require('express')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs.js')
const usersRouter = require('./controllers/users.js')
const loginRouter = require('./controllers/login.js')
const { mongoUrl } = require('./utils/config.js')
const errorHandler = require('./utils/errorHandler.js')
const tokenExtractor = require('./utils/tokenExtractor.js')

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connection to MongoDB:', error.message)
  })

const app = express()
app.use(express.json())
app.use(tokenExtractor)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(errorHandler)

module.exports = app