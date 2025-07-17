const { test, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const supertest = require('supertest')
const app = require('../app.js')
const { listWithOneBlog, listWithManyBlogs } = require('../data/blogs.js')
const Blog = require('../models/blog.js')
const User = require('../models/user.js')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(listWithManyBlogs)
})

const createTestUser = async () => {
  await User.deleteMany({})
  await api.post('/api/users')
    .send({
      username: 'testuser',
      name: 'Test User',
      password: 'password123'
    })

  const loginResponse = await api.post('/api/login')
    .send({
      username: 'testuser',
      password: 'password123'
    })

  return loginResponse.body.token
}

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, listWithManyBlogs.length)
})

test('identification field is named id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {
    assert.ok(blog.id, 'Blog is missing id')
  })
})

test('a valid blog can be added', async () => {

  const token = await createTestUser()

  const newBlog = {
    title: 'New Blog',
    url: 'http://example.com/new-blog',
    likes: 5,
  }

  const initial = await api.get('/api/blogs')
  const initialLength = initial.body.length

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialLength + 1)
})

test('if likes are missing, defaults to 0', async () => {

  const token = await createTestUser()

  const newBlog = {
    title: 'Blog without likes',
    author: 'John Doe',
    url: 'http://example.com/blog-without-likes'
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const addedBlog = response.body.find(blog => blog.title === newBlog.title)
  assert.strictEqual(addedBlog.likes, 0)
})

test('adding a blog without title or url fails with status 400', async () => {

  const token = await createTestUser()

  const newBlog = {
    author: 'John Doe',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('adding a blog without token fails with status 401', async () => {

  const newBlog = {
    title: 'New Blog',
    url: 'http://example.com/new-blog',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)
})

test('a blog can be deleted', async () => {

  const token = await createTestUser()

  const newBlog = {
    title: 'New Blog',
    url: 'http://example.com/new-blog',
    likes: 5,
  }

  const newBlogResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)

  const initial = await api.get('/api/blogs')
  const initialLength = initial.body.length

  const blogToDelete = newBlogResponse.body

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialLength - 1)
})

test('updating a blog works', async () => {
  const initial = await api.get('/api/blogs')
  const blogToUpdate = initial.body[0]
  const updatedBlog = { ...blogToUpdate, likes: 42 }

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const updated = response.body.find(blog => blog.id === blogToUpdate.id)
  assert.deepStrictEqual(updated.likes, 42)
})

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs equals the sum of their likes', () => {
    const result = listHelper.totalLikes(listWithManyBlogs)
    assert.strictEqual(result, 36)
  })
})

describe('favorite blog', () => {
  test('when list has only one blog equals that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    assert.deepStrictEqual(result, listWithOneBlog[0])
  })

  test('when list has multiple blogs equals the one with most likes', () => {
    const result = listHelper.favoriteBlog(listWithManyBlogs)
    assert.deepStrictEqual(result, listWithManyBlogs[2])
  })
})

describe('most blogs', () => {
  test('when list has only one blog equals that author with one blog', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', blogs: 1 })
  })

  test('when list has multiple blogs returns the author with most blogs', () => {
    const result = listHelper.mostBlogs(listWithManyBlogs)
    assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
  })
})

describe('most likes', () => {
  test('when list has only one blog equals that author with likes of that blog', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 5 })
  })

  test('when list has multiple blogs returns the author with most likes', () => {
    const result = listHelper.mostLikes(listWithManyBlogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 })
  })
})
