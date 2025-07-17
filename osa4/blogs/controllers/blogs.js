const blogsRouter = require('express').Router()
const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const userExtractor = require('../utils/userExtractor.js')

blogsRouter.get('', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('', userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'Title and URL are required' })
  }

  const blog = new Blog({
    title: body.title,
    url: body.url,
    user: user,
    likes: body.likes || 0,
  })
  
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const { id } = request.params

  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  if (user.id !== blog.user.toString()) {
    return response.status(403).json({ error: 'You do not have permission to delete this blog' })
  }

  const deletedBlog = await Blog.findByIdAndDelete(id)
  if (!deletedBlog) {
    return response.status(404).json({ error: 'Blog not found' })
  }
  
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params
  const updatedBlog = request.body
  const blog = await Blog.findByIdAndUpdate(id, updatedBlog, { new: true, runValidators: true })
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }
  response.json(blog)
})

module.exports = blogsRouter