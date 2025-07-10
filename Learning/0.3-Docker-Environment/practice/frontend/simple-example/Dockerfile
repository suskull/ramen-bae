# Simple nginx-based static file server
FROM nginx:alpine

# Copy your HTML file to nginx's default location
COPY index.html /usr/share/nginx/html/

# Optional: Copy any CSS/JS files
COPY *.css /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/

# nginx runs on port 80 by default
EXPOSE 80

# Start nginx (default command, but explicit for clarity)
CMD ["nginx", "-g", "daemon off;"] 