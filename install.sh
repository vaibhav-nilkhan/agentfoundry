#!/bin/bash

# ==============================================
# AgentFoundry - One-Click Installation Script
# ==============================================
# This script sets up AgentFoundry with Docker
# Prerequisites: Docker and Docker Compose installed
# ==============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emoji support
SUCCESS="✅"
ERROR="❌"
INFO="ℹ️ "
WARNING="⚠️ "
ROCKET="🚀"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           AgentFoundry - One-Click Installation              ║"
echo "║                                                               ║"
echo "║         The Fitbit for your AI Coding Agents                 ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ----------------------------------------------
# Step 1: Check Prerequisites
# ----------------------------------------------
echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${ERROR} ${RED}Docker is not installed!${NC}"
    echo -e "${INFO} Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${ERROR} ${RED}Docker Compose is not installed!${NC}"
    echo -e "${INFO} Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${ERROR} ${RED}Docker daemon is not running!${NC}"
    echo -e "${INFO} Please start Docker and try again."
    exit 1
fi

echo -e "${SUCCESS} ${GREEN}Docker and Docker Compose are ready!${NC}"
echo ""

# ----------------------------------------------
# Step 2: Environment Configuration
# ----------------------------------------------
echo -e "${BLUE}[2/6]${NC} Setting up environment configuration..."

if [ ! -f .env ]; then
    echo -e "${INFO} Creating .env file from template..."
    cp .env.example .env
    echo -e "${SUCCESS} ${GREEN}.env file created!${NC}"
    echo ""
    echo -e "${YELLOW}${WARNING} IMPORTANT: Configure Supabase credentials in .env${NC}"
    echo -e "${INFO} Get your credentials from: https://supabase.com/dashboard"
    echo ""
    echo -e "Do you want to edit .env now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        ${EDITOR:-nano} .env
    fi
else
    echo -e "${SUCCESS} ${GREEN}.env file already exists!${NC}"
fi

echo ""

# ----------------------------------------------
# Step 3: Pull Docker Images (Pre-download)
# ----------------------------------------------
echo -e "${BLUE}[3/6]${NC} Pulling Docker images..."
echo -e "${INFO} This may take a few minutes on first run..."

docker-compose pull postgres redis 2>&1 | grep -v "Pulling from" || true

echo -e "${SUCCESS} ${GREEN}Base images downloaded!${NC}"
echo ""

# ----------------------------------------------
# Step 4: Build Application Images
# ----------------------------------------------
echo -e "${BLUE}[4/6]${NC} Building application images..."
echo -e "${INFO} This may take 5-10 minutes on first run..."

docker-compose build --parallel

echo -e "${SUCCESS} ${GREEN}Application images built!${NC}"
echo ""

# ----------------------------------------------
# Step 5: Start Services
# ----------------------------------------------
echo -e "${BLUE}[5/6]${NC} Starting AgentFoundry services..."

docker-compose up -d

echo -e "${INFO} Waiting for services to be healthy..."
sleep 10

# Wait for services to be healthy
MAX_WAIT=120
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if docker-compose ps | grep -q "healthy"; then
        break
    fi
    echo -n "."
    sleep 2
    WAITED=$((WAITED + 2))
done

echo ""
echo -e "${SUCCESS} ${GREEN}All services started!${NC}"
echo ""

# ----------------------------------------------
# Step 6: Display Status
# ----------------------------------------------
echo -e "${BLUE}[6/6]${NC} Checking service status..."
echo ""

docker-compose ps

echo ""
echo -e "${GREEN}${ROCKET} AgentFoundry is now running!${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     Access Your Platform                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  🌐 Web Platform:${NC}     http://localhost:3100"
echo -e "${GREEN}  🔧 API Server:${NC}       http://localhost:4100"
echo -e "${GREEN}  📚 API Docs:${NC}         http://localhost:4100/api/docs"
echo -e "${GREEN}  🔬 Validator:${NC}        http://localhost:5100"
echo -e "${GREEN}  🗄️  Database:${NC}        localhost:5432"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      Default Credentials                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}  Database User:${NC}     agentfoundry"
echo -e "${YELLOW}  Database Password:${NC} agentfoundry_dev_password"
echo -e "${YELLOW}  Database Name:${NC}     agentfoundry"
echo ""
echo -e "${RED}${WARNING} Remember to change these in production!${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      Useful Commands                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}  View logs:${NC}           docker-compose logs -f"
echo -e "${GREEN}  Stop services:${NC}       docker-compose stop"
echo -e "${GREEN}  Restart services:${NC}    docker-compose restart"
echo -e "${GREEN}  Remove everything:${NC}   docker-compose down -v"
echo -e "${GREEN}  Update platform:${NC}     git pull && docker-compose up -d --build"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                       Next Steps                             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  1. ${GREEN}${SUCCESS}${NC} Open http://localhost:3100 in your browser"
echo -e "  2. ${INFO} Browse the 23 production-ready skills"
echo -e "  3. ${INFO} Check out the interactive showcase at /showcase"
echo -e "  4. ${INFO} Explore the admin panel at /admin"
echo -e "  5. ${ROCKET} Start building AI agents with validated skills!"
echo ""
echo -e "${GREEN}Thank you for using AgentFoundry!${NC}"
echo -e "${INFO} Documentation: https://github.com/yourusername/agentfoundry"
echo -e "${INFO} Issues: https://github.com/yourusername/agentfoundry/issues"
echo ""
