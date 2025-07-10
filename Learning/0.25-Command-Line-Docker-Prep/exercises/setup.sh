#!/bin/bash

# 🚀 Command Line Practice Setup Script
# This script creates the practice environment for command line exercises

echo "🏗️  Setting up Command Line Practice Environment..."

# Create the main practice directory structure
mkdir -p practice/{frontend/{src/{components,pages},public},backend/{routes,models},logs}

# Create sample files
echo "Setting up practice files..."

# Frontend files
cat > practice/frontend/src/components/Header.js << 'EOF'
import React from 'react';

const Header = () => {
  return (
    <header>
      <h1>My App</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
};

export default Header;
EOF

cat > practice/frontend/src/pages/Home.js << 'EOF'
import React from 'react';

const Home = () => {
  return (
    <div>
      <h2>Welcome to Home Page</h2>
      <p>This is the home page content.</p>
    </div>
  );
};

export default Home;
EOF

cat > practice/frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Practice App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOF

# Backend files
cat > practice/backend/routes/users.js << 'EOF'
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
EOF

cat > practice/backend/models/User.js << 'EOF'
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  // TODO: Add validation methods
  validate() {
    return this.name && this.email;
  }
}

module.exports = User;
EOF

# Log files with sample data
cat > practice/logs/app.log << 'EOF'
2024-01-15 10:30:15 INFO  Application started on port 3000
2024-01-15 10:30:16 DEBUG Connecting to database mongodb://localhost:27017
2024-01-15 10:30:17 INFO  Database connected successfully
2024-01-15 10:31:22 ERROR Failed to process user request: Invalid email format
2024-01-15 10:31:23 WARN  Retrying user creation operation
2024-01-15 10:31:24 INFO  User creation completed successfully
2024-01-15 10:32:10 ERROR Database connection lost: Connection timeout
2024-01-15 10:32:11 INFO  Attempting database reconnection
2024-01-15 10:32:12 INFO  Database reconnected successfully
2024-01-15 10:33:45 DEBUG Processing GET /api/users request
2024-01-15 10:33:46 INFO  Returned 5 users to client
2024-01-15 10:34:12 ERROR Authentication failed for user johndoe@example.com
2024-01-15 10:34:13 WARN  Multiple failed login attempts detected
2024-01-15 10:35:22 INFO  Background job started: email notifications
2024-01-15 10:35:23 DEBUG Sending 12 email notifications
2024-01-15 10:35:25 INFO  All email notifications sent successfully
EOF

cat > practice/logs/error.log << 'EOF'
[2024-01-15 10:31:22] ERROR: ValidationError: Invalid email format for user registration
    at UserValidator.validate (/app/validators/user.js:23)
    at UserController.create (/app/controllers/user.js:45)
    at /app/routes/users.js:12

[2024-01-15 10:32:10] ERROR: DatabaseConnectionError: Connection timeout after 5000ms
    at Database.connect (/app/lib/database.js:67)
    at Server.start (/app/server.js:89)

[2024-01-15 10:34:12] ERROR: AuthenticationError: Invalid credentials for johndoe@example.com
    at AuthService.authenticate (/app/services/auth.js:34)
    at LoginController.login (/app/controllers/auth.js:18)
EOF

# Create additional sample files for practice
echo "Creating additional sample files..."

# Package.json files
cat > practice/frontend/package.json << 'EOF'
{
  "name": "frontend-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
EOF

cat > practice/backend/package.json << 'EOF'
{
  "name": "backend-api",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^6.0.0",
    "bcrypt": "^5.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
EOF

# Create some config files
cat > practice/.env.example << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/myapp
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
EOF

cat > practice/backend/.gitignore << 'EOF'
node_modules/
*.log
.env
.env.local
.DS_Store
dist/
build/
*.tmp
EOF

# Create a Dockerfile for practice
cat > practice/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Create dockerignore
cat > practice/.dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.cache
EOF

echo "✅ Practice environment created successfully!"
echo ""
echo "📁 Directory structure created:"
echo "   practice/"
echo "   ├── frontend/ (React components and pages)"
echo "   ├── backend/ (Node.js routes and models)"
echo "   ├── logs/ (Sample log files for analysis)"
echo "   └── Various config files (.env.example, Dockerfile, etc.)"
echo ""
echo "🎯 Ready to start exercises! Navigate to the practice directory:"
echo "   cd practice"
echo ""
echo "💡 Tip: Try 'ls -la' to see all the files that were created!" 