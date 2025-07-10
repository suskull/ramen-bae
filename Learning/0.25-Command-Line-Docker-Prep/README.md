# 💻 Command Line Mastery for Docker Development

## 📚 Overview
Master essential command line skills that will make you efficient with Docker containers, system administration, and development workflows. This module prepares you for Docker container management and system operations.

## 🎯 Learning Objectives
By the end of this module, you'll be comfortable with:
- File and directory operations in any environment
- Process monitoring and management
- System resource monitoring
- Network diagnostics and troubleshooting
- Text processing and log analysis
- Environment variable management
- Basic system administration tasks

---

## 📂 Essential File & Directory Operations

### Navigation & Listing
```bash
# Current directory and navigation
pwd                           # Print working directory
```
**Explanation**: `pwd` = "Print Working Directory" - shows your current location in the file system

```bash
ls -la                       # List all files with details
```
**Explanation**: `ls` = "list", `-l` = long format (permissions, size, date), `-a` = all files (including hidden ones starting with .)

```bash
ls -lah                      # Human readable file sizes
```
**Explanation**: Same as above, but `-h` = human readable (shows 1.2K, 3.4M instead of bytes)

```bash
cd /path/to/directory        # Change directory
```
**Explanation**: `cd` = "change directory", followed by the path where you want to go

```bash
cd ..                        # Go up one level
```
**Explanation**: `..` represents the parent directory (one level up in the folder hierarchy)

```bash
cd ~                         # Go to home directory
```
**Explanation**: `~` is a shortcut for your home directory (/home/username on Linux, /Users/username on Mac)

```bash
cd -                         # Go to previous directory
```
**Explanation**: `-` takes you back to the previous directory you were in (like "back" button)

```bash
# Advanced listing
ls -lt                       # Sort by modification time
```
**Explanation**: `-t` sorts by time modified (newest first), combined with `-l` for detailed listing

```bash
ls -lS                       # Sort by file size
```
**Explanation**: `-S` sorts by file size (largest first), combined with `-l` for detailed listing

```bash
ls -R                        # Recursive listing
```
**Explanation**: `-R` = recursive, shows contents of all subdirectories in a tree-like format

```bash
find . -name "*.js"          # Find files by pattern
```
**Explanation**: `find` searches for files, `.` = start from current directory, `-name` = search by filename, `"*.js"` = pattern (all files ending in .js)

```bash
find . -type d -name "node*" # Find directories by pattern
```
**Explanation**: `-type d` = only directories (not files), `"node*"` = names starting with "node"

### File Operations
```bash
# Creating and copying
touch filename.txt           # Create empty file
```
**Explanation**: `touch` creates an empty file or updates the timestamp of an existing file

```bash
mkdir -p path/to/directory   # Create directory (with parents)
```
**Explanation**: `mkdir` = "make directory", `-p` = create parent directories if they don't exist (e.g., creates "path", then "to", then "directory")

```bash
cp file.txt backup.txt       # Copy file
```
**Explanation**: `cp` = "copy", syntax is `cp source destination`

```bash
cp -r folder/ backup/        # Copy directory recursively
```
**Explanation**: `-r` = recursive, needed to copy directories and all their contents

```bash
mv oldname.txt newname.txt   # Move/rename file
```
**Explanation**: `mv` = "move", can move files to different locations OR rename them (same location, different name)

```bash
# Viewing file contents
cat file.txt                 # Display entire file
```
**Explanation**: `cat` = "concatenate" (originally to join files), but commonly used to display file contents

```bash
less file.txt                # View file page by page (q to quit)
```
**Explanation**: `less` shows file contents one screen at a time. Use ↑↓ to scroll, `q` to quit, `/text` to search

```bash
head -n 10 file.txt          # First 10 lines
```
**Explanation**: `head` shows the beginning of a file, `-n 10` specifies exactly 10 lines (default is 10)

```bash
tail -n 10 file.txt          # Last 10 lines
```
**Explanation**: `tail` shows the end of a file, `-n 10` specifies exactly 10 lines

```bash
tail -f logfile.txt          # Follow file changes (great for logs!)
```
**Explanation**: `-f` = "follow", keeps reading as new lines are added (perfect for monitoring live log files)

```bash
# File information
file filename.txt            # Determine file type
```
**Explanation**: `file` analyzes the file content and tells you what type it is (text, binary, image, etc.)

```bash
wc -l file.txt              # Count lines
```
**Explanation**: `wc` = "word count", `-l` = lines only (also `-w` for words, `-c` for characters)

```bash
du -h folder/               # Directory size, human readable
```
**Explanation**: `du` = "disk usage", `-h` = human readable format (1.2M instead of 1234567 bytes)

```bash
du -sh *                    # Size of all items in current directory
```
**Explanation**: `-s` = summary (total size per item), `*` = all items in current directory

### File Permissions & Ownership
```bash
# Understanding permissions
ls -l                        # View permissions (rwxrwxrwx)
```
**Explanation**: Shows detailed file info. Permission format: `rwxrwxrwx` = (owner)(group)(others), where r=read, w=write, x=execute

```bash
chmod 755 script.sh          # Make executable
```
**Explanation**: `chmod` = "change mode". `755` = owner can read/write/execute (7), group can read/execute (5), others can read/execute (5)

**Permission Numbers**: 
- 4 = read (r)
- 2 = write (w)  
- 1 = execute (x)
- Add them: 7=rwx, 6=rw-, 5=r-x, 4=r--

```bash
chmod +x script.sh           # Add execute permission
```
**Explanation**: `+x` adds execute permission for everyone. Alternative to numeric format, easier for simple changes

```bash
chown user:group file.txt    # Change ownership (may need sudo)
```
**Explanation**: `chown` = "change owner". Format: `user:group`. Often requires `sudo` (admin privileges)

```bash
# Permission examples for Docker
chmod 600 ~/.ssh/id_rsa      # Secure SSH key
```
**Explanation**: `600` = owner read/write only (6), no access for group/others (0). Critical for SSH key security!

```bash
chmod 644 config.txt         # Read-write for owner, read for others
```
**Explanation**: `644` = owner read/write (6), group/others read-only (4). Common for config files

```bash
chmod 755 scripts/           # Directory with execute permission
```
**Explanation**: `755` for directories = owner full access (7), others can read and enter directory (5). Execute needed to enter dirs!

---

## 🔍 Process Management & System Monitoring

### Process Operations
```bash
# Viewing processes
ps aux                       # All running processes
```
**Explanation**: `ps` = "process status", `a` = all users' processes, `u` = user-oriented format, `x` = include processes without terminals

```bash
ps aux | grep node           # Find specific processes
```
**Explanation**: `|` = pipe (sends output of `ps aux` to `grep`), `grep node` = filter lines containing "node"

```bash
pgrep -f "node app.js"       # Find process by command
```
**Explanation**: `pgrep` = "process grep", `-f` = search full command line (not just process name)

```bash
top                          # Real-time process monitor
```
**Explanation**: Shows live updating list of processes, sorted by CPU usage. Press `q` to quit, `k` to kill a process

```bash
htop                         # Better process monitor (if available)
```
**Explanation**: Enhanced version of `top` with colors, mouse support, and easier navigation (may need to install)

```bash
# Process control
kill 1234                    # Kill process by PID
```
**Explanation**: `kill` sends termination signal to process ID (PID). Default signal is TERM (graceful shutdown)

```bash
killall node                 # Kill all processes by name
```
**Explanation**: `killall` kills ALL processes with the specified name. Be careful - this affects multiple processes!

```bash
nohup command &              # Run command in background
```
**Explanation**: `nohup` = "no hang up" (keeps running after you log out), `&` = run in background

```bash
jobs                         # List background jobs
```
**Explanation**: Shows jobs started in current shell session (with `&` or Ctrl+Z)

```bash
fg %1                        # Bring job to foreground
```
**Explanation**: `fg` = "foreground", `%1` = job number 1 (from `jobs` command)

```bash
bg %1                        # Send job to background
```
**Explanation**: `bg` = "background", continues a stopped job in the background

### System Resource Monitoring
```bash
# Memory and disk usage
free -h                      # Memory usage, human readable
```
**Explanation**: `free` shows RAM usage, `-h` = human readable (GB/MB instead of bytes). Shows total, used, free, shared, cached

```bash
df -h                        # Disk space usage
```
**Explanation**: `df` = "disk free", shows filesystem disk usage, `-h` = human readable format

```bash
df -h /                      # Root filesystem usage
```
**Explanation**: Shows disk usage for just the root filesystem (`/`) instead of all mounted filesystems

```bash
du -sh ~/.docker/           # Docker directory size
```
**Explanation**: Shows total size of Docker directory (where Docker stores images/containers), useful for monitoring Docker storage

```bash
# System information
uname -a                     # System information
```
**Explanation**: `uname` = "unix name", `-a` = all info (kernel name, hostname, kernel version, architecture, OS)

```bash
lscpu                        # CPU information
```
**Explanation**: `lscpu` = "list CPU", shows detailed CPU information (cores, threads, architecture, cache sizes)

```bash
lsmem                        # Memory information
```
**Explanation**: `lsmem` = "list memory", shows detailed memory layout and specifications

```bash
uptime                       # System uptime and load
```
**Explanation**: Shows how long system has been running and load averages (1min, 5min, 15min). Load > CPU cores = high load

---

## 🌐 Network Diagnostics

### Basic Network Commands
```bash
# Network connectivity
ping google.com              # Test connectivity
```
**Explanation**: `ping` sends ICMP echo requests to test if a host is reachable and measure response time

```bash
ping -c 4 localhost          # Ping 4 times then stop
```
**Explanation**: `-c 4` = count (send only 4 packets then stop), `localhost` = your own machine (127.0.0.1)

```bash
curl http://localhost:3000   # Make HTTP request
```
**Explanation**: `curl` makes HTTP requests. Very useful for testing APIs and web services

```bash
wget http://example.com/file.txt  # Download file
```
**Explanation**: `wget` downloads files from web URLs. Alternative to curl for downloading (not testing)

```bash
# Port and service checking
netstat -tulpn               # List listening ports
```
**Explanation**: `netstat` shows network connections. `-t` = TCP, `-u` = UDP, `-l` = listening, `-p` = process, `-n` = numeric (don't resolve names)

```bash
ss -tulpn                    # Modern alternative to netstat
```
**Explanation**: `ss` = "socket statistics", modern replacement for netstat with same flags. Faster and more detailed

```bash
lsof -i :3000               # What's using port 3000
```
**Explanation**: `lsof` = "list open files", `-i :3000` = network files on port 3000. Shows which process is using the port

```bash
telnet localhost 5432        # Test if port is open
```
**Explanation**: `telnet` can test if a port is open/accepting connections. Useful for testing database connections

```bash
# DNS and routing
nslookup google.com          # DNS lookup
```
**Explanation**: `nslookup` queries DNS to find IP address for domain name (or reverse lookup)

```bash
dig google.com               # Detailed DNS information
```
**Explanation**: `dig` = "domain information groper", more detailed DNS lookup tool than nslookup

```bash
route -n                     # View routing table (Linux)
```
**Explanation**: Shows how your system routes network traffic to different destinations. `-n` = numeric IPs

```bash
traceroute google.com        # Trace route to destination
```
**Explanation**: Shows the path packets take to reach destination, including all intermediate routers/hops

---

## 📝 Text Processing & Log Analysis

### Text Viewing & Searching
```bash
# Text search and processing
grep "error" logfile.txt     # Search for text in file
```
**Explanation**: `grep` = "global regular expression print", searches for "error" in logfile.txt and shows matching lines

```bash
grep -r "TODO" src/          # Search recursively in directory
```
**Explanation**: `-r` = recursive, searches for "TODO" in all files within the src/ directory and subdirectories

```bash
grep -i "error" *.log        # Case-insensitive search
```
**Explanation**: `-i` = ignore case (finds "error", "Error", "ERROR"), `*.log` = all files ending in .log

```bash
grep -n "function" app.js    # Show line numbers
```
**Explanation**: `-n` = number, shows line numbers where matches are found (helpful for debugging code)

```bash
# Advanced text processing
awk '{print $1}' access.log  # Print first column
```
**Explanation**: `awk` processes text field by field. `$1` = first field (column), `$2` = second field, etc. Default separator is space/tab

```bash
sed 's/old/new/g' file.txt   # Replace text
```
**Explanation**: `sed` = "stream editor", `s/old/new/g` = substitute "old" with "new" globally (all occurrences on each line)

```bash
sort file.txt                # Sort lines
```
**Explanation**: `sort` arranges lines in alphabetical order. Use `-n` for numeric sort, `-r` for reverse order

```bash
uniq file.txt               # Remove duplicate lines
```
**Explanation**: `uniq` removes consecutive duplicate lines (usually used after `sort` to remove ALL duplicates)

```bash
cut -d',' -f2 data.csv      # Extract CSV columns
```
**Explanation**: `cut` extracts columns, `-d','` = delimiter is comma, `-f2` = field 2 (second column)

### Log Analysis Examples
```bash
# Common log analysis patterns
tail -f /var/log/app.log | grep ERROR    # Follow errors in real-time
grep "$(date '+%Y-%m-%d')" app.log       # Today's log entries
awk '/ERROR/ {print $1, $2, $NF}' app.log  # Extract timestamp and error
cat access.log | cut -d' ' -f1 | sort | uniq -c  # Count unique IPs
```

---

## 🔧 Environment & Configuration

### Environment Variables
```bash
# Viewing and setting environment variables
env                          # Show all environment variables
```
**Explanation**: `env` displays all environment variables currently set in your shell session

```bash
echo $PATH                   # Show PATH variable
```
**Explanation**: `$PATH` contains directories where shell looks for commands. `echo` displays the variable value

```bash
echo $HOME                   # Show home directory
```
**Explanation**: `$HOME` contains path to your home directory. Use `$` prefix to access variable values

```bash
export MY_VAR="value"        # Set environment variable
```
**Explanation**: `export` creates environment variable available to child processes (like Docker containers)

```bash
unset MY_VAR                # Remove environment variable
```
**Explanation**: `unset` removes an environment variable from the current session

```bash
# Working with .env files
source .env                  # Load variables from .env file
```
**Explanation**: `source` (or `.`) executes commands from a file in current shell. Loads variables from .env file

```bash
env | grep NODE              # Show Node.js related variables
```
**Explanation**: Pipes all environment variables to `grep` to filter only those containing "NODE"

### Text Editors
```bash
# Essential editor skills
nano file.txt                # Simple editor (Ctrl+X to exit)
vi file.txt                  # Vi editor basics:
  # i = insert mode, Esc = command mode, :wq = save and quit, :q! = quit without saving

# Quick file editing
echo "content" > file.txt    # Create file with content (overwrites)
echo "more content" >> file.txt  # Append to file
```

---

## 🛠 System Administration Basics

### Package Management (varies by system)
```bash
# Ubuntu/Debian
apt update && apt upgrade    # Update system packages
apt install curl wget git    # Install packages
apt search docker           # Search for packages

# CentOS/RHEL
yum update                   # Update packages
yum install curl wget git   # Install packages

# macOS (with Homebrew)
brew update && brew upgrade  # Update Homebrew packages
brew install curl wget git  # Install packages
```

### Service Management
```bash
# Systemd (modern Linux)
systemctl status docker      # Check service status
systemctl start docker       # Start service
systemctl stop docker        # Stop service
systemctl restart docker     # Restart service
systemctl enable docker      # Enable on boot

# Service logs
journalctl -u docker         # View service logs
journalctl -f -u docker      # Follow service logs
```

---

## 🎯 Hands-On Exercises

### Exercise 1: File System Navigation (15 minutes)

**🎯 Goal**: Master directory navigation and file listing commands

**🚀 Setup**: Run the setup script first:
```bash
cd Learning/0.25-Command-Line-Docker-Prep/exercises
./setup.sh
cd practice
```

**📋 Tasks to Complete:**

#### Task 1.1: Explore Your Current Location (3 minutes)
```bash
# 1. Find out where you are
pwd
```
**Explanation**: `pwd` = "Print Working Directory" - shows your current location in the file system

```bash
# 2. List everything in current directory
ls -la
```
**Explanation**: `ls` = "list", `-l` = long format (shows permissions, size, date), `-a` = all files (including hidden ones starting with .)

```bash
# 3. Check the size of items in human-readable format
ls -lah
```
**Explanation**: Same as above, but `-h` = human readable (shows 1.2K, 3.4M instead of raw bytes)

```bash
# 4. Sort files by modification time
ls -lt
```
**Explanation**: `-t` = sort by time modified (newest first), combined with `-l` for detailed view

**✅ Checkpoint**: You should see the practice directory structure with frontend/, backend/, logs/, and various files.

#### Task 1.2: Navigation Practice (5 minutes)
```bash
# 1. Navigate to frontend directory
cd frontend
```
**Explanation**: `cd` = "change directory", followed by the directory name you want to enter

```bash
# 2. Check where you are
pwd
```
**Explanation**: Always good to confirm your location after navigation

```bash
# 3. Go into the src directory
cd src
```
**Explanation**: Since you're in frontend/, this takes you to frontend/src/

```bash
# 4. List what's in here
ls -la
```
**Explanation**: See what files and directories exist in the current location

```bash
# 5. Go back to the root practice directory (multiple ways)
cd ../../          # Method 1: Relative path
```
**Explanation**: `../` = go up one level, so `../../` = go up two levels (src → frontend → practice)

```bash
# OR
cd ~/path/to/practice  # Method 2: Absolute path (adjust to your location)
```
**Explanation**: `~` = home directory, then specify full path from home. Replace with your actual path

```bash
# OR
cd -              # Method 3: Go to previous directory (if you were there before)
```
**Explanation**: `-` is a special shortcut that takes you back to the previous directory you were in

```bash
# 6. Verify you're back at practice root
pwd && ls
```
**Explanation**: `&&` = run second command only if first succeeds. Shows location AND contents

**✅ Checkpoint**: You should be back in the practice directory.

#### Task 1.3: Advanced Listing and Finding (7 minutes)
```bash
# 1. Show directory tree structure (if tree is available)
tree
```
**Explanation**: `tree` shows directory structure in a visual tree format (may need to install)

```bash
# If tree isn't available, use ls recursively:
ls -R
```
**Explanation**: `ls` with `-R` = recursive, shows contents of all subdirectories

```bash
# 2. Find all directories containing "src"
find . -type d -name "*src*"
```
**Explanation**: `find` searches files/dirs, `.` = start here, `-type d` = directories only, `-name "*src*"` = names containing "src"

```bash
# 3. Find all .js files
find . -name "*.js"
```
**Explanation**: `*.js` = wildcard pattern matching all files ending in .js

```bash
# 4. Find all package.json files
find . -name "package.json"
```
**Explanation**: Finds exact filename matches for package.json files

```bash
# 5. Show sizes of top-level directories
du -sh */
```
**Explanation**: `du` = disk usage, `-s` = summary (total per directory), `-h` = human readable, `*/` = all directories

```bash
# 6. Count total files in each directory
find frontend/ -type f | wc -l
```
**Explanation**: `find frontend/ -type f` = find all files in frontend/, `|` pipes to `wc -l` = count lines (= count files)

```bash
find backend/ -type f | wc -l
find logs/ -type f | wc -l
```
**Explanation**: Same pattern for other directories

**✅ Checkpoint**: You should have found 2 src directories, several .js files, and 2 package.json files.

### Exercise 2: Process & System Monitoring (20 minutes)

**🎯 Goal**: Learn to monitor system resources and manage processes

**📋 Tasks to Complete:**

#### Task 2.1: System Information & Resources (5 minutes)
```bash
# 1. Check system information
uname -a
```
**Explanation**: `uname` = "unix name", `-a` = all information (kernel, hostname, version, architecture)

```bash
# 2. Check system uptime and load
uptime
```
**Explanation**: Shows how long system has been running and load averages (1min, 5min, 15min)

```bash
# 3. Check memory usage
free -h
```
**Explanation**: `free` shows RAM usage, `-h` = human readable format (GB/MB instead of bytes)

```bash
# 4. Check disk space
df -h
```
**Explanation**: `df` = "disk free", shows filesystem usage, `-h` = human readable format

```bash
# 5. Check CPU information
lscpu
```
**Explanation**: `lscpu` = "list CPU", shows detailed CPU specs (cores, threads, architecture)

```bash
# If lscpu not available, try:
cat /proc/cpuinfo | grep "model name" | head -1
```
**Explanation**: `cat /proc/cpuinfo` = read CPU info file, `grep "model name"` = filter for model, `head -1` = show first match

**✅ Checkpoint**: You should see your system specs, available memory, and disk space.

#### Task 2.2: Process Monitoring (8 minutes)
```bash
# 1. Start a long-running process in background
ping google.com > /dev/null &
```
**Explanation**: `ping google.com` = continuous ping, `> /dev/null` = discard output, `&` = run in background

```bash
# 2. Check what processes are running
ps aux | head -10
```
**Explanation**: `ps aux` = show all processes, `|` pipes to `head -10` = show only first 10 lines

```bash
# 3. Find your ping process specifically
ps aux | grep ping
```
**Explanation**: `ps aux` lists all processes, `grep ping` filters lines containing "ping"

```bash
# 4. Alternative way to find processes
pgrep -f ping
```
**Explanation**: `pgrep` = "process grep", `-f` = search full command line (not just process name)

```bash
# 5. Check background jobs
jobs
```
**Explanation**: Shows jobs started in current shell session (background processes started with `&`)

```bash
# 6. See real-time process activity
top
```
**Explanation**: Real-time process monitor showing CPU/memory usage, sorted by CPU usage. Press 'q' to quit

```bash
# Press 'q' to quit top

# 7. If htop is available (better than top)
htop
```
**Explanation**: Enhanced version of `top` with colors and better interface (may need to install)

```bash
# Press 'q' to quit htop

# 8. Monitor processes by memory usage
ps aux --sort=-%mem | head -10
```
**Explanation**: `--sort=-%mem` = sort by memory usage (highest first), `%` prefix means descending order

**✅ Checkpoint**: You should see your ping process running and understand how to monitor system processes.

#### Task 2.3: Process Control (7 minutes)
```bash
# 1. Find the PID (Process ID) of your ping process
pgrep -f ping
```
**Explanation**: Returns the Process ID number(s) of processes matching "ping"

```bash
# 2. Kill the process by PID (replace XXXX with actual PID)
kill XXXX
```
**Explanation**: `kill` sends termination signal to specific Process ID. Replace XXXX with actual number from step 1

```bash
# 3. Verify it's gone
ps aux | grep ping
```
**Explanation**: Check if ping process still exists (should only show the grep command itself)

```bash
# 4. Start another background process
ping google.com > ping_output.txt &
```
**Explanation**: `> ping_output.txt` = save output to file instead of discarding it

```bash
# 5. Kill by process name
killall ping
```
**Explanation**: `killall` terminates ALL processes with the specified name (be careful!)

```bash
# 6. Alternative: Start and stop with job control
ping google.com &
```
**Explanation**: Start a background job

```bash
jobs
```
**Explanation**: List current background jobs with job numbers

```bash
kill %1
```
**Explanation**: `%1` = job number 1 (from jobs list), alternative to using PID

```bash
# 7. Monitor directory sizes (useful for Docker)
du -sh ./*
```
**Explanation**: `du -sh ./*` = disk usage summary, human readable, all items in current directory

**✅ Checkpoint**: You should be able to start, find, and terminate processes using different methods.

### Exercise 3: Log Analysis Practice (25 minutes)

**🎯 Goal**: Master log file analysis and text processing for debugging

**🚀 Setup**: Navigate to practice directory and use the existing log files:
```bash
cd logs/
ls -la  # You should see app.log and error.log
```

**📋 Tasks to Complete:**

#### Task 3.1: Basic Log Viewing (5 minutes)
```bash
# 1. View the entire app.log file
cat app.log
```
**Explanation**: `cat` = "concatenate", displays entire file content at once

```bash
# 2. View just the beginning of the file
head -5 app.log
```
**Explanation**: `head` shows first lines, `-5` = show exactly 5 lines from the start

```bash
# 3. View just the end of the file
tail -5 app.log
```
**Explanation**: `tail` shows last lines, `-5` = show exactly 5 lines from the end

```bash
# 4. Page through the log file
less app.log
```
**Explanation**: `less` shows file content one screen at a time. Use ↑↓ to scroll, `/text` to search, `q` to quit

```bash
# Press 'q' to quit less

# 5. Count lines in the log file
wc -l app.log
```
**Explanation**: `wc` = "word count", `-l` = lines only (useful to know log file size)

```bash
# 6. Check the file size
ls -lh app.log
```
**Explanation**: Shows file details including size in human-readable format

**✅ Checkpoint**: You should see log entries with timestamps, levels (INFO, ERROR, WARN, DEBUG), and messages.

#### Task 3.2: Searching and Filtering (10 minutes)
```bash
# 1. Find all ERROR entries
grep ERROR app.log
```
**Explanation**: `grep` searches for text patterns, shows all lines containing "ERROR"

```bash
# 2. Find all ERROR entries with line numbers
grep -n ERROR app.log
```
**Explanation**: `-n` = number, shows line numbers where matches are found (helpful for locating issues)

```bash
# 3. Case-insensitive search for errors
grep -i error app.log
```
**Explanation**: `-i` = ignore case, finds "error", "Error", "ERROR", etc.

```bash
# 4. Find all entries that contain "database"
grep -i database app.log
```
**Explanation**: Searches for database-related log entries (useful for debugging DB issues)

```bash
# 5. Find entries that DON'T contain INFO
grep -v INFO app.log
```
**Explanation**: `-v` = invert match, shows lines that do NOT contain "INFO"

```bash
# 6. Count how many ERROR entries exist
grep -c ERROR app.log
```
**Explanation**: `-c` = count, returns number of matching lines (not the lines themselves)

```bash
# 7. Find multiple patterns at once
grep -E "(ERROR|WARN)" app.log
```
**Explanation**: `-E` = extended regex, `(ERROR|WARN)` = matches either ERROR OR WARN

```bash
# 8. Search in both log files
grep ERROR *.log
```
**Explanation**: `*.log` = wildcard for all .log files, searches across multiple files

**✅ Checkpoint**: You should be able to find specific log entries and count different log levels.

#### Task 3.3: Advanced Text Processing (10 minutes)
```bash
# 1. Extract only timestamps and log levels
awk '{print $1, $2, $3}' app.log
```
**Explanation**: `awk` processes text field by field, `$1 $2 $3` = first three columns (date, time, level)

```bash
# 2. Count occurrences of each log level
awk '{print $3}' app.log | sort | uniq -c
```
**Explanation**: `$3` = 3rd column (log level), `sort` = alphabetical order, `uniq -c` = count unique items

```bash
# 3. Show only ERROR messages (the actual message part)
grep ERROR app.log | awk '{for(i=4;i<=NF;i++) printf "%s ", $i; print ""}'
```
**Explanation**: `grep ERROR` = filter error lines, `awk` loop from field 4 to end (`NF` = number of fields) to get message text

```bash
# 4. Find entries from the last minute (using 10:35: as example)
grep "10:35:" app.log
```
**Explanation**: Searches for specific time pattern (useful for finding recent entries)

```bash
# 5. Extract unique hours from timestamps
awk '{print substr($2,1,2)}' app.log | sort | uniq
```
**Explanation**: `substr($2,1,2)` = substring of field 2 (time), starting at position 1, length 2 (hour part)

```bash
# 6. Sort log entries by time
sort app.log
```
**Explanation**: Sorts lines alphabetically (which works for timestamp format YYYY-MM-DD HH:MM:SS)

```bash
# 7. Find the most common words in error messages
grep ERROR app.log | tr ' ' '\n' | sort | uniq -c | sort -nr | head -10
```
**Explanation**: `tr ' ' '\n'` = replace spaces with newlines (one word per line), then count and sort by frequency

```bash
# 8. Simulate following logs in real-time
# First, add a new entry to test:
echo "$(date '+%Y-%m-%d %H:%M:%S') INFO  New entry from exercise" >> app.log
```
**Explanation**: `echo` = output text, `$(date '+%Y-%m-%d %H:%M:%S')` = current timestamp, `>>` = append to file

```bash
# Then follow the file (Ctrl+C to stop):
tail -f app.log
```
**Explanation**: `tail -f` = follow file changes in real-time (essential for monitoring live logs)

**✅ Checkpoint**: You should understand how to extract specific data, count patterns, and monitor logs in real-time.

### Exercise 4: Network Diagnostics (20 minutes)

**🎯 Goal**: Learn network troubleshooting skills essential for Docker container networking

**📋 Tasks to Complete:**

#### Task 4.1: Basic Connectivity Testing (7 minutes)
```bash
# 1. Test basic internet connectivity
ping -c 4 google.com
```
**Explanation**: `ping` sends ICMP packets to test connectivity, `-c 4` = send only 4 packets then stop

```bash
# 2. Test connectivity with more detailed output
ping -c 3 -v 8.8.8.8
```
**Explanation**: `-v` = verbose output, `8.8.8.8` = Google's public DNS server (reliable test target)

```bash
# 3. Test if specific ports are reachable (if nc/netcat is available)
nc -zv google.com 80
nc -zv google.com 443
```
**Explanation**: `nc` = netcat, `-z` = scan mode (don't send data), `-v` = verbose, port 80 = HTTP, 443 = HTTPS

```bash
# Alternative if nc not available:
telnet google.com 80
```
**Explanation**: `telnet` can test if a port is open, though it's designed for terminal access

```bash
# Type Ctrl+] then "quit" to exit

# 4. Test DNS resolution
nslookup google.com
```
**Explanation**: `nslookup` queries DNS to resolve domain names to IP addresses

```bash
# Or alternative:
dig google.com
```
**Explanation**: `dig` = "domain information groper", more detailed DNS lookup tool

```bash
# 5. Show your network configuration
ifconfig
```
**Explanation**: `ifconfig` = "interface config", shows network interface details (IP addresses, status)

```bash
# Or on newer systems:
ip addr show
```
**Explanation**: `ip addr show` = modern replacement for ifconfig, shows network interface information

**✅ Checkpoint**: You should see successful pings and be able to resolve domain names.

#### Task 4.2: Port and Process Analysis (8 minutes)
```bash
# 1. Check what ports are listening on your system
netstat -tuln
```
**Explanation**: `netstat` = network statistics, `-t` = TCP, `-u` = UDP, `-l` = listening, `-n` = numeric (don't resolve names)

```bash
# Or alternative:
ss -tuln
```
**Explanation**: `ss` = "socket statistics", modern replacement for netstat with same flags

```bash
# 2. Check what processes are using network ports
netstat -tulnp
```
**Explanation**: Adding `-p` = process, shows which process (PID/name) is using each port

```bash
# Or alternative:
ss -tulnp
```
**Explanation**: Same information using the modern `ss` command

```bash
# 3. Find what's using a specific port (e.g., port 22 for SSH)
lsof -i :22
```
**Explanation**: `lsof` = "list open files", `-i :22` = network files on port 22 (SSH port)

```bash
# Or alternative:
ss -tulnp | grep :22
```
**Explanation**: Pipe `ss` output to `grep` to filter for specific port

```bash
# 4. Check all established connections
netstat -tun
```
**Explanation**: Without `-l`, shows active connections (not just listening ports)

```bash
# Or alternative:
ss -tun
```
**Explanation**: Same using modern `ss` command

```bash
# 5. Show network interface statistics
netstat -i
```
**Explanation**: `-i` = interface statistics, shows packet counts, errors for each network interface

```bash
# Or alternative:
ip -s link
```
**Explanation**: `ip -s link` = modern way to show interface statistics

**✅ Checkpoint**: You should understand which ports are open and what processes are using them.

#### Task 4.3: HTTP Requests and API Testing (5 minutes)
```bash
# 1. Make a simple HTTP request
curl http://httpbin.org/json
```
**Explanation**: `curl` makes HTTP requests, returns JSON response (useful for testing APIs)

```bash
# 2. Make a request with headers shown
curl -i http://httpbin.org/json
```
**Explanation**: `-i` = include response headers in output (shows HTTP status, content-type, etc.)

```bash
# 3. Make a POST request with data
curl -X POST -H "Content-Type: application/json" \
     -d '{"key":"value"}' \
     http://httpbin.org/post
```
**Explanation**: `-X POST` = HTTP method, `-H` = header, `-d` = data, `\` = line continuation

```bash
# 4. Download a file and show progress
curl -O http://httpbin.org/json
```
**Explanation**: `-O` = output to file with same name as remote file, shows download progress

```bash
# 5. Test HTTP response codes
curl -o /dev/null -s -w "%{http_code}\n" http://httpbin.org/status/200
curl -o /dev/null -s -w "%{http_code}\n" http://httpbin.org/status/404
```
**Explanation**: `-o /dev/null` = discard output, `-s` = silent, `-w` = write format (shows only status code)

```bash
# 6. Test connection timing
curl -o /dev/null -s -w "Total time: %{time_total}s\n" http://google.com
```
**Explanation**: `%{time_total}` = variable showing total request time (useful for performance testing)

```bash
# 7. Alternative: using wget if curl not available
wget -O - http://httpbin.org/json
```
**Explanation**: `wget` = alternative download tool, `-O -` = output to stdout (display response)

**✅ Checkpoint**: You should be able to make HTTP requests and understand response codes and timing.

### Exercise 5: Docker-Specific Skills (30 minutes)

**🎯 Goal**: Practice command patterns you'll use constantly when working with Docker

**🚀 Setup**: Navigate back to the practice root directory:
```bash
cd ../  # Go back to practice/ directory
pwd     # Confirm you're in practice/
```

**📋 Tasks to Complete:**

#### Task 5.1: Docker Project Structure Setup (8 minutes)
```bash
# 1. Create a realistic Docker project structure
mkdir -p docker-project/{src,config,scripts,volumes/{data,logs}}
```
**Explanation**: `mkdir -p` = create parents if needed, `{src,config,scripts}` = brace expansion creates multiple directories

```bash
# 2. Create the essential Docker files
touch docker-project/Dockerfile
touch docker-project/.dockerignore
touch docker-project/docker-compose.yml
```
**Explanation**: `touch` creates empty files. These are the core Docker files you'll use in every project

```bash
# 3. Create a multi-environment setup
mkdir -p docker-project/config/{dev,prod,test}
touch docker-project/config/dev/.env
touch docker-project/config/prod/.env
touch docker-project/config/test/.env
```
**Explanation**: Creates separate configuration directories for different environments (development, production, test)

```bash
# 4. List the structure you created
tree docker-project/
```
**Explanation**: `tree` shows the directory structure visually (helpful to verify your setup)

```bash
# Or if tree not available:
find docker-project/ -type d | sort
```
**Explanation**: `find ... -type d` = find directories only, `sort` = alphabetical order

```bash
# 5. Check all files created
find docker-project/ -type f | sort
```
**Explanation**: `find ... -type f` = find files only (not directories)

```bash
# 6. Simulate Docker volume permissions (common Docker requirement)
chmod 755 docker-project/volumes/
chmod 777 docker-project/volumes/data/
chmod 644 docker-project/.dockerignore
```
**Explanation**: Docker often requires specific permissions: `755` = directory access, `777` = full access for data volumes, `644` = readable config files

**✅ Checkpoint**: You should have a complete Docker project structure with proper permissions.

#### Task 5.2: Environment Variables & Configuration (12 minutes)
```bash
# 1. Create a sample .env file
cat > docker-project/config/dev/.env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_dev
DB_USER=developer
DB_PASSWORD=dev_password

# App Configuration
NODE_ENV=development
APP_PORT=3000
LOG_LEVEL=debug

# External Services
REDIS_URL=redis://localhost:6379
API_KEY=dev_api_key_12345
EOF
```
**Explanation**: `cat > file << 'EOF'` = heredoc syntax, writes multi-line content to file until 'EOF' marker

```bash
# 2. Create a production config
cat > docker-project/config/prod/.env << 'EOF'
# Database Configuration
DB_HOST=prod-db.company.com
DB_PORT=5432
DB_NAME=myapp_prod
DB_USER=app_user
DB_PASSWORD=secure_prod_password

# App Configuration
NODE_ENV=production
APP_PORT=80
LOG_LEVEL=info

# External Services
REDIS_URL=redis://prod-redis.company.com:6379
API_KEY=prod_api_key_secure
EOF
```
**Explanation**: Creates separate production configuration with different values (URLs, security settings, etc.)

```bash
# 3. Practice reading environment variables
source docker-project/config/dev/.env
echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "Environment: $NODE_ENV"
```
**Explanation**: `source` loads variables from file into current shell, `$VARIABLE` substitutes variable values

```bash
# 4. Show all variables starting with DB_
env | grep ^DB_
```
**Explanation**: `env` shows all variables, `grep ^DB_` = filter lines starting with "DB_"

```bash
# 5. Unset variables to clean up
unset DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD NODE_ENV APP_PORT LOG_LEVEL REDIS_URL API_KEY
```
**Explanation**: `unset` removes variables from current shell session (cleanup for next exercises)

```bash
# 6. Practice with Docker-style environment variable substitution
echo "Connecting to database at $DB_HOST:$DB_PORT" | envsubst
```
**Explanation**: `envsubst` substitutes environment variables in text (useful for templating Docker configs)

**✅ Checkpoint**: You should understand how to manage environment variables for different environments.

#### Task 5.3: Docker-Style Log Analysis (10 minutes)
```bash
# 1. Create sample container logs
cat > docker-project/volumes/logs/app.log << 'EOF'
2024-01-27 09:15:30.123 [INFO] Container started - app-container-abc123
2024-01-27 09:15:31.456 [INFO] Connecting to database at postgres://db:5432/myapp
2024-01-27 09:15:32.789 [INFO] Database connection established
2024-01-27 09:15:33.012 [WARN] Config value API_TIMEOUT not set, using default 5000ms
2024-01-27 09:15:34.345 [INFO] Server listening on port 3000
2024-01-27 09:16:45.678 [ERROR] Database query failed: connection timeout
2024-01-27 09:16:46.901 [INFO] Retrying database connection...
2024-01-27 09:16:47.234 [INFO] Database reconnected successfully
2024-01-27 09:17:12.567 [ERROR] API request failed: 503 Service Unavailable
2024-01-27 09:17:13.890 [WARN] Rate limit approaching: 95/100 requests
EOF
```
**Explanation**: Creates realistic container logs with timestamps, levels, and container IDs (similar to `docker logs` output)

```bash
# 2. Practice typical Docker log analysis commands
cd docker-project/volumes/logs/

# Filter logs by level
grep ERROR app.log
```
**Explanation**: Filter to show only error entries (essential for debugging container issues)

```bash
grep -E "(ERROR|WARN)" app.log
```
**Explanation**: `-E` = extended regex, shows both ERROR and WARN entries (all problematic log levels)

```bash
# Extract container information
grep -o "app-container-[a-z0-9]*" app.log
```
**Explanation**: `-o` = only matching part, extracts container IDs from logs (useful for multi-container debugging)

```bash
# Find database-related events
grep -i database app.log
```
**Explanation**: `-i` = case insensitive, finds all database-related log entries for troubleshooting DB issues

```bash
# Get timestamps of errors for debugging
grep ERROR app.log | awk '{print $1, $2}'
```
**Explanation**: Extracts just timestamps from error lines (helps identify when problems occurred)

```bash
# Count log levels (like you would for container health)
awk '{print $3}' app.log | tr -d '[]' | sort | uniq -c
```
**Explanation**: `$3` = log level field, `tr -d '[]'` = remove brackets, then count each level type

```bash
# Monitor logs in real-time (Docker logs -f equivalent)
tail -f app.log &
```
**Explanation**: `tail -f` = follow file changes, `&` = background (simulates `docker logs -f container_name`)

```bash
sleep 2
kill %1  # Stop the background tail
```
**Explanation**: Wait 2 seconds, then kill background job (stop monitoring)

```bash
# 3. Navigate back
cd ../../
```
**Explanation**: Return to project root directory

**✅ Checkpoint**: You should be comfortable analyzing container logs and extracting debugging information.

### Exercise 6: Command Combinations (25 minutes)

**🎯 Goal**: Master command chaining and piping for complex operations

**📋 Tasks to Complete:**

#### Task 6.1: File Analysis Combinations (10 minutes)
```bash
# 1. Find all .js files and count them
find . -name "*.js" | wc -l
```
**Explanation**: `find . -name "*.js"` finds all .js files, `|` pipes to `wc -l` which counts lines (= number of files)

```bash
# 2. Get the 5 largest files in your directory
ls -la | sort -k5 -nr | head -6  # 6 because first line is "total"
```
**Explanation**: `ls -la` lists files, `sort -k5 -nr` sorts by 5th column (size) numerically in reverse, `head -6` shows top 6

```bash
# Or better yet:
find . -type f -exec ls -lh {} \; | sort -k5 -hr | head -5
```
**Explanation**: `find . -type f` finds files, `-exec ls -lh {} \;` runs `ls -lh` on each file, then sorts by human-readable size

# 3. Get unique file extensions and count them
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -nr
```
**Explanation**: `sed 's/.*\.//'` = remove everything before last dot (leaving only extension), then count each type

```bash
# 4. Find all files modified in the last hour
find . -type f -mmin -60 | head -10
```
**Explanation**: `-mmin -60` = modified within 60 minutes, useful for finding recently changed files

```bash
# 5. Get total size of all .log files
find . -name "*.log" -exec ls -l {} \; | awk '{sum += $5} END {print "Total:", sum, "bytes"}'
```
**Explanation**: `-exec ls -l {} \;` runs `ls -l` on each file, `awk` sums the 5th column (file size)

```bash
# 6. List directories by size
du -sh */ | sort -hr
```
**Explanation**: `du -sh */` = directory sizes, `sort -hr` = sort by human-readable size (largest first)

**✅ Checkpoint**: You should understand how to chain commands for complex file analysis.

#### Task 6.2: Text Processing Pipelines (8 minutes)
```bash
# 1. Search for "function" in all .js files and count occurrences
find . -name "*.js" -exec grep -H "function" {} \; | wc -l
```
**Explanation**: `find` all .js files, `grep -H "function"` searches with filename, `wc -l` counts total matches

# 2. Find most common words in log files
cat logs/*.log | tr ' ' '\n' | tr '[:upper:]' '[:lower:]' | sort | uniq -c | sort -nr | head -10
```
**Explanation**: Complex pipeline breakdown:
- `cat logs/*.log` = combine all log files
- `tr ' ' '\n'` = replace spaces with newlines (one word per line)
- `tr '[:upper:]' '[:lower:]'` = convert to lowercase
- `sort` = sort words alphabetically
- `uniq -c` = count unique words
- `sort -nr` = sort by count (highest first)
- `head -10` = show top 10

# 3. Extract unique IP addresses from logs (simulated)
echo -e "192.168.1.1 - GET /api\n192.168.1.2 - POST /login\n192.168.1.1 - GET /home" | \
awk '{print $1}' | sort | uniq
```
**Explanation**: `echo -e` = enable escape sequences (`\n` = newline), `awk '{print $1}'` = first field (IP), then deduplicate

```bash
# 4. Count lines of code in JavaScript files
find . -name "*.js" | xargs wc -l | tail -1
```
**Explanation**: `xargs wc -l` = pass files to word count, `tail -1` = last line shows total count

```bash
# 5. Find files containing specific text and show line numbers
grep -rn "require" frontend/ | head -5
```
**Explanation**: `grep -rn` = recursive search with line numbers, `head -5` = limit to first 5 matches

```bash
# 6. Get process information and filter
ps aux | grep -v grep | grep -E "(node|npm)" | awk '{print $2, $11}'
```
**Explanation**: `grep -v grep` = exclude grep itself, `grep -E "(node|npm)"` = find node/npm processes, show PID and command
```

**✅ Checkpoint**: You should be able to create complex text processing pipelines.

#### Task 6.3: System Monitoring Combinations (7 minutes)
```bash
# 1. Find processes using the most memory
ps aux --sort=-%mem | head -10 | awk '{print $4, $11}'
```
**Explanation**: Sort processes by memory usage (highest first), show memory % and command name

```bash
# 2. Monitor disk usage and find largest directories
du -h | sort -hr | head -10
```
**Explanation**: `du -h` = directory sizes, `sort -hr` = sort human-readable (largest first), show top 10

```bash
# 3. Network connections analysis
netstat -tuln | grep LISTEN | awk '{print $4}' | cut -d':' -f2 | sort -n
```
**Explanation**: Show listening ports: get LISTEN sockets, extract port column, cut port number, sort numerically

```bash
# 4. Find files owned by current user in /tmp (if accessible)
find /tmp -user $(whoami) 2>/dev/null | head -5
```
**Explanation**: `$(whoami)` = current username, `2>/dev/null` = ignore permission errors

```bash
# 5. Check which processes are using specific ports
# (Simulated - showing command structure)
echo "These commands would show port usage:"
echo "lsof -i :3000 | grep LISTEN"
echo "ss -tulnp | grep :80"
```
**Explanation**: Shows example commands for port analysis (actual commands might need permissions)

```bash
# 6. Combine multiple system checks
echo "=== System Check ==="
echo "Uptime: $(uptime | awk '{print $3, $4}' | sed 's/,//')"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}')"
echo "Processes: $(ps aux | wc -l)"
```
**Explanation**: Creates formatted system summary using command substitution `$()` to embed command output

**✅ Checkpoint**: You should be able to combine commands for comprehensive system monitoring.

#### 🏆 Final Challenge: Create a System Report (5 minutes)
```bash
# Create a comprehensive system report using command combinations
echo "=== SYSTEM REPORT $(date) ===" > system_report.txt
```
**Explanation**: `$(date)` = current timestamp, `>` = write to file (overwrites existing)

```bash
echo "" >> system_report.txt

echo ">>> ENVIRONMENT:" >> system_report.txt
uname -a >> system_report.txt
echo "" >> system_report.txt
```
**Explanation**: `>>` = append to file, creates sections with system information

```bash
echo ">>> DISK USAGE:" >> system_report.txt
df -h >> system_report.txt
echo "" >> system_report.txt

echo ">>> MEMORY USAGE:" >> system_report.txt
free -h >> system_report.txt
echo "" >> system_report.txt
```
**Explanation**: Appends different system stats to build comprehensive report

```bash
echo ">>> TOP 5 LARGEST DIRECTORIES:" >> system_report.txt
du -sh */ 2>/dev/null | sort -hr | head -5 >> system_report.txt
echo "" >> system_report.txt
```
**Explanation**: `2>/dev/null` = ignore permission errors, show largest directories in report

```bash
echo ">>> PROJECT FILES SUMMARY:" >> system_report.txt
echo "JavaScript files: $(find . -name '*.js' | wc -l)" >> system_report.txt
echo "JSON files: $(find . -name '*.json' | wc -l)" >> system_report.txt
echo "Log files: $(find . -name '*.log' | wc -l)" >> system_report.txt
echo "Total files: $(find . -type f | wc -l)" >> system_report.txt
```
**Explanation**: Command substitution `$()` to count files by type and embed results in report

```bash
# View your report
cat system_report.txt
```
**Explanation**: Display the completed system report you just created

**✅ Final Checkpoint**: You created a comprehensive system report using multiple command combinations!

---

## 🎉 Congratulations! You've Completed Command Line Docker Prep!

### 📋 Skills You've Mastered:

#### ✅ **File System Navigation**
- Directory navigation with `cd`, `pwd`, `ls`
- File searching with `find` and advanced listing
- Permission management with `chmod`

#### ✅ **Process & System Monitoring**
- System information with `uname`, `uptime`, `free`, `df`
- Process monitoring with `ps`, `top`, `htop`
- Process control with `kill`, `killall`, job management

#### ✅ **Log Analysis & Text Processing**
- Log file analysis with `grep`, `awk`, `sed`
- Text filtering and counting with `sort`, `uniq`, `wc`
- Real-time monitoring with `tail -f`

#### ✅ **Network Diagnostics**
- Connectivity testing with `ping`, `curl`, `wget`
- Port analysis with `netstat`, `ss`, `lsof`
- DNS resolution with `nslookup`, `dig`

#### ✅ **Docker-Specific Skills**
- Project structure creation and permissions
- Environment variable management
- Container-style log analysis
- Volume and configuration patterns

#### ✅ **Command Combinations**
- Complex piping and command chaining
- System reporting and analysis
- Advanced text processing pipelines

### 🚀 What's Next?

You're now ready to tackle **Task 0.3: Docker Environment**! These command line skills will be essential for:

- **Docker Container Management**: Starting, stopping, inspecting containers
- **Log Analysis**: Debugging container issues with `docker logs`
- **Volume Management**: Working with Docker volumes and bind mounts
- **Network Troubleshooting**: Diagnosing container connectivity
- **Multi-Container Orchestration**: Managing complex applications

### 💡 Keep Practicing!

- Use the **command cheat sheet** (`command-cheatsheet.md`) as a daily reference
- Practice these commands in real projects
- Combine commands creatively to solve new problems
- Always think about how these skills apply to Docker workflows

---

## 📋 Skills Checklist

Mark each skill as you master it:

### Basic Operations
- [ ] Navigate directories efficiently
- [ ] Create, copy, and move files/directories
- [ ] View file contents with different methods
- [ ] Understand and modify file permissions

### Process Management
- [ ] List and find processes
- [ ] Kill processes by PID and name
- [ ] Run commands in background
- [ ] Monitor system resources

### Text Processing
- [ ] Search text with grep
- [ ] Process text with awk and sed
- [ ] Analyze log files
- [ ] Use pipes to combine commands

### System Administration
- [ ] Manage environment variables
- [ ] Check network connectivity
- [ ] Monitor ports and services
- [ ] View system information

### Docker Preparation
- [ ] Understand file permissions for containers
- [ ] Practice log monitoring techniques
- [ ] Set up project directory structures
- [ ] Manage environment configurations

---

## 🔗 Command Quick Reference

### Most Used Commands for Docker Development
```bash
# File operations
ls -la && pwd                    # Where am I and what's here?
find . -name "Dockerfile"        # Find Docker files
tail -f logs/app.log             # Monitor application logs

# System monitoring
ps aux | grep docker             # Find Docker processes
df -h                           # Check disk space
netstat -tulpn | grep :3000     # Check if port is in use

# Text processing
grep -r "TODO" src/             # Find code TODOs
cat .env | grep DATABASE        # Check database config
docker logs container_name | tail -20  # Last 20 log lines

# Network debugging
curl -I http://localhost:3000    # Test HTTP endpoint
ping database_container          # Test container connectivity
```

---

## 🚀 Next Steps

After mastering these command line skills, you'll be ready for:
- **Task 0.3**: Docker Environment Setup
- Efficient container debugging and monitoring
- System administration in containerized environments
- Log analysis for microservices
- Network troubleshooting in Docker networks

---

## 🔤 Command Line Syntax Fundamentals

### Command Structure
```bash
command [options] [arguments]
```
**Example**: `ls -la /home/user`
- `ls` = command
- `-la` = options (flags)
- `/home/user` = argument (what to operate on)

### Common Option Patterns
```bash
-h, --help           # Show help (almost every command)
-v, --verbose        # Show detailed output
-r, --recursive      # Process directories recursively
-f, --force          # Force operation (be careful!)
-n, --dry-run        # Show what would happen (don't actually do it)
```

### Combining Options
```bash
ls -l -a -h          # Separate flags
ls -lah              # Combined flags (same result)
```

### Pipes and Redirection
```bash
command1 | command2  # Pipe: output of command1 becomes input of command2
command > file.txt   # Redirect output to file (overwrites)
command >> file.txt  # Redirect output to file (appends)
command < file.txt   # Use file as input
command 2>&1         # Redirect errors to same place as output
```

### Wildcards and Patterns
```bash
*                    # Matches any characters (ls *.txt)
?                    # Matches single character (file?.txt)
[abc]                # Matches a, b, or c
[0-9]                # Matches any digit
{jpg,png,gif}        # Matches any of the extensions
```

### Special Characters
```bash
~                    # Home directory
.                    # Current directory
..                   # Parent directory
/                    # Root directory (or path separator)
$                    # Variable prefix (echo $HOME)
&                    # Run in background (command &)
;                    # Command separator (cmd1; cmd2)
&&                   # Run second command only if first succeeds
||                   # Run second command only if first fails
```

### Quoting Rules
```bash
'single quotes'      # Literal text (no variable expansion)
"double quotes"      # Allow variable expansion ($VAR works)
\                    # Escape character (makes next character literal)
```

### Examples of Syntax in Action
```bash
# Find all .log files modified in last 24 hours and count lines
find . -name "*.log" -mtime -1 -exec wc -l {} \;

# Backup all .js files to a tar archive
tar -czf backup_$(date +%Y%m%d).tar.gz *.js

# Monitor disk usage every 5 seconds
watch -n 5 'df -h | grep -v tmpfs'

# Find large files and sort by size
find / -type f -size +100M 2>/dev/null | xargs ls -lh | sort -k5 -hr
```

---

**💡 Pro Tip**: Practice these commands daily! Muscle memory for command line operations will make you incredibly efficient when working with Docker containers and system administration tasks.

**Ready to start? Begin with Exercise 1 and work through each one systematically! 🚀** 