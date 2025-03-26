
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// MySQL connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dog_boarding'
});

app.use(express.static('.'));

app.get('/api/maps-key', (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY || '' });
});

app.get('/api/businesses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM businesses');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
