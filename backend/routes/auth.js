const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/database');
const router   = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await db.execute(
      'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    const token = jwt.sign(
      { user_id: result.insertId, username },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, username, user_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Username or email already taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign(
    { user_id: user.user_id, username: user.username },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
  res.json({ token, username: user.username, user_id: user.user_id });
});

module.exports = router;
