const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');

const router = express.Router();

// GET /api/ratings/:tmdb_movie_id/mine  — get logged-in user's rating
router.get('/:tmdb_movie_id/mine', auth, async (req, res) => {
  const [rows] = await db.execute(
    'SELECT rating FROM Ratings WHERE user_id = ? AND tmdb_movie_id = ?',
    [req.user.user_id, req.params.tmdb_movie_id]
  );
  res.json(rows[0] || null);
});

// GET /api/ratings/:tmdb_movie_id  — get all ratings + average for a movie
router.get('/:tmdb_movie_id', async (req, res) => {
  const { tmdb_movie_id } = req.params;
  const [rows] = await db.execute(
    `SELECT 
       AVG(rating) AS average_rating,
       COUNT(*)    AS total_ratings
     FROM Ratings WHERE tmdb_movie_id = ?`,
    [tmdb_movie_id]
  );
  res.json(rows[0]);
});

// POST /api/ratings  — submit or update a rating
router.post('/', auth, async (req, res) => {
  const { tmdb_movie_id, movie_title, rating } = req.body;
  if (!tmdb_movie_id || !movie_title || !rating)
    return res.status(400).json({ error: 'tmdb_movie_id, movie_title, and rating are required' });
  if (rating < 1 || rating > 10)
    return res.status(400).json({ error: 'Rating must be between 1 and 10' });

  try {
    // INSERT or UPDATE if user already rated this movie
    await db.execute(
      `INSERT INTO Ratings (user_id, tmdb_movie_id, movie_title, rating)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), rated_at = CURRENT_TIMESTAMP`,
      [req.user.user_id, tmdb_movie_id, movie_title, rating]
    );
    res.status(201).json({ message: 'Rating saved' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/ratings/:tmdb_movie_id  — remove a rating
router.delete('/:tmdb_movie_id', auth, async (req, res) => {
  await db.execute(
    'DELETE FROM Ratings WHERE user_id = ? AND tmdb_movie_id = ?',
    [req.user.user_id, req.params.tmdb_movie_id]
  );
  res.json({ message: 'Rating removed' });
});

module.exports = router;