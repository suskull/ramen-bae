# 🚀 Command Line Quick Reference for Docker Development

## 📁 File Operations
```bash
# Navigation
pwd                     # Current directory
ls -la                  # List all files with details
ls -lah                 # Human readable sizes
cd path/to/dir          # Change directory
cd ..                   # Go up one level
cd ~                    # Home directory
cd -                    # Previous directory

# File management
touch file.txt          # Create empty file
mkdir -p path/to/dir    # Create directory structure
cp file.txt backup.txt  # Copy file
cp -r dir/ backup/      # Copy directory
mv old.txt new.txt      # Move/rename
rm file.txt             # Delete file
rm -rf directory/       # Delete directory

# Find files
find . -name "*.js"     # Find by name pattern
find . -type d          # Find directories only
find . -type f -size +100M  # Files larger than 100MB
```

## 👁️ Viewing Files
```bash
cat file.txt            # Show entire file
less file.txt           # Page through file (q to quit)
head -n 10 file.txt     # First 10 lines
tail -n 10 file.txt     # Last 10 lines
tail -f logfile.txt     # Follow file changes
wc -l file.txt          # Count lines
```

## 🔍 Text Search & Processing
```bash
# Search
grep "pattern" file.txt         # Search in file
grep -r "pattern" directory/    # Recursive search
grep -i "pattern" file.txt      # Case insensitive
grep -n "pattern" file.txt      # Show line numbers
grep -c "pattern" file.txt      # Count matches

# Process text
awk '{print $1}' file.txt       # Print first column
sed 's/old/new/g' file.txt      # Replace text
sort file.txt                   # Sort lines
uniq file.txt                   # Remove duplicates
cut -d',' -f2 data.csv         # Extract CSV column
```

## 📊 Process Management
```bash
# View processes
ps aux                  # All processes
ps aux | grep node      # Find specific process
pgrep -f "node app"     # Find by command
top                     # Real-time monitor
htop                    # Better monitor (if available)

# Control processes
kill 1234               # Kill by PID
killall node            # Kill by name
command &               # Run in background
jobs                    # List background jobs
fg %1                   # Bring to foreground
nohup command &         # Run detached
```

## 💾 System Monitoring
```bash
# Memory & disk
free -h                 # Memory usage
df -h                   # Disk space
du -sh directory/       # Directory size
du -h --max-depth=1     # Size of subdirectories

# System info
uname -a                # System information
uptime                  # System uptime
lscpu                   # CPU information
```

## 🌐 Network Diagnostics
```bash
# Connectivity
ping google.com         # Test connectivity
curl http://localhost:3000      # HTTP request
wget http://example.com/file    # Download file

# Ports & services
netstat -tulpn          # Listening ports
ss -tulpn               # Modern netstat
lsof -i :3000          # What's using port 3000
telnet localhost 5432   # Test port connection

# DNS
nslookup google.com     # DNS lookup
dig google.com          # Detailed DNS info
```

## 🔧 Environment & Config
```bash
# Environment variables
env                     # Show all variables
echo $PATH              # Show specific variable
export VAR="value"      # Set variable
source .env             # Load from file

# File permissions
ls -l                   # View permissions
chmod 755 file          # Set permissions
chmod +x script.sh      # Make executable
chown user:group file   # Change ownership
```

## 🔗 Command Combinations (Pipes)
```bash
# Common patterns
ps aux | grep docker                    # Find Docker processes
df -h | grep -v tmpfs                   # Disk usage without temp
cat log.txt | grep ERROR | wc -l       # Count errors
find . -name "*.js" | wc -l             # Count JS files
tail -f app.log | grep ERROR           # Follow errors only
du -h | sort -hr | head -10             # 10 largest directories
```

## 🐳 Docker-Specific Commands
```bash
# File operations for Docker
find . -name "Dockerfile"               # Find Dockerfiles
tail -f /var/log/docker.log            # Docker daemon logs
grep -r "FROM" . --include="Dockerfile" # Find base images

# System for Docker
ps aux | grep docker                    # Docker processes
df -h /var/lib/docker                  # Docker disk usage
netstat -tulpn | grep :2375            # Docker daemon port

# Environment for containers
env | grep DOCKER                      # Docker environment
cat .env | grep -E "(DB_|API_)"        # Database/API config
```

## 📝 Log Analysis Patterns
```bash
# Error analysis
grep ERROR app.log | tail -20          # Recent errors
grep ERROR app.log | awk '{print $1, $2}' | sort | uniq -c  # Error frequency
tail -f app.log | grep -E "(ERROR|WARN)"  # Follow errors/warnings

# Performance analysis
grep "response_time" app.log | awk '{print $5}' | sort -n  # Response times
grep "$(date '+%Y-%m-%d')" app.log     # Today's logs
awk '/ERROR/ {print $1, $2, $NF}' app.log  # Error timestamps & messages
```

## ⚡ Productivity Tips
```bash
# History
history                 # Command history
!!                      # Repeat last command
!grep                   # Repeat last grep command
Ctrl+R                  # Search command history

# Navigation shortcuts
Alt+.                   # Insert last argument of previous command
Ctrl+A                  # Beginning of line
Ctrl+E                  # End of line
Ctrl+U                  # Clear line
Ctrl+C                  # Cancel command
Ctrl+Z                  # Suspend process (use 'fg' to resume)

# Multiple commands
command1 && command2    # Run command2 if command1 succeeds
command1 || command2    # Run command2 if command1 fails
command1; command2      # Run both regardless
```

## 🚨 Emergency Commands
```bash
# System issues
sudo systemctl restart docker          # Restart Docker
sudo kill -9 $(pgrep -f stuck_process) # Force kill stuck process
sudo lsof +D /path/                    # What's using directory
sudo fuser -k 3000/tcp                 # Kill process using port

# Disk space
sudo du -h / | grep '[0-9\.]\+G'       # Find large directories
sudo find /var/log -name "*.log" -mtime +7 -delete  # Clean old logs
sudo docker system prune -a            # Clean Docker resources
```

---

## 📋 Most Common Docker Development Workflow
```bash
# 1. Navigate to project
cd ~/projects/my-app && ls -la

# 2. Check what's running
ps aux | grep -E "(node|docker)" && netstat -tulpn | grep :3000

# 3. Monitor logs
tail -f logs/app.log | grep -E "(ERROR|WARN|INFO)"

# 4. Check resources
free -h && df -h

# 5. Find issues
grep ERROR logs/* | tail -10

# 6. Test connectivity
curl -I http://localhost:3000/health
```

**💡 Pro Tip**: Combine these commands into aliases in your shell config!

```bash
# Add to ~/.bashrc or ~/.zshrc
alias ll='ls -la'
alias ..='cd ..'
alias grep='grep --color=auto'
alias dps='docker ps'
alias dlog='docker logs'
``` 