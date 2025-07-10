#!/bin/bash

echo "🧪 Testing All Docker Configurations..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a container
test_container() {
    local name=$1
    local dockerfile=$2
    local port=$3
    
    echo -e "\n${YELLOW}Testing $name...${NC}"
    
    # Build
    echo "Building image..."
    if [[ "$dockerfile" == "Dockerfile" ]]; then
        docker build -t test-$name . > /dev/null 2>&1
    else
        docker build -f $dockerfile -t test-$name . > /dev/null 2>&1
    fi
    
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Build failed for $name${NC}"
        return 1
    fi
    
    # Run
    echo "Starting container..."
    docker run -d -p $port:8080 --name test-$name test-$name > /dev/null 2>&1
    
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Container failed to start for $name${NC}"
        return 1
    fi
    
    # Wait for startup
    sleep 3
    
    # Test HTTP response
    echo "Testing HTTP response..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null)
    
    # Cleanup
    docker stop test-$name > /dev/null 2>&1
    docker rm test-$name > /dev/null 2>&1
    docker rmi test-$name > /dev/null 2>&1
    
    if [[ "$response" == "200" ]]; then
        echo -e "${GREEN}✅ $name works perfectly!${NC}"
        return 0
    else
        echo -e "${RED}❌ $name returned HTTP $response${NC}"
        return 1
    fi
}

# Test all configurations
failed=0

test_container "main-dockerfile" "Dockerfile" "8001"
if [[ $? -ne 0 ]]; then ((failed++)); fi

test_container "simple-dockerfile" "Dockerfile.simple" "8002"
if [[ $? -ne 0 ]]; then ((failed++)); fi

test_container "compose-dockerfile" "Dockerfile.compose" "8003"
if [[ $? -ne 0 ]]; then ((failed++)); fi

echo ""
echo "======================================"
if [[ $failed -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! Your Docker setup is perfect!${NC}"
    echo ""
    echo "Ready to use commands:"
    echo "  docker build -t my-frontend . && docker run -p 80:8080 my-frontend"
    echo "  docker build -f Dockerfile.simple -t simple . && docker run -p 80:8080 simple"
    echo "  docker-compose up --build"
else
    echo -e "${RED}❌ $failed test(s) failed. Check your configuration.${NC}"
fi
echo "=======================================" 