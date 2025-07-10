const express = require('express');
const router = express.Router();

// GET /users
router.get('/', (req, res) => {
  res.json({ users: [] });
});

// POST /users
router.post('/', (req, res) => {
  // TODO: Implement user creation
  res.status(201).json({ message: 'User created' });
});

module.exports = router;
