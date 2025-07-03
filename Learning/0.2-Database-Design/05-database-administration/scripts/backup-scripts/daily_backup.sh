#!/bin/bash

# =============================================================================
# POSTGRESQL DAILY BACKUP SCRIPT
# =============================================================================
#
# This script performs daily PostgreSQL backups with:
# - Logical dumps using pg_dump
# - Backup validation
# - Cleanup of old backups
# - Logging and error handling
# - Email notifications (optional)
#
# Usage: ./daily_backup.sh [database_name]
# Cron Example: 0 2 * * * /path/to/daily_backup.sh production_db
#
# =============================================================================

# Configuration Variables
SCRIPT_NAME="PostgreSQL Daily Backup"
SCRIPT_VERSION="1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/postgresql/backup_$(date +%Y%m%d).log"

# Database Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${1:-learning_db}"  # Use parameter or default

# Backup Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgresql}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
COMPRESSION_LEVEL="${COMPRESSION_LEVEL:-9}"

# Email Configuration (optional)
EMAIL_ENABLED="${EMAIL_ENABLED:-false}"
EMAIL_TO="${EMAIL_TO:-admin@example.com}"
EMAIL_FROM="${EMAIL_FROM:-backup@example.com}"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR" "$1"
    if [ "$EMAIL_ENABLED" = "true" ]; then
        send_email "FAILED" "$1"
    fi
    exit 1
}

# Success notification
success_notify() {
    log "INFO" "$1"
    if [ "$EMAIL_ENABLED" = "true" ]; then
        send_email "SUCCESS" "$1"
    fi
}

# Send email notification
send_email() {
    local status=$1
    local message=$2
    local subject="[$status] $SCRIPT_NAME - $DB_NAME"
    
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" "$EMAIL_TO"
    elif command -v sendmail >/dev/null 2>&1; then
        {
            echo "To: $EMAIL_TO"
            echo "From: $EMAIL_FROM"
            echo "Subject: $subject"
            echo ""
            echo "$message"
        } | sendmail "$EMAIL_TO"
    else
        log "WARNING" "No mail command available for notifications"
    fi
}

# Check dependencies
check_dependencies() {
    local deps=("pg_dump" "pg_isready" "gzip")
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" >/dev/null 2>&1; then
            error_exit "Required dependency '$dep' not found in PATH"
        fi
    done
    
    log "INFO" "All dependencies satisfied"
}

# Create backup directory
setup_backup_directory() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log "INFO" "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR" || error_exit "Failed to create backup directory"
    fi
    
    if [ ! -w "$BACKUP_DIR" ]; then
        error_exit "Backup directory is not writable: $BACKUP_DIR"
    fi
    
    log "INFO" "Backup directory ready: $BACKUP_DIR"
}

# =============================================================================
# BACKUP FUNCTIONS
# =============================================================================

# Check PostgreSQL connection
check_database_connection() {
    log "INFO" "Checking database connection..."
    
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        error_exit "Cannot connect to database $DB_NAME on $DB_HOST:$DB_PORT"
    fi
    
    log "INFO" "Database connection successful"
}

# Get database information
get_database_info() {
    local db_size
    local db_version
    
    db_size=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs)
    db_version=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" 2>/dev/null | cut -d',' -f1 | xargs)
    
    log "INFO" "Database: $DB_NAME"
    log "INFO" "Size: $db_size"
    log "INFO" "Version: $db_version"
}

# Perform logical backup
perform_logical_backup() {
    local backup_date=$(date +%Y%m%d_%H%M%S)
    local backup_filename="$DB_NAME"_logical_"$backup_date".sql
    local backup_path="$BACKUP_DIR/$backup_filename"
    local compressed_path="$backup_path.gz"
    
    log "INFO" "Starting logical backup: $backup_filename"
    
    # Perform pg_dump
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
               --create --clean --if-exists \
               --verbose \
               > "$backup_path" 2>>"$LOG_FILE"; then
        log "INFO" "Logical backup completed successfully"
    else
        error_exit "Logical backup failed"
    fi
    
    # Compress backup
    log "INFO" "Compressing backup file..."
    if gzip -"$COMPRESSION_LEVEL" "$backup_path"; then
        log "INFO" "Backup compressed: $compressed_path"
        echo "$compressed_path"  # Return path for validation
    else
        error_exit "Failed to compress backup file"
    fi
}

# Perform schema-only backup
perform_schema_backup() {
    local backup_date=$(date +%Y%m%d_%H%M%S)
    local schema_filename="$DB_NAME"_schema_"$backup_date".sql
    local schema_path="$BACKUP_DIR/$schema_filename"
    
    log "INFO" "Starting schema backup: $schema_filename"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
               --schema-only --create --clean --if-exists \
               > "$schema_path" 2>>"$LOG_FILE"; then
        log "INFO" "Schema backup completed: $schema_path"
        
        # Compress schema backup
        if gzip -"$COMPRESSION_LEVEL" "$schema_path"; then
            log "INFO" "Schema backup compressed: $schema_path.gz"
        fi
    else
        log "WARNING" "Schema backup failed (non-critical)"
    fi
}

# Validate backup integrity
validate_backup() {
    local backup_path=$1
    
    log "INFO" "Validating backup: $(basename "$backup_path")"
    
    # Check if file exists and has content
    if [ ! -f "$backup_path" ]; then
        error_exit "Backup file not found: $backup_path"
    fi
    
    if [ ! -s "$backup_path" ]; then
        error_exit "Backup file is empty: $backup_path"
    fi
    
    # Check if compressed file is valid
    if [[ "$backup_path" == *.gz ]]; then
        if ! gzip -t "$backup_path" 2>/dev/null; then
            error_exit "Backup file is corrupted: $backup_path"
        fi
    fi
    
    # Get file size for logging
    local file_size=$(du -h "$backup_path" | cut -f1)
    log "INFO" "Backup validation successful - Size: $file_size"
}

# =============================================================================
# MAINTENANCE FUNCTIONS
# =============================================================================

# Clean up old backups
cleanup_old_backups() {
    log "INFO" "Cleaning up backups older than $BACKUP_RETENTION_DAYS days"
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        log "INFO" "Deleting old backup: $(basename "$file")"
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "$DB_NAME"_*.sql.gz -mtime +$BACKUP_RETENTION_DAYS -print0 2>/dev/null)
    
    if [ $deleted_count -eq 0 ]; then
        log "INFO" "No old backups to clean up"
    else
        log "INFO" "Cleaned up $deleted_count old backup(s)"
    fi
}

# Generate backup report
generate_backup_report() {
    local backup_path=$1
    local start_time=$2
    local end_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Calculate duration
    local start_timestamp=$(date -d "$start_time" +%s)
    local end_timestamp=$(date -d "$end_time" +%s)
    local duration=$((end_timestamp - start_timestamp))
    
    # Get backup file size
    local backup_size=$(du -h "$backup_path" | cut -f1)
    
    # Count existing backups
    local backup_count=$(find "$BACKUP_DIR" -name "$DB_NAME"_*.sql.gz | wc -l)
    
    cat << EOF

=== BACKUP REPORT ===
Database: $DB_NAME
Backup File: $(basename "$backup_path")
Backup Size: $backup_size
Start Time: $start_time
End Time: $end_time
Duration: ${duration}s
Total Backups: $backup_count
Retention: $BACKUP_RETENTION_DAYS days
Status: SUCCESS

EOF
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local start_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    log "INFO" "=== Starting $SCRIPT_NAME v$SCRIPT_VERSION ==="
    log "INFO" "Database: $DB_NAME"
    log "INFO" "Host: $DB_HOST:$DB_PORT"
    log "INFO" "User: $DB_USER"
    log "INFO" "Backup Directory: $BACKUP_DIR"
    
    # Pre-flight checks
    check_dependencies
    setup_backup_directory
    check_database_connection
    get_database_info
    
    # Perform backups
    local backup_path
    backup_path=$(perform_logical_backup)
    validate_backup "$backup_path"
    
    # Perform schema backup (weekly on Sundays)
    if [ "$(date +%u)" -eq 7 ]; then
        perform_schema_backup
    fi
    
    # Cleanup and reporting
    cleanup_old_backups
    
    # Generate and log report
    local report=$(generate_backup_report "$backup_path" "$start_time")
    log "INFO" "$report"
    
    # Send success notification
    success_notify "Daily backup completed successfully for database: $DB_NAME"
    
    log "INFO" "=== Backup process completed successfully ==="
}

# =============================================================================
# SCRIPT ENTRY POINT
# =============================================================================

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Run main function
    main "$@"
fi

# Exit successfully
exit 0 