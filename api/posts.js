const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db.json');

// Helper function to read data from `db.json`
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { posts: [] };
  }
}

// Helper function to write data to `db.json`
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
  }
}

// Route to get all posts
router.get('/', (req, res) => {
  const db = readDb();
  res.status(200).json(db.posts || []);
});

// Route to create a new post
router.post('/', (req, res) => {
  const { username, fullnames, profileImage, caption, imageUrl } = req.body;

  if (!username || !caption || !imageUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = readDb();
  const newPost = {
    id: String(Date.now()),
    username,
    fullnames,
    profileImage,
    caption,
    imageUrl,
    likeCount: 0,
    comments: [],
  };

  db.posts.push(newPost);
  writeDb(db);

  res.status(201).json(newPost);
});

// Route to like a post
router.patch('/:id/like', (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const post = db.posts.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.likeCount += 1;
  writeDb(db);

  res.status(200).json(post);
});

// Route to add a comment to a post
router.post('/:id/comments', (req, res) => {
  const { id } = req.params;
  const { username, text } = req.body;

  if (!text || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = readDb();
  const post = db.posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newComment = {
    id: String(Date.now()),
    username,
    text,
  };

  post.comments.push(newComment);
  writeDb(db);

  res.status(201).json(newComment);
});

// Route to edit a comment
router.patch('/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const db = readDb();
  const post = db.posts.find((p) => p.id === postId);

  if (!post) {
    console.error(`Post with ID ${postId} not found`);
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = post.comments.find((c) => c.id === commentId);

  if (!comment) {
    console.error(`Comment with ID ${commentId} not found in post ${postId}`);
    return res.status(404).json({ error: 'Comment not found' });
  }

  comment.text = text;
  writeDb(db);

  res.status(200).json(comment);
});

// Route to delete a comment
router.delete('/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;

  const db = readDb();
  const post = db.posts.find((p) => p.id === postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const commentIndex = post.comments.findIndex((c) => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  post.comments.splice(commentIndex, 1);
  writeDb(db);

  res.status(200).json({ message: 'Comment deleted successfully' });
});

module.exports = router;
