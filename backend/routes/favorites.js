const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites  — get logged-in user's favorites
router.get('/', auth, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM Favorites WHERE user_id = ? ORDER BY saved_at DESC',
    [req.user.user_id]
  );
  res.json(rows);
});

// POST /api/favorites  — save a movie
router.post('/', auth, async (req, res) => {
  const { tmdb_movie_id, movie_title, poster_path } = req.body;
  if (!tmdb_movie_id || !movie_title)
    return res.status(400).json({ error: 'tmdb_movie_id and movie_title are required' });

  try {
    await db.execute(
      'INSERT INTO Favorites (user_id, tmdb_movie_id, movie_title, poster_path) VALUES (?, ?, ?, ?)',
      [req.user.user_id, tmdb_movie_id, movie_title, poster_path || null]
    );
    res.status(201).json({ message: 'Saved' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Already saved' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/favorites  — remove all favorites for user
router.delete('/', auth, async (req, res) => {
  await db.execute('DELETE FROM Favorites WHERE user_id = ?', [req.user.user_id]);
  res.json({ message: 'All favorites cleared' });
});

// DELETE /api/favorites/:tmdb_movie_id  — remove a movie
router.delete('/:tmdb_movie_id', auth, async (req, res) => {
  await db.execute(
    'DELETE FROM Favorites WHERE user_id = ? AND tmdb_movie_id = ?',
    [req.user.user_id, req.params.tmdb_movie_id]
  );
  res.json({ message: 'Removed' });
});

module.exports = router;