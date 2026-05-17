const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');

const router = express.Router();

// GET /api/comments/:tmdb_movie_id  — get all comments for a movie
router.get('/:tmdb_movie_id', async (req, res) => {
  const [rows] = await db.execute(
    `SELECT c.comment_id, c.comment_text, c.posted_at, u.username
     FROM Comments c
     JOIN Users u ON c.user_id = u.user_id
     WHERE c.tmdb_movie_id = ?
     ORDER BY c.posted_at DESC`,
    [req.params.tmdb_movie_id]
  );
  res.json(rows);
});

// POST /api/comments  — post a comment
router.post('/', auth, async (req, res) => {
  const { tmdb_movie_id, movie_title, comment_text } = req.body;
  if (!tmdb_movie_id || !movie_title || !comment_text)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const [result] = await db.execute(
      'INSERT INTO Comments (user_id, tmdb_movie_id, movie_title, comment_text) VALUES (?, ?, ?, ?)',
      [req.user.user_id, tmdb_movie_id, movie_title, comment_text]
    );
    res.status(201).json({
      comment_id:   result.insertId,
      username:     req.user.username,
      comment_text,
      posted_at:    new Date(),
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/comments/:comment_id  — delete own comment
router.delete('/:comment_id', auth, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT user_id FROM Comments WHERE comment_id = ?',
    [req.params.comment_id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Comment not found' });
  if (rows[0].user_id !== req.user.user_id)
    return res.status(403).json({ error: 'Not your comment' });

  await db.execute('DELETE FROM Comments WHERE comment_id = ?', [req.params.comment_id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;