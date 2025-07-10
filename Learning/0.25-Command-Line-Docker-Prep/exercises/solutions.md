# 🔑 Exercise Solutions & Answer Key

This guide provides solutions to all exercises in the Command Line Learning module. Use this to check your work or get hints when stuck.

---

## Exercise 1: File System Navigation Solutions

### Setup:
```bash
# Create the entire structure with one command
mkdir -p practice/{frontend/{src/{components,pages},public},backend/{routes,models},logs}
touch practice/logs/{app.log,error.log}
```

### Task Solutions:

**1. Create the entire structure with one command**
```bash
mkdir -p practice/{frontend/{src/{components,pages},public},backend/{routes,models},logs}
```

**2. Navigate to each directory using different methods**
```bash
# Method 1: Relative paths
cd practice
cd frontend/src/components
cd ../../../backend/routes
cd ../../..

# Method 2: Absolute paths (adjust to your current location)
cd /path/to/your/practice/frontend/src/pages
cd /path/to/your/practice/logs

# Method 3: Using cd shortcuts
cd ~  # Home directory
cd -  # Previous directory
```

**3. List contents with various options**
```bash
ls -la                    # Detailed list with hidden files
ls -lah                   # Human readable sizes
ls -lt                    # Sort by modification time
ls -lS                    # Sort by file size
ls -R                     # Recursive listing
tree                      # Tree view (if available)
```

**4. Find all directories containing "src"**
```bash
find . -type d -name "*src*"
find . -type d -path "*src*"
# Alternative using ls and grep
ls -la */*/src 2>/dev/null || echo "No src directories at that level"
```

---

## Exercise 2: Process & System Monitoring Solutions

**1. Start a long-running process**
```bash
# Start in background
ping google.com > /dev/null &
# Or start in foreground, then Ctrl+Z and 'bg'
```

**2. Find its process ID**
```bash
# Method 1: Using ps and grep
ps aux | grep ping

# Method 2: Using pgrep
pgrep -f "ping google.com"

# Method 3: Check background jobs
jobs -l
```

**3. Monitor system resources while it runs**
```bash
# Real-time monitoring
top
htop  # If available

# One-time checks
ps aux | head -10
free -h
df -h
```

**4. Kill the process**
```bash
# If you know the PID (replace 1234 with actual PID)
kill 1234

# Kill by name
killall ping

# Kill using job number
kill %1

# Force kill if needed
kill -9 1234
```

**5. Check disk usage of your home directory**
```bash
du -sh ~
du -sh ~/Documents
du -h --max-depth=1 ~
```

**6. Monitor memory usage**
```bash
free -h
cat /proc/meminfo | head -5
top -o %MEM  # Sort by memory usage
```

---

## Exercise 3: Log Analysis Practice Solutions

**Sample log content setup (already provided in README):**
```bash
cat > app.log << 'EOF'
2024-01-15 10:30:15 INFO  Application started
2024-01-15 10:30:16 DEBUG Connecting to database
2024-01-15 10:30:17 INFO  Database connected successfully
2024-01-15 10:31:22 ERROR Failed to process user request
2024-01-15 10:31:23 WARN  Retrying operation
2024-01-15 10:31:24 INFO  Operation completed successfully
2024-01-15 10:32:10 ERROR Database connection lost
2024-01-15 10:32:11 INFO  Attempting database reconnection
2024-01-15 10:32:12 INFO  Database reconnected
EOF
```

### Task Solutions:

**1. Find all ERROR entries**
```bash
grep ERROR app.log
grep "ERROR" app.log
# Case insensitive
grep -i error app.log
```

**2. Count the number of each log level**
```bash
# Count all log levels
grep -c INFO app.log
grep -c ERROR app.log
grep -c WARN app.log
grep -c DEBUG app.log

# One-liner to count all
for level in INFO ERROR WARN DEBUG; do
  echo "$level: $(grep -c $level app.log)"
done

# Using awk
awk '{print $3}' app.log | sort | uniq -c
```

**3. Extract only timestamps and log levels**
```bash
# Using awk
awk '{print $1, $2, $3}' app.log

# Using cut
cut -d' ' -f1-3 app.log

# More precise with specific fields
awk '{print $1 " " $2 " " $3}' app.log
```

**4. Find entries from the last minute (simulated)**
```bash
# Since these are sample logs, simulate with grep
grep "10:32:" app.log  # Last minute in sample

# Real scenario with today's date
grep "$(date '+%Y-%m-%d')" app.log
```

**5. Follow the log file in real-time**
```bash
# In one terminal, follow the log
tail -f app.log

# In another terminal, append to the log to see real-time
echo "$(date '+%Y-%m-%d %H:%M:%S') INFO  New log entry" >> app.log
```

---

## Exercise 4: Network Diagnostics Solutions

**1. Check if port 80 is open on your system**
```bash
# Check listening ports
netstat -tulpn | grep :80
ss -tulpn | grep :80

# Check if something is using port 80
lsof -i :80

# Test if port is accessible
telnet localhost 80
nc -zv localhost 80  # If netcat is available
```

**2. Test connectivity to google.com**
```bash
ping -c 4 google.com
curl -I http://google.com
wget --spider google.com
```

**3. Find what process is using port 22 (SSH)**
```bash
lsof -i :22
netstat -tulpn | grep :22
ss -tulpn | grep :22
```

**4. Make a HTTP request to httpbin.org/json**
```bash
curl http://httpbin.org/json
curl -s http://httpbin.org/json | head -5
wget -q -O - http://httpbin.org/json
```

**5. Look up DNS information for github.com**
```bash
nslookup github.com
dig github.com
dig +short github.com
host github.com
```

---

## Exercise 5: Docker-Specific Skills Solutions

**1. Create a directory structure for a Docker project**
```bash
mkdir -p docker-project/{src,config,scripts,logs}
cd docker-project
mkdir -p {frontend,backend,database}/{src,config}
```

**2. Create a `.dockerignore` file**
```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.DS_Store
*.log
coverage/
.nyc_output
EOF
```

**3. Practice viewing logs that would come from containers**
```bash
# Simulate container logs
echo "Container starting..." > container.log
echo "$(date) Application ready" >> container.log
echo "$(date) Processing request" >> container.log

# View logs like Docker
tail -f container.log
tail -n 20 container.log
grep "$(date '+%Y-%m-%d')" container.log
```

**4. Set up environment variables for database connection**
```bash
# Create .env file
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=secret123
NODE_ENV=development
EOF

# Load and test
source .env
echo $DB_HOST
env | grep DB_
```

**5. Practice file permission commands for Docker volumes**
```bash
# Create volume directories
mkdir -p volumes/{data,logs,config}

# Set appropriate permissions
chmod 755 volumes/
chmod 644 volumes/config/*
chmod 755 volumes/data/
chmod 666 volumes/logs/

# View permissions
ls -la volumes/
ls -la volumes/*/
```

---

## Exercise 6: Command Combinations Solutions

**1. Find all `.js` files and count them**
```bash
find . -name "*.js" | wc -l
ls -la **/*.js | wc -l  # If bash globstar is enabled
```

**2. Get the 5 largest files in your directory**
```bash
du -ah . | sort -rh | head -5
ls -laS | head -6  # +1 for header
find . -type f -exec du -h {} + | sort -rh | head -5
```

**3. Search for "function" in all `.js` files and count occurrences**
```bash
grep -r "function" . --include="*.js" | wc -l
find . -name "*.js" -exec grep -l "function" {} \; | wc -l
```

**4. Get unique file extensions in a directory**
```bash
find . -type f | sed 's/.*\.//' | sort | uniq
ls -la | awk -F. '{print $NF}' | sort | uniq
```

**5. Monitor processes and filter for specific applications**
```bash
ps aux | grep -E "(node|python|docker)"
top -c | grep node
watch "ps aux | grep node"
```

---

## Bonus: Advanced Command Combinations

### Complex Log Analysis
```bash
# Most common error messages
grep ERROR app.log | awk '{for(i=4;i<=NF;i++) printf "%s ", $i; print ""}' | sort | uniq -c | sort -rn

# Timeline of events
awk '{print $1 " " $2 " -> " $3}' app.log | sort

# Errors by hour
grep ERROR app.log | awk '{print substr($2,1,2)}' | sort | uniq -c
```

### System Monitoring One-liners
```bash
# Top 10 processes by memory
ps aux --sort=-%mem | head -10

# Disk usage by directory
du -h --max-depth=1 . | sort -hr

# Network connections summary
netstat -an | awk '{print $6}' | sort | uniq -c | sort -rn
```

### File Management Combinations
```bash
# Find and delete empty files
find . -type f -empty -delete

# Find large files (over 100MB)
find . -type f -size +100M -exec ls -lh {} \;

# Backup files with timestamp
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz important-files/
```

---

## 🎯 Verification Checklist

After completing all exercises, you should be able to:

### File Operations
- [ ] Navigate any directory structure quickly
- [ ] Find files using multiple methods
- [ ] Understand and modify permissions
- [ ] View file contents efficiently

### Process Management
- [ ] Monitor system resources
- [ ] Find and kill processes
- [ ] Run commands in background
- [ ] Debug running applications

### Text Processing
- [ ] Search and filter log files
- [ ] Extract specific data from files
- [ ] Combine multiple commands with pipes
- [ ] Analyze patterns in text

### Network & System
- [ ] Test network connectivity
- [ ] Check port usage
- [ ] Monitor system performance
- [ ] Troubleshoot basic issues

**🎉 Congratulations! You've mastered essential command line skills for Docker development!**

---

## 🚀 Ready for Next Steps

With these command line skills mastered, you're now prepared for:
- **Docker container management**
- **Log analysis in containerized environments**
- **System debugging and monitoring**
- **Efficient development workflows**

**Next up: Learning/0.3-Docker-Environment/** 🐳 