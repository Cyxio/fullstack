const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  return blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])
}

const mostBlogs = (blogs) => {
  const authorCount = blogs.reduce((count, blog) => {
    count[blog.author] = (count[blog.author] || 0) + 1
    return count
  }, {})

  const mostBlogsAuthor = Object.keys(authorCount).reduce((max, author) => {
    return authorCount[author] > authorCount[max] ? author : max
  }, Object.keys(authorCount)[0])

  return {
    author: mostBlogsAuthor,
    blogs: authorCount[mostBlogsAuthor]
  }
}

const mostLikes = (blogs) => {
  const authorLikes = blogs.reduce((likes, blog) => {
    likes[blog.author] = (likes[blog.author] || 0) + blog.likes
    return likes
  }, {})

  const mostLikesAuthor = Object.keys(authorLikes).reduce((max, author) => {
    return authorLikes[author] > authorLikes[max] ? author : max
  }, Object.keys(authorLikes)[0])

  return {
    author: mostLikesAuthor,
    likes: authorLikes[mostLikesAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}