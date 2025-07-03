#!/bin/bash

# 🔄 Auto-Generate Database ERD Script
# This script regenerates the ERD from your PostgreSQL database

echo "🔄 Updating Database ERD..."
echo "📍 Working directory: $(pwd)"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "learning-postgres"; then
    echo "❌ PostgreSQL container 'learning-postgres' is not running!"
    echo "💡 Start it with: cd Learning/0.2-Database-Design && docker-compose up -d"
    exit 1
fi

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install pg
fi

# Generate the ERD
echo "🚀 Generating ERD from database..."
node generate-erd.js

# Check if generation was successful
if [ $? -eq 0 ]; then
    echo "✅ ERD updated successfully!"
    echo "📄 Generated files:"
    echo "   - schemas/generated-erd.md (auto-generated)"
    echo "   - schemas/e-commerce-erd.md (manually updated)"
    echo ""
    echo "🔍 To view the ERD:"
    echo "   - Open the files in VS Code/Cursor"
    echo "   - Use the Mermaid Preview extension"
    echo "   - Or copy the mermaid code to https://mermaid.live"
else
    echo "❌ ERD generation failed!"
    echo "💡 Check that your database is running and accessible"
fi 