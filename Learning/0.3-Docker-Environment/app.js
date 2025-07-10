const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('redis');
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

// Redis connection
const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();

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
    // Test database
    await pool.query('SELECT 1');
    
    // Test Redis
    await redis.ping();
    
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      cache: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// Cache test endpoint
app.get('/cache-test', async (req, res) => {
  try {
    const key = 'test-key';
    const value = `Test value at ${new Date().toISOString()}`;
    
    // Set value in cache
    await redis.setEx(key, 60, value); // Expires in 60 seconds
    
    // Get value from cache
    const cachedValue = await redis.get(key);
    
    res.json({
      original: value,
      cached: cachedValue,
      match: value === cachedValue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    
    // Clear users cache
    await redis.del('users:all');
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    // Try to get from cache first
    const cached = await redis.get('users:all');
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // If not in cache, get from database
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    
    // Cache the result for 5 minutes
    await redis.setEx('users:all', 300, JSON.stringify(result.rows));
    
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