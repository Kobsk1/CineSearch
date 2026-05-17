const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/ratings',   require('./routes/ratings'));
app.use('/api/comments',  require('./routes/comments'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CineSearch backend running on port ${PORT}`));