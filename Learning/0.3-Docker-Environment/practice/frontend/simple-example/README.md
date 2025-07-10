# Simple Docker HTML Server

This is the **simplest possible** way to serve an `index.html` file using Docker.

## Quick Start

```bash
# 1. Build the Docker image
docker build -t simple-html-server .

# 2. Run the container
docker run -p 8080:80 simple-html-server

# 3. Open your browser
# Go to: http://localhost:8080
```

## What's Happening?

1. **Dockerfile**: Uses nginx:alpine base image
2. **Copy Files**: Copies your HTML file into nginx's web root
3. **Serve**: nginx serves the file on port 80
4. **Access**: Port mapping makes it available on your host

## File Structure
```
simple-example/
├── Dockerfile       # Container definition  
├── index.html       # Your HTML file
└── README.md        # This file
```

## The Dockerfile Explained
```dockerfile
FROM nginx:alpine                           # Use nginx web server
COPY index.html /usr/share/nginx/html/     # Copy HTML to web root
EXPOSE 80                                  # Expose port 80
CMD ["nginx", "-g", "daemon off;"]        # Start nginx
```

## Customization

### Add CSS/JS Files
Just put them in the same directory and they'll be copied:
```dockerfile
COPY *.css /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
```

### Different Port
```bash
# Run on different port
docker run -p 3000:80 simple-html-server
# Access at: http://localhost:3000
```

### Custom nginx Config
```dockerfile
COPY nginx.conf /etc/nginx/nginx.conf
```

## One-Liner Alternatives

### Python HTTP Server
```bash
# No Docker needed - just Python
python -m http.server 8080
```

### Node.js serve
```bash
# Install serve globally
npm install -g serve
serve . -p 8080
```

This is perfect for:
- 🎯 Learning Docker basics
- 🚀 Quick prototypes  
- 📱 Static websites
- 🧪 Testing HTML/CSS/JS 