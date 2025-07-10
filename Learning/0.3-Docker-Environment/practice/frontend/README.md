# Frontend Docker Examples

This directory contains multiple Docker configurations for serving static HTML files with nginx.

## Quick Start ✅

**Option 1: Docker Compose (Recommended)**
```bash
# Build and run with docker compose
docker compose up --build

# Access your app at http://localhost:80
```

**Option 2: Docker Run**
```bash
# Build the image
docker build -f Dockerfile.simple -t my-frontend .

# Run the container
docker run -p 80:8080 my-frontend

# Access your app at http://localhost:80
```

## Available Configurations

### 1. `Dockerfile.simple` - Easiest to use ⭐
- Runs nginx as root (perfect for development)
- Uses standalone nginx config (no backend dependencies)
- Always works, no permission issues
- **Best for learning Docker basics**

### 2. `Dockerfile` - Production-ready
- Runs nginx as non-root user for security
- Creates proper permissions for nginx cache directories
- More secure but slightly more complex

### 3. `Dockerfile.compose` - For full-stack apps
- Designed to work with backend services
- Includes proxy configuration for API calls
- Use with `docker-compose-fullstack.yml` when you have a backend

## Docker Compose Options

### Simple Frontend Only
```bash
# Uses docker-compose.yml - just serves HTML
docker compose up --build
```

### Full Stack (Future)
```bash
# Uses docker-compose-fullstack.yml - includes backend/database
docker compose -f docker-compose-fullstack.yml up --build
```

## Troubleshooting

### ❌ "host not found in upstream backend"
**Solution**: Use `docker-compose.yml` (not `docker-compose-fullstack.yml`) for frontend-only setup.

### ❌ "Permission denied" errors
**Solution**: Use `Dockerfile.simple` which runs as root and avoids permission issues.

### ❌ "version is obsolete" warning
**Solution**: Ignore this warning - it's harmless. Modern docker-compose doesn't need a version field.

## What Each File Does

- `index.html` - Your main webpage
- `styles.css` - Styling for the webpage  
- `app.js` - JavaScript functionality (will fail API calls without backend)
- `nginx-standalone.conf` - Nginx config without backend proxy
- `nginx.conf` - Nginx config with backend proxy (for full-stack)
- `docker-compose.yml` - Frontend-only setup ✅
- `docker-compose-fullstack.yml` - Full-stack setup (requires backend)

## Testing Commands

Run all tests:
```bash
./test-all.sh
```

Test individual setups:
```bash
# Test simple Dockerfile
docker build -f Dockerfile.simple -t test-simple . && docker run -d -p 80:8080 test-simple

# Test docker compose
docker compose up -d

# Test production Dockerfile  
docker build -f Dockerfile -t test-prod . && docker run -d -p 80:8080 test-prod
```

## Files in This Directory

```
Learning/0.3-Docker-Environment/practice/frontend/
├── index.html                    # Main webpage
├── styles.css                    # CSS styling  
├── app.js                       # JavaScript code
├── nginx-standalone.conf        # Nginx config (no backend)
├── nginx.conf                   # Nginx config (with backend proxy)
├── Dockerfile                   # Production setup (non-root user)
├── Dockerfile.simple            # Development setup (root user) ⭐
├── Dockerfile.compose           # Full-stack setup
├── docker-compose.yml           # Frontend-only compose ✅
├── docker-compose-fullstack.yml # Full-stack compose
├── test-all.sh                  # Test all configurations
└── README.md                    # This file
```

## Next Steps

1. **Start with docker compose**: `docker compose up --build`
2. **View your page**: Open http://localhost:80
3. **Experiment**: Try modifying `index.html` and rebuilding
4. **Learn more**: Check out the parent directory for backend examples

---

💡 **Tip**: The `docker compose` command (without hyphen) is the modern syntax. The old `docker-compose` command may not be available on newer Docker installations. 