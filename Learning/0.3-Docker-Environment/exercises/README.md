# 🐳 Docker Learning Exercises

## 📚 Overview
These hands-on exercises will teach you Docker fundamentals through practical experience. Complete each exercise in order, as they build upon each other.

## 🎯 Learning Path

### Exercise 1: Docker Basics & Your First Container
**Time**: 30 minutes  
**Goal**: Understand containers and run your first Docker commands

#### Tasks:
1. **Install & Verify Docker**
   ```bash
   # Check if Docker is installed
   docker --version
   docker compose version
   ```

2. **Run Your First Container**
   ```bash
   # Pull and run hello-world
   docker run hello-world
   ```

3. **Explore Docker Commands**
   ```bash
   # List all images on your system
   docker images
   
   # List all containers (running and stopped)
   docker ps -a
   
   # Remove the hello-world container
   docker rm [container-id]
   ```

4. **Interactive Container Practice**
   ```bash
   # Run an interactive Ubuntu container
   docker run -it ubuntu:latest bash
   
   # Inside the container, try these commands:
   ls /
   cat /etc/os-release
   exit
   ```

#### ✅ Verification:
- [ ] Can explain the difference between an image and container
- [ ] Successfully ran and removed containers
- [ ] Understand basic Docker commands


---

### Exercise 2: Build Your First Custom Image
**Time**: 45 minutes  
**Goal**: Create a custom Docker image using a Dockerfile

#### Tasks:
1. **Create a Simple Node.js App**
   - Create `package.json` with express dependency
   - Create `app.js` with a simple "Hello World" server
   - Test it runs locally with `npm install && npm start`

2. **Write Your First Dockerfile**
   - Start with `FROM node:18-alpine`
   - Set a working directory
   - Copy and install dependencies
   - Copy your app code
   - Expose the port
   - Define the start command

3. **Build and Run Your Image**
   ```bash
   # Build your image
   docker build -t my-first-app .
   
   # Run your container
   docker run -p 3000:3000 my-first-app
   
   # Test it works
   curl http://localhost:3000
   ```

4. **Experiment with Layers**
   - Modify your app.js
   - Rebuild and notice which layers are cached
   - Try changing the order of COPY commands and see the difference

#### ✅ Verification:
- [ ] Built a working Docker image
- [ ] Container serves your app on localhost
- [ ] Understand Docker layer caching

---

### Exercise 3: Environment Variables & Configuration
**Time**: 30 minutes  
**Goal**: Learn to configure containers with environment variables

#### Tasks:
1. **Modify Your App**
   - Add environment variable support (PORT, MESSAGE)
   - Make your app respond with custom messages

2. **Run with Different Configurations**
   ```bash
   # Run with custom port and message
   docker run -p 8080:8080 -e PORT=8080 -e MESSAGE="Custom message" my-first-app
   ```

3. **Create a .env File**
   - Create `.env` with your variables
   - Use `docker run --env-file .env` to load them

4. **Environment Debugging**
   - Add an `/env` endpoint to show environment variables
   - Test different configurations

#### ✅ Verification:
- [ ] App responds to environment variables
- [ ] Can run container with different configurations
- [ ] Understand environment variable precedence

---

### Exercise 4: Data Persistence with Volumes
**Time**: 45 minutes  
**Goal**: Learn to persist data between container restarts

#### Tasks:
1. **Add File Writing to Your App**
   
   **Step 1:** Modify your `app.js` to include file operations:
   ```js
   const express = require('express');
   const fs = require('fs').promises;
   const path = require('path');
   const app = express();

   const PORT = process.env.PORT || 3000;
   const MESSAGE = process.env.MESSAGE || "Hello World!";
   const DATA_DIR = '/app/data';

   app.use(express.json());

   app.get('/', (req, res) => {
     res.send(MESSAGE);
   });

   app.get('/env', (req, res) => {
     res.json(process.env);
   });

   // Add file writing endpoint
   app.post('/write', async (req, res) => {
     try {
       const { content } = req.body;
       const filePath = path.join(DATA_DIR, 'data.txt');
       
       // Ensure directory exists
       await fs.mkdir(DATA_DIR, { recursive: true });
       await fs.writeFile(filePath, content);
       
       res.json({ message: 'Data written successfully' });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   // Add file reading endpoint
   app.get('/read', async (req, res) => {
     try {
       const filePath = path.join(DATA_DIR, 'data.txt');
       const content = await fs.readFile(filePath, 'utf8');
       res.json({ content });
     } catch (error) {
       res.status(404).json({ error: 'File not found or error reading file' });
     }
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Test Without Volumes**
   
   **Step 1:** Rebuild your image:
   ```bash
   docker build -t my-first-app .
   ```
   **Explanation:** Builds a Docker image from the Dockerfile in current directory, tagging it as "my-first-app"
   
   **Syntax Breakdown:**
   - `docker build` - Command to build Docker image from Dockerfile
   - `-t my-first-app` - Tag flag: assigns name "my-first-app" to the built image
   - `.` - Build context path: current directory (where Dockerfile is located)

   **Step 2:** Run container without volumes:
   ```bash
   docker run -p 3000:3000 --name test-container my-first-app
   ```
   **Explanation:** Creates and runs a container named "test-container" from the "my-first-app" image, mapping port 3000 from host to container port 3000
   
   **Syntax Breakdown:**
   - `docker run` - Command to create and start a new container
   - `-p 3000:3000` - Port mapping flag: `host_port:container_port` (makes container port 3000 accessible on host port 3000)
   - `--name test-container` - Assigns the name "test-container" to the container for easy identification
   - `my-first-app` - The Docker image name to create the container from

   **Step 3:** In another terminal, write some data:
   ```bash
   curl -X POST http://localhost:3000/write \
     -H "Content-Type: application/json" \
     -d '{"content":"This data will be lost!"}'
   ```
   **Explanation:** Sends a POST request to the container's write endpoint with JSON data containing content to be written to a file
   
   **Syntax Breakdown:**
   - `curl` - Command-line tool for transferring data to/from servers
   - `-X POST` - HTTP method flag: specifies POST request (default is GET)
   - `http://localhost:3000/write` - The target URL: `protocol://host:port/path`
   - `-H "Content-Type: application/json"` - Header flag: tells server we're sending JSON data
   - `-d '{"content":"This data will be lost!"}'` - Data flag: the JSON payload to send in the request body

   **Step 4:** Verify data exists:
   ```bash
   curl http://localhost:3000/read
   ```
   **Explanation:** Sends a GET request to read the previously written data from the container
   
   **Syntax Breakdown:**
   - `curl` - Command-line tool for transferring data to/from servers
   - `http://localhost:3000/read` - Target URL: `protocol://host:port/path`
   - No additional flags = default GET request

   **Step 5:** Stop and remove container:
   ```bash
   docker stop test-container
   docker rm test-container
   ```
   **Explanation:** Stops the running container named "test-container", then removes the stopped container from the system (deletes the container instance)
   
   **Syntax Breakdown:**
   - `docker stop test-container` - Gracefully stops the container named "test-container"
   - `docker rm test-container` - Removes (deletes) the stopped container from system
   - `test-container` - The container name (specified earlier with `--name` flag)

   **Step 6:** Run container again and try to read:
   ```bash
   docker run -p 3000:3000 --name test-container my-first-app
   curl http://localhost:3000/read
   # You'll get an error - data is gone!
   ```

3. **Add Volume Mounting**
   
   **Step 1:** Create a named volume:
   ```bash
   docker volume create app-data
   ```
   **Explanation:** Creates a named Docker volume called "app-data" that persists data independently of containers
   
   **Syntax Breakdown:**
   - `docker volume` - Docker volume management command
   - `create` - Subcommand to create a new volume
   - `app-data` - The name to assign to the volume

   **Step 2:** Inspect the volume:
   ```bash
   docker volume inspect app-data
   ```
   **Explanation:** Shows detailed information about the "app-data" volume, including its mount point on the host system
   
   **Syntax Breakdown:**
   - `docker volume` - Docker volume management command
   - `inspect` - Subcommand to show detailed information
   - `app-data` - The volume name to inspect

   **Step 3:** Stop and remove the test container:
   ```bash
   docker stop test-container
   docker rm test-container
   ```
   **Explanation:** Stops and removes the test container to clean up before testing with volumes

   **Step 4:** Run with volume mounted:
   ```bash
   docker run -p 3000:3000 -v app-data:/app/data --name persistent-container my-first-app
   ```
   **Explanation:** Runs a container with the "app-data" volume mounted to `/app/data` inside the container, ensuring data persists
   
   **Syntax Breakdown:**
   - `docker run` - Command to create and start a new container
   - `-p 3000:3000` - Port mapping flag: `host_port:container_port` (maps host port 3000 to container port 3000)
   - `-v app-data:/app/data` - Volume mounting flag: `volume_name:container_path` (mounts named volume "app-data" to `/app/data` inside container)
   - `--name persistent-container` - Names the container "persistent-container" for easy reference
   - `my-first-app` - The Docker image name to run the container from

4. **Test Persistence**
   
   **Step 1:** Write data to the volume:
   ```bash
   curl -X POST http://localhost:3000/write \
     -H "Content-Type: application/json" \
     -d '{"content":"This data will persist!"}'
   ```

   **Step 2:** Verify data exists:
   ```bash
   curl http://localhost:3000/read
   ```

   **Step 3:** Stop container:
   ```bash
   docker stop persistent-container
   ```

   **Step 4:** Start container again:
   ```bash
   docker start persistent-container

   // THIS SHOULD REMOVE CONTAINER PERMANTLY AND RUN AGAIN WITH VOLUMES TO TEST.
   ```

   **Step 5:** Check if data persists:
   ```bash
   curl http://localhost:3000/read
   # Data should still be there!
   ```

#### ✅ Verification:
- [x] Data persists between container restarts
- [x] Understand named volumes vs bind mounts
- [x] Can list and inspect volumes

---

### Exercise 5: Multi-Container Application with Docker Compose
**Time**: 60 minutes  
**Goal**: Orchestrate multiple containers working together

#### Tasks:
1. **Add Database Support to Your App**
   
   **Step 1:** Install PostgreSQL client:
   ```bash
   npm install pg
   ```

   **Step 2:** Update your `package.json`:
   ```json
   {
     "name": "my-docker-app",
     "version": "1.0.0",
     "main": "app.js",
     "dependencies": {
       "express": "^4.18.0",
       "pg": "^8.8.0"
     },
     "scripts": {
       "start": "node app.js"
     }
   }
   ```

   **Step 3:** Update your `app.js` with database support:
   ```js
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
   ```

2. **Create docker-compose.yml**
   
   **Step 1:** Create `docker-compose.yml` in your project root:
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - PORT=3000
         - MESSAGE=Hello from Docker Compose!
         - POSTGRES_HOST=db
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=myapp
       volumes:
         - app-data:/app/data
       depends_on:
         - db
       restart: unless-stopped

     db:
       image: postgres:15-alpine
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=myapp
       volumes:
         - postgres-data:/var/lib/postgresql/data
         - ./init.sql:/docker-entrypoint-initdb.d/init.sql
       ports:
         - "5432:5432"
       restart: unless-stopped

   volumes:
     app-data:
     postgres-data:
   ```

3. **Database Initialization**
   
   **Step 1:** Create `init.sql` file:
   ```sql
   -- Initialize database tables
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) UNIQUE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Insert sample data
   INSERT INTO users (name, email) VALUES 
     ('John Doe', 'john@example.com'),
     ('Jane Smith', 'jane@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```

4. **Test Multi-Container Setup**
   
   **Step 1:** Stop any running containers:
   ```bash
   docker stop $(docker ps -q) || true
   ```
   **Explanation:** Stops all currently running containers. `docker ps -q` lists only container IDs, `|| true` prevents script failure if no containers are running
   
   **Syntax Breakdown:**
   - `docker stop` - Command to stop running containers
   - `$(docker ps -q)` - Command substitution: runs `docker ps -q` and uses its output as arguments
     - `docker ps -q` - Lists running containers with quiet output (only container IDs)
   - `|| true` - Logical OR operator: if the first command fails, run `true` (prevents script from exiting on error)

   **Step 2:** Start the multi-container setup:
   ```bash
   docker compose up -d
   ```
   **Explanation:** Starts all services defined in docker-compose.yml in detached mode (runs in background)
   
   **Syntax Breakdown:**
   - `docker compose` - Docker Compose command for multi-container applications
   - `up` - Subcommand to create and start containers
   - `-d` - Detached mode flag: runs containers in the background (doesn't block terminal)

   **Step 3:** Check running services:
   ```bash
   docker compose ps
   ```
   **Explanation:** Shows the status of all services defined in the docker-compose.yml file
   
   **Syntax Breakdown:**
   - `docker compose` - Docker Compose command for multi-container applications
   - `ps` - Process status subcommand: shows container status (like `docker ps` but for compose services)

   **Step 4:** Check logs:
   ```bash
   docker compose logs app
   docker compose logs db
   ```
   **Explanation:** Shows logs from the "app" service and "db" service respectively
   
   **Syntax Breakdown:**
   - `docker compose logs` - Shows logs from compose services
   - `app` / `db` - The service names (as defined in docker-compose.yml)

   **Step 5:** Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```
   **Explanation:** Tests the health endpoint of your application to verify it's running and can connect to the database
   
   **Syntax Breakdown:**
   - `curl` - Command-line tool for HTTP requests
   - `http://localhost:3000/health` - Target URL: `protocol://host:port/path`
   - Default GET request to the health endpoint

   **Step 6:** Test database operations:
   ```bash
   # Get existing users
   curl http://localhost:3000/users

   # Add a new user
   curl -X POST http://localhost:3000/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Alice Johnson","email":"alice@example.com"}'

   # Get users again to see the new one
   curl http://localhost:3000/users
   ```
   **Explanation:** Tests database functionality by retrieving existing users, creating a new user with POST request containing JSON data, then retrieving users again to verify the new user was added
   
   **Syntax Breakdown:**
   - `curl http://localhost:3000/users` - GET request to retrieve users list
   - `curl -X POST http://localhost:3000/users` - POST request to create new user
     - `-X POST` - HTTP method flag: specifies POST request
     - `-H "Content-Type: application/json"` - Header flag: declares JSON content type
     - `-d '{"name":"Alice Johnson","email":"alice@example.com"}'` - Data payload with user information
   - Third curl repeats the GET request to verify the new user was created

5. **Experiment with Scaling**
   
   **Step 1:** Scale your app to multiple instances:
   // THIS STEP SHOULD CONFIG LOAD BALANCER WITH NGINX ELSE CONFLICT CAUSE USE SAME INTERNAL PORT 3000
   ```bash
   docker compose up -d --scale app=3
   ```
   **Explanation:** Scales the "app" service to run 3 instances simultaneously
   
   **Syntax Breakdown:**
   - `docker compose up -d` - Start containers in detached mode
   - `--scale app=3` - Scale flag: `service_name=number_of_instances` (runs 3 instances of the "app" service)

   **Step 2:** Check the running instances:
   ```bash
   docker compose ps
   ```
   **Explanation:** Shows the status of all services to verify multiple app instances are running
   
   **Syntax Breakdown:**
   - `docker compose ps` - Lists status of all compose services and their containers
   - Shows multiple instances of the same service when scaled

   **Step 3:** Test load balancing (you'll notice only one port is exposed):
   ```bash
   curl http://localhost:3000/health
   ```
   **Explanation:** Tests the health endpoint - requests will be load-balanced across the multiple app instances
   
   **Syntax Breakdown:**
   - `curl http://localhost:3000/health` - Same health check as before
   - Requests are automatically distributed across scaled instances by Docker Compose's internal load balancer

   **Step 4:** Scale back down:
   ```bash
   docker compose up -d --scale app=1
   ```
   **Explanation:** Scales the "app" service back down to 1 instance
   
   **Syntax Breakdown:**
   - `docker compose up -d` - Start containers in detached mode
   - `--scale app=1` - Scale flag: reduces "app" service to 1 instance (removes extra containers)

#### ✅ Verification:
- [x] App connects to database in separate container
- [x] Can read/write data through your API
- [x] Database data persists between restarts
- [x] Understand container networking

---

### Exercise 6: Production Readiness & Best Practices
**Time**: 45 minutes  
**Goal**: Make your Docker setup production-ready

#### Tasks:
1. **Add Health Checks**
   
   **Step 1:** Update your `Dockerfile` to include health checks:
   ```dockerfile
   FROM node:18-alpine

   # Install curl for health checks
   RUN apk add --no-cache curl

   # Create app directory
   WORKDIR /app

   # Create non-root user
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001

   # Copy package files
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --only=production && npm cache clean --force

   # Copy app source
   COPY . .

   # Change ownership to non-root user
   RUN chown -R nextjs:nodejs /app
   USER nextjs

   # Expose port
   EXPOSE 3000

   # Add health check
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost:3000/health || exit 1

   # Start the application
   CMD ["npm", "start"]
   ```

2. **Security Improvements**
   
   **Step 1:** Create `.dockerignore` file:
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   README.md
   .env
   .nyc_output
   coverage
   .cache
   .DS_Store
   *.log
   ```

   **Step 2:** Rebuild with security improvements:
   ```bash
   docker build -t my-first-app:secure .
   ```
   **Explanation:** Builds a new image with security improvements, tagged as "my-first-app:secure"
   
   **Syntax Breakdown:**
   - `docker build` - Command to build Docker image
   - `-t my-first-app:secure` - Tag flag: `image_name:tag_name` (creates tagged version)
   - `.` - Build context: current directory containing updated Dockerfile

   **Step 3:** Test the health check:
   ```bash
   docker run -d -p 3000:3000 --name secure-app my-first-app:secure
   docker ps  # You should see health status
   ```
   **Explanation:** Runs the secure image in detached mode (-d) with port mapping, then lists containers to see health status
   
   **Syntax Breakdown:**
   - `docker run` - Create and start a new container
   - `-d` - Detached mode flag: runs container in background
   - `-p 3000:3000` - Port mapping: `host_port:container_port`
   - `--name secure-app` - Names the container "secure-app"
   - `my-first-app:secure` - Image name with tag: `image_name:tag`

   **Step 4:** Check health check status:
   ```bash
   docker inspect secure-app | grep -A 5 "Health"
   ```
   **Explanation:** Inspects the container details and shows 5 lines after any line containing "Health" to see health check status
   
   **Syntax Breakdown:**
   - `docker inspect secure-app` - Shows detailed configuration of the "secure-app" container in JSON format
   - `|` - Pipe operator: sends output from first command to second command
   - `grep -A 5 "Health"` - Search for text pattern and show context
     - `grep` - Text search command
     - `-A 5` - After context flag: shows 5 lines after each match
     - `"Health"` - The search pattern to find

3. **Multi-Stage Build**
   
   **Step 1:** Create a multi-stage `Dockerfile`:
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS builder

   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install ALL dependencies (including dev)
   RUN npm ci

   # Copy source code
   COPY . .

   # Could run tests here
   # RUN npm test

   # Production stage
   FROM node:18-alpine AS production

   # Install curl for health checks
   RUN apk add --no-cache curl

   # Create app directory
   WORKDIR /app

   # Create non-root user
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001

   # Copy package files
   COPY package*.json ./

   # Install only production dependencies
   RUN npm ci --only=production && npm cache clean --force

   # Copy app source from builder stage
   COPY --from=builder /app .

   # Change ownership to non-root user
   RUN chown -R nextjs:nodejs /app
   USER nextjs

   # Expose port
   EXPOSE 3000

   # Add health check
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost:3000/health || exit 1

   # Start the application
   CMD ["npm", "start"]
   ```

   **Step 2:** Build and compare image sizes:
   ```bash
   # Build the multi-stage image
   docker build -t my-first-app:multistage .

   # Compare image sizes
   docker images | grep my-first-app
   ```
   **Explanation:** Builds the multi-stage Dockerfile, creating an optimized production image, then lists all images filtering to show only those containing "my-first-app" for size comparison
   
   **Syntax Breakdown:**
   - `docker build -t my-first-app:multistage .` - Builds image with "multistage" tag
   - `docker images` - Lists all images on system with details (name, tag, ID, created, size)
   - `|` - Pipe operator: sends output to next command
   - `grep my-first-app` - Filters output to show only lines containing "my-first-app"

4. **Monitoring & Logging**
   
   **Step 1:** Update `docker-compose.yml` with the new image:
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       image: my-first-app:multistage
       ports:
         - "3000:3000"
       environment:
         - PORT=3000
         - MESSAGE=Hello from Docker Compose!
         - POSTGRES_HOST=db
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=myapp
       volumes:
         - app-data:/app/data
       depends_on:
         - db
       restart: unless-stopped
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"

     db:
       image: postgres:15-alpine
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=password
         - POSTGRES_DB=myapp
       volumes:
         - postgres-data:/var/lib/postgresql/data
         - ./init.sql:/docker-entrypoint-initdb.d/init.sql
       ports:
         - "5432:5432"
       restart: unless-stopped

   volumes:
     app-data:
     postgres-data:
   ```

   **Step 2:** Start the updated composition:
   ```bash
   docker compose down
   docker compose up -d
   ```
   **Explanation:** Stops and removes all containers, networks, and volumes defined in docker-compose.yml, then starts the updated composition with the new multistage image

   **Step 3:** Monitor resource usage:
   ```bash
   # Monitor all containers
   docker stats

   # Monitor specific container
   docker stats my-docker-app-app-1
   ```
   **Explanation:** Shows live resource usage statistics for all running containers (CPU, memory, network, disk I/O), then shows stats for a specific container
   
   **Syntax Breakdown:**
   - `docker stats` - Shows real-time resource usage for all running containers
   - `docker stats my-docker-app-app-1` - Shows stats for specific container
     - `my-docker-app-app-1` - Container name (auto-generated by Docker Compose: `project_service_instance`)

   **Step 4:** Follow logs in real-time:
   ```bash
   # Follow all logs
   docker compose logs -f

   # Follow specific service logs
   docker compose logs -f app
   ```
   **Explanation:** Follows logs from all services in real-time (-f flag means "follow"), then follows logs from only the "app" service
   
   **Syntax Breakdown:**
   - `docker compose logs -f` - Follow logs from all services defined in compose file
     - `-f` - Follow flag: continuously streams new log entries (like `tail -f`)
   - `docker compose logs -f app` - Follow logs from specific service
     - `app` - Service name from docker-compose.yml

#### ✅ Verification:
- [ ] Container has working health checks
- [ ] Runs as non-root user
- [ ] Smaller production image size
- [ ] Can monitor container metrics

---

### Exercise 7: Debugging & Troubleshooting
**Time**: 45 minutes  
**Goal**: Master essential Docker debugging skills by simulating real-world problems and learning systematic troubleshooting

## 🎯 **What You'll Learn**
This exercise teaches you **5 critical debugging skills** that every Docker developer needs:
- How to diagnose port mapping issues
- How to identify missing environment variables  
- How to inspect container configuration
- How to access running containers for investigation
- How to monitor container performance and resources

---

## 🔧 **Part 1: Create Broken Containers (Learning Through Failure)**

### **Issue 1: Port Mapping Problems** 🔌

**Step 1.1:** Create a container with wrong port mapping
```bash
# ❌ INTENTIONALLY BROKEN: Maps host port 8080 to container port 3000
docker run -d -p 8080:3000 --name broken-port my-first-app:multistage
```
**What this does:** Creates a container where your app runs on port 3000 inside, but you can only access it via port 8080 on your host.

**Step 1.2:** Test the problem
```bash
# ❌ This WILL FAIL - nothing listening on host port 3000
curl http://localhost:3000/health
```
**Expected output:** `curl: (7) Failed to connect to localhost port 3000: Connection refused`

**Step 1.3:** Find the solution
```bash
# ✅ This WORKS - app is actually mapped to port 8080
curl http://localhost:8080/health
```
**Expected output:** `{"status":"healthy","database":"connected","timestamp":"..."}` (may fail on database, that's OK for now)

**🔍 What you learned:** Port mapping `-p host_port:container_port` must match where you're trying to connect!

---

### **Issue 2: Missing Environment Variables** 🔧

**Step 2.1:** Clean up and create new broken container
```bash
# Stop and remove the previous container
docker stop broken-port && docker rm broken-port

# ❌ INTENTIONALLY BROKEN: No database environment variables
docker run -d -p 3000:3000 --name broken-env my-first-app:multistage
```
**What this does:** Runs the container without the database connection settings it needs.

**Step 2.2:** Test what works and what doesn't
```bash
# ✅ Basic endpoint should work
curl http://localhost:3000/
# Expected: "Hello from Docker Compose!" or similar message

# ❌ Database endpoint WILL FAIL
curl http://localhost:3000/users
```
**Expected failure output:** `{"error":"...connection to server..."}` or similar database error

**🔍 What you learned:** Apps can start successfully but fail when trying to use missing configuration!

---

## 🔍 **Part 2: Master the Debugging Tools**

### **Tool 1: `docker inspect` - Container X-Ray Vision** 👁️

**Step 3.1:** Get the complete container configuration
```bash
# See EVERYTHING about the container (WARNING: lots of output!)
docker inspect broken-env
```
**What to look for:** This JSON output contains every detail about your container.

**Step 3.2:** Focus on specific sections
```bash
# 🔍 Check environment variables
docker inspect broken-env | grep -A 20 '"Env"'

# 🔍 Check port mappings  
docker inspect broken-env | grep -A 10 '"Ports"'

# 🔍 Check volumes
docker inspect broken-env | grep -A 10 '"Mounts"'
```
**What you should see:**
- **Env section:** Limited environment variables (missing POSTGRES_* variables)
- **Ports section:** `"3000/tcp": [{"HostIp": "0.0.0.0", "HostPort": "3000"}]`
- **Mounts section:** Volume mount information

**🔍 Pro Tip:** Use `docker inspect` when container behavior doesn't match your expectations!

---

### **Tool 2: `docker exec -it` - Go Inside the Container** 🚪

**Step 4.1:** Open a shell inside the running container
```bash
# Access the container's shell (like SSH but for containers)
docker exec -it broken-env sh
```
**What happens:** You're now "inside" the container! The prompt should change to something like `/ #` or `/app $`

**Step 4.2:** Investigate from inside (run these commands inside the container)
```bash
# 🔍 Check what environment variables exist
env | grep POSTGRES
# Expected: NO OUTPUT (that's the problem!)

# 🔍 See all environment variables
env
# Look for: PORT=3000, MESSAGE=..., but missing POSTGRES_* variables

# 🔍 Check if your app is actually running
ps aux
# Look for: node app.js process running

# 🔍 Test internal connectivity (from inside the container)
wget -O- http://localhost:3000/health
# Expected: Should work because we're calling it from inside

# 🔍 Check what files exist
ls -la /app
# Expected: app.js, package.json, etc.

# Exit the container shell
exit
```
**What you learned:** You can debug inside containers just like regular servers!

---

### **Tool 3: `docker logs` - See What Your App Says** 📝

**Step 5.1:** View all logs since container started
```bash
# See everything your app has printed
docker logs broken-env
```
**What to look for:** 
- `Server running on port 3000` ✅ (app started)
- Database connection errors ❌ (missing config)

**Step 5.2:** Follow logs in real-time
```bash
# Watch logs as they happen (like tail -f)
docker logs -f broken-env
```
**What to do:** 
1. Leave this running in one terminal
2. In another terminal, run `curl http://localhost:3000/users`
3. Watch the logs show the database error in real-time
4. Press `Ctrl+C` to stop following

**Step 5.3:** Get logs with timestamps
```bash
# Same logs but with exact timestamps
docker logs -t broken-env
```
**🔍 Pro Tip:** Always check logs first when something doesn't work!

---

### **Tool 4: `docker stats` - Performance Monitor** 📊

**Step 6.1:** Check resource usage
```bash
# See real-time CPU, memory, network usage (like top/htop)
docker stats broken-env
```
**What you'll see:**
- **CPU %:** How much CPU the container is using
- **MEM USAGE/LIMIT:** How much RAM it's using  
- **NET I/O:** Network traffic in/out
- **BLOCK I/O:** Disk read/write

Press `Ctrl+C` to stop.

**Step 6.2:** Get stats once (for scripts)
```bash
# Get current stats without continuous updating
docker stats --no-stream broken-env
```
**🔍 Use case:** Check if container is using too much memory or CPU

---

### **Tool 5: Network Debugging** 🕸️

**Step 7.1:** Understand Docker networks
```bash
# List all networks
docker network ls
```
**What you'll see:**
- `bridge` (default network for single containers)
- `host` (container uses host networking)
- `none` (no networking)

**Step 7.2:** Inspect the default network
```bash
# See what's connected to the default bridge network
docker network inspect bridge
```
**What to look for:** In the "Containers" section, you should see your `broken-env` container with its internal IP address.

**Step 7.3:** Test connectivity from inside container
```bash
# Test internet connectivity from inside the container
docker exec broken-env wget -O- http://google.com
```
**Expected:** HTML output (proves container can reach internet)

**🔍 Pro Tip:** Network issues are common in multi-container setups!

---

## 🔧 **Part 3: Fix the Problems (Apply Your Knowledge)**

### **Fix 1: Create a Properly Configured Container**

**Step 8.1:** Stop the broken container
```bash
docker stop broken-env
```

**Step 8.2:** Create a working container with correct environment
```bash
# ✅ FIXED: Include all required environment variables
docker run -d -p 3000:3000 \
  -e POSTGRES_HOST=localhost \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=myapp \
  --name fixed-env my-first-app:multistage
```

**Step 8.3:** Test the fix
```bash
# ✅ This should work now (though database connection may still fail - that's expected without a database container)
curl http://localhost:3000/health
```

### **Fix 2: Use Your Debugging Skills on the Fixed Container**

**Step 9.1:** Inspect the fixed container
```bash
# Compare environment variables with the broken one
docker inspect fixed-env | grep -A 20 '"Env"'
```
**What's different:** You should now see all the POSTGRES_* environment variables!

**Step 9.2:** Check logs of the fixed container  
```bash
docker logs fixed-env
```
**What's different:** May still show database connection errors (since we don't have a database running), but the error messages should be different/more specific.

---

## 🏥 **Part 4: Advanced Debugging Scenarios**

### **Scenario: Performance Issues**

**Step 10.1:** Create a memory-hungry container
```bash
# Start your working Docker Compose setup for comparison
docker compose up -d

# Monitor resource usage of all containers
docker stats
```
**What to watch:** CPU and memory usage of your containers compared to system limits.

**Step 10.2:** Check disk usage
```bash
# Check Docker's disk usage
docker system df

# Get detailed breakdown
docker system df -v

# Check disk space inside a container
docker exec $(docker compose ps -q app | head -1) df -h
```

### **Scenario: Container-to-Container Communication**

**Step 11.1:** Test internal container networking
```bash
# Make sure your compose setup is running
docker compose ps

# Test if app can reach database (from inside app container)
docker compose exec app wget -O- http://db:5432 || echo "Connection test complete"
```
**What this tests:** Whether containers can communicate using Docker Compose service names.

---

## 🧹 **Part 5: Cleanup and Review**

**Step 12.1:** Clean up all debugging containers
```bash
# Stop and remove debugging containers
docker stop broken-env fixed-env 2>/dev/null || true
docker rm broken-env fixed-env 2>/dev/null || true

# Keep your compose setup running for next exercises
docker compose ps
```

**Step 12.2:** Review what you learned
```bash
# List all containers to see what's running
docker ps

# Check Docker resource usage
docker system df
```

---

## 📋 **Your Docker Debugging Cheat Sheet**

**When something goes wrong, follow this order:**

1. **Check if container is running:** `docker ps`
2. **Look at logs first:** `docker logs [container-name]`  
3. **Check configuration:** `docker inspect [container-name]`
4. **Go inside to investigate:** `docker exec -it [container-name] sh`
5. **Monitor resources:** `docker stats [container-name]`
6. **Test networking:** `docker network inspect bridge`

**Common Problems & Solutions:**
- **"Connection refused"** → Check port mapping with `docker inspect`
- **"Database connection failed"** → Check environment variables with `docker exec -it [container] env`
- **"Container keeps crashing"** → Check logs with `docker logs`
- **"App is slow"** → Check resources with `docker stats`
- **"Can't reach other containers"** → Check network with `docker network inspect`

#### ✅ Verification Checklist:
- [ ] Can identify port mapping issues using `docker inspect`
- [ ] Can access container shell using `docker exec -it`
- [ ] Can read and interpret container logs using `docker logs`
- [ ] Can monitor container resources using `docker stats`
- [ ] Can debug network connectivity issues
- [ ] Can systematically troubleshoot container problems
- [ ] Understand the difference between container and host networking
- [ ] Can clean up debugging containers properly

---

## 🎯 Exercise 8: Using the Existing Frontend Application
**Time**: 30 minutes  
**Goal**: Learn how to serve and containerize existing HTML/CSS/JS applications

### Background
In the `practice/frontend/` directory, there's already a complete web application waiting to be used. This exercise teaches you how to work with existing frontend code and serve it using different methods.

#### Tasks:

#### Part A: Explore the Existing Application (5 minutes)

**Step 1:** Navigate to the practice frontend directory:
```bash
# From the exercises directory, go to the practice frontend
cd ../practice/frontend
pwd  # Confirm you're in Learning/0.3-Docker-Environment/practice/frontend
ls -la  # You should see index.html, app.js, styles.css, etc.
```

**Step 2:** Examine the application structure:
```bash
# Look at the main HTML file
head -20 index.html

# Check what JavaScript functionality exists
grep -n "function" app.js

# See the styling
head -10 styles.css
```

#### Part B: Serve the Application Locally (10 minutes)

**Step 3:** Method 1 - Direct file access (Limited):
```bash
# Open directly in browser (macOS)
open index.html
# Or on Linux: xdg-open index.html
# Or on Windows: start index.html
```
**Note:** This method works for basic HTML but may have limitations with JavaScript fetching data.

**Step 4:** Method 2 - Simple HTTP Server (Recommended):
```bash
# Using Python (most systems have this)
python3 -m http.server 8000
# Open http://localhost:8000 in your browser

# Alternative using Node.js (if you have it)
# npx serve . -p 8000
```

**Step 5:** Test the application features:
- Open `http://localhost:8000` in your browser
- Click around the interface
- Check browser developer tools (F12) for any errors
- Stop the server with `Ctrl+C`

#### Part C: Containerize with Docker (15 minutes)

**Step 6:** Use the existing Dockerfile:
```bash
# Look at the current Dockerfile
cat Dockerfile
```

**Step 7:** Build and run the containerized frontend:
```bash
# Build the Docker image
docker build -t frontend-app .

# Run the container
docker run -d -p 8080:80 --name my-frontend frontend-app

# Test the containerized app
curl -I http://localhost:8080  # Should return HTTP 200
```

**Step 8:** Access the containerized application:
```bash
# Open in browser
open http://localhost:8080
# Or test with curl
curl http://localhost:8080
```

**Step 9:** Use Docker Compose for easier management:
```bash
# Look at the existing docker-compose.yml
cat docker-compose.yml

# Start using compose
docker compose up -d

# Check logs
docker compose logs -f

# Access the app (check docker-compose.yml for the port)
curl http://localhost:3000  # or whatever port is configured
```

#### Part D: Debug and Customize (Optional)

**Step 10:** Inspect the running container:
```bash
# See what's inside the container
docker exec -it my-frontend sh

# Inside the container, check the served files:
ls -la /usr/share/nginx/html/
cat /etc/nginx/nginx.conf
exit
```

**Step 11:** Make a simple customization:
```bash
# Edit the index.html to add your name
sed -i.backup 's/Frontend App/Your Name - Frontend App/' index.html

# Rebuild and test
docker build -t frontend-app:custom .
docker run -d -p 8081:80 --name custom-frontend frontend-app:custom
open http://localhost:8081
```

#### ✅ Verification Checklist:
- [ ] Successfully explored the existing application files
- [ ] Served the app using a local HTTP server  
- [ ] Built and ran the app in a Docker container
- [ ] Accessed the containerized app through a web browser
- [ ] Used Docker Compose to manage the application
- [ ] Understand the difference between file access and HTTP serving
- [ ] Can inspect and customize containerized applications

**🎯 Key Learnings:**
- How to work with existing frontend applications
- Different methods to serve static HTML/CSS/JS files
- The importance of HTTP servers vs direct file access
- How to containerize frontend applications with Nginx
- Using Docker Compose for frontend applications

---

## 🏆 Final Challenge: Build a Complete Application

**Time**: 90 minutes  
**Goal**: Apply everything you've learned

### Your Mission:
Build a complete containerized application with:
- **Frontend**: Simple web interface (HTML/CSS/JS)
- **Backend**: Node.js API with multiple endpoints
- **Database**: PostgreSQL with sample data
- **Cache**: Redis for session storage
- **Reverse Proxy**: Nginx to serve frontend and proxy API

### Step-by-Step Implementation:

#### Step 1: Create Frontend Service

**Create `frontend/` directory:**
```bash
mkdir frontend
cd frontend
```

**Create `frontend/Dockerfile`:**
```dockerfile
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Create `frontend/index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Full-Stack App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Docker Full-Stack Application</h1>
        
        <div class="section">
            <h2>API Health</h2>
            <button onclick="checkHealth()">Check API Health</button>
            <div id="health-status"></div>
        </div>

        <div class="section">
            <h2>Users Management</h2>
            <form onsubmit="addUser(event)">
                <input type="text" id="name" placeholder="Name" required>
                <input type="email" id="email" placeholder="Email" required>
                <button type="submit">Add User</button>
            </form>
            <button onclick="loadUsers()">Load Users</button>
            <div id="users-list"></div>
        </div>

        <div class="section">
            <h2>Cache Test</h2>
            <button onclick="testCache()">Test Redis Cache</button>
            <div id="cache-result"></div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

**Create `frontend/styles.css`:**
```css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

input, button {
    margin: 5px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background-color: #007bff;
    color: white;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

.user {
    background: #f8f9fa;
    padding: 10px;
    margin: 5px 0;
    border-radius: 4px;
}
```

**Create `frontend/app.js`:**
```javascript
const API_BASE = '/api';

async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        document.getElementById('health-status').innerHTML = 
            `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('health-status').innerHTML = 
            `<span style="color: red;">Error: ${error.message}</span>`;
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = users.map(user => 
            `<div class="user">
                <strong>${user.name}</strong> - ${user.email}
                <small>(ID: ${user.id})</small>
            </div>`
        ).join('');
    } catch (error) {
        document.getElementById('users-list').innerHTML = 
            `<span style="color: red;">Error: ${error.message}</span>`;
    }
}

async function addUser(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            loadUsers(); // Refresh the list
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function testCache() {
    try {
        const response = await fetch(`${API_BASE}/cache-test`);
        const data = await response.json();
        document.getElementById('cache-result').innerHTML = 
            `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById('cache-result').innerHTML = 
            `<span style="color: red;">Error: ${error.message}</span>`;
    }
}

// Load users on page load
window.onload = () => {
    loadUsers();
    checkHealth();
};
```

**Create `frontend/nginx.conf`:**
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        # Serve static files
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Step 2: Update Backend with Redis Support

**Go back to project root:**
```bash
cd ..
```

**Update `package.json` to include Redis:**
```json
{
  "name": "my-docker-app",
  "version": "1.0.0",
  "main": "app.js",
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.8.0",
    "redis": "^4.3.0"
  },
  "scripts": {
    "start": "node app.js"
  }
}
```

**Update `app.js` with Redis support:**
```js
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
```

#### Step 3: Create Complete Docker Compose

**Create the final `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  # Frontend - Nginx serving static files and proxying API
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Backend - Node.js API
  backend:
    build: .
    environment:
      - PORT=3000
      - MESSAGE=Hello from Full-Stack Docker App!
      - POSTGRES_HOST=database
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
      - REDIS_HOST=cache
      - REDIS_PORT=6379
    volumes:
      - app-data:/app/data
    depends_on:
      - database
      - cache
    restart: unless-stopped

  # Database - PostgreSQL
  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  # Cache - Redis
  cache:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  app-data:
  postgres-data:
```

#### Step 4: Deploy and Test

**Step 1:** Build and start all services:
```bash
docker compose down -v  # Clean slate
docker compose up -d --build
```
**Explanation:** Stops and removes all containers, networks, and volumes (-v flag removes volumes too), then starts services in detached mode, forcing a rebuild of any images that have changed

**Syntax Breakdown:**
- `docker compose down` - Stop and remove containers, networks, and default volumes
- `-v` - Volumes flag: also removes named volumes declared in compose file
- `docker compose up` - Create and start containers
- `-d` - Detached mode: run containers in background
- `--build` - Build flag: forces rebuild of images even if they exist

**Step 2:** Check all services are running:
```bash
docker compose ps
```
**Explanation:** Shows status of all services in the compose file

**Syntax Breakdown:**
- `docker compose ps` - Lists all services defined in docker-compose.yml with their status
- Shows service name, state (Up/Down), ports, and container names

**Step 3:** Test the complete application:
```bash
# Open in browser
open http://localhost

# Or test with curl
curl http://localhost/api/health
curl http://localhost/api/users
```
**Explanation:** Opens the application in the default web browser (macOS command), or tests the API endpoints through the nginx proxy

**Syntax Breakdown:**
- `open http://localhost` - macOS command to open URL in default browser
- `curl http://localhost/api/health` - Tests health endpoint through nginx proxy
  - Request: Browser → Nginx (port 80) → Backend (port 3000)
- `curl http://localhost/api/users` - Tests users endpoint through proxy
  - Nginx `/api/` location proxies to `http://backend:3000/`

**Step 4:** Monitor the full stack:
```bash
# Monitor all services
docker compose logs -f

# Monitor individual services
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f database
docker compose logs -f cache
```
**Explanation:** Follows logs from all services in real-time, then shows how to follow logs from individual services for targeted debugging

**Syntax Breakdown:**
- `docker compose logs -f` - Follow logs from all services simultaneously
  - Shows interleaved logs with service name prefixes
- `docker compose logs -f [service_name]` - Follow logs from specific service
  - `frontend` - Nginx access/error logs
  - `backend` - Node.js application logs
  - `database` - PostgreSQL logs
  - `cache` - Redis logs

### Bonus Points:

#### Add Logging Aggregation:
```yaml
# Add to docker-compose.yml
  logging:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
```

#### Container Monitoring:
```bash
# Install Docker stats monitoring
docker run -d \
  --name monitoring \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  dockersamples/visualizer
```
**Explanation:** Runs a container monitoring tool that visualizes Docker containers, mounting the Docker socket for access to container information

**Syntax Breakdown:**
- `docker run -d` - Run container in detached mode
- `\` - Line continuation character (allows command to span multiple lines)
- `--name monitoring` - Names the container "monitoring"
- `-p 8080:8080` - Port mapping: `host_port:container_port`
- `-v /var/run/docker.sock:/var/run/docker.sock` - Volume mount: `host_path:container_path`
  - `/var/run/docker.sock` - Docker socket file (allows container to communicate with Docker daemon)
- `dockersamples/visualizer` - The Docker image to run

#### Create Backup Script:
```bash
#!/bin/bash
# backup.sh
docker compose exec database pg_dump -U postgres myapp > backup_$(date +%Y%m%d_%H%M%S).sql
```
**Explanation:** Creates a database backup by running pg_dump inside the database container and saving to a timestamped file

**Syntax Breakdown:**
- `#!/bin/bash` - Shebang: tells system to use bash interpreter
- `docker compose exec` - Execute command in running service container
- `database` - The service name (from docker-compose.yml)
- `pg_dump` - PostgreSQL database dump command
- `-U postgres` - User flag: connect as "postgres" user
- `myapp` - The database name to backup
- `>` - Redirect output to file
- `backup_$(date +%Y%m%d_%H%M%S).sql` - Output filename with timestamp
  - `$(date +%Y%m%d_%H%M%S)` - Command substitution: runs date command with format

#### Blue-Green Deployment:
```bash
# Create blue-green.yml for zero-downtime deployments
# (Advanced: requires load balancer configuration)
```

---

## 📚 Additional Resources

### Helpful Commands Reference:
```bash
# Image management
docker images                    # Lists all Docker images on your system
docker rmi [image]               # Removes a specific Docker image
docker image prune               # Removes all unused Docker images to free up space

# Container management
docker ps -a                     # Lists all containers (running and stopped)
docker stop [container]          # Stops a running container
docker rm [container]            # Removes a stopped container
docker container prune           # Removes all stopped containers

# Volume management
docker volume ls                 # Lists all Docker volumes
docker volume inspect [volume]   # Shows detailed information about a specific volume
docker volume prune              # Removes all unused volumes

# Network management
docker network ls                # Lists all Docker networks
docker network inspect [network] # Shows detailed information about a specific network

# Docker Compose
docker compose up -d             # Starts compose services in detached mode
docker compose down              # Stops and removes compose services
docker compose logs -f [service] # Follows logs from a specific service
  # Syntax: docker compose logs -f service_name
docker compose exec [service] [command] # Executes a command inside a running service container
  # Syntax: docker compose exec service_name command_to_run
```

### Best Practices Checklist:
- [ ] Use specific image tags (not `latest`)
- [ ] Run as non-root user
- [ ] Use multi-stage builds
- [ ] Implement health checks
- [ ] Use `.dockerignore`
- [ ] Keep images small
- [ ] Document your Dockerfiles
- [ ] Use environment variables for configuration
- [ ] Implement proper logging
- [ ] Regular security scans

---

**Ready to start? Begin with Exercise 1 and work your way through! 🚀** 

PORT=8080
MESSAGE=Hello from Docker! 