const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const app = express();

const PORT = process.env.PORT || 3000;
const MESSAGE = process.env.MESSAGE || "Hello World!";
const DATA_DIR = '/app/data';

// Database connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'myapp',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send(MESSAGE);
});

app.get('/env', (req, res) => {
  res.json(process.env);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Database endpoints
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File operations (from previous exercise)
app.post('/write', async (req, res) => {
  try {
    const { content } = req.body;
    const filePath = path.join(DATA_DIR, 'data.txt');
    
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, content);
    
    res.json({ message: 'Data written successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/read', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'data.txt');
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});