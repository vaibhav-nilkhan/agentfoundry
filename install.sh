#!/bin/bash

# ==============================================
# AgentFoundry V2 - One-Click Installation Script
# ==============================================
# This script sets up the AgentFoundry CLI for macOS and Linux.
# AgentFoundry V2 uses a local SQLite database (Zero Setup).
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
ROCKET="🚀"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           AgentFoundry V2 - CLI Installation                 ║"
echo "║                                                               ║"
echo "║         The Fitbit for your AI Coding Agents                 ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ----------------------------------------------
# Step 1: Check Prerequisites (Node.js & npm)
# ----------------------------------------------
echo -e "${BLUE}[1/3]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${ERROR} ${RED}Node.js is not installed!${NC}"
    echo -e "${INFO} AgentFoundry requires Node.js v18 or higher."
    echo -e "${INFO} Please install Node.js from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${ERROR} ${RED}npm is not installed!${NC}"
    echo -e "${INFO} Please install npm (usually bundled with Node.js)."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${SUCCESS} ${GREEN}Found Node.js ${NODE_VERSION} and npm!${NC}"
echo ""

# ----------------------------------------------
# Step 2: Install the CLI Globally via NPM
# ----------------------------------------------
echo -e "${BLUE}[2/3]${NC} Installing @agentfoundry/cli globally..."
echo -e "${INFO} Running: npm install -g @agentfoundry/cli"

# Execute npm install. We use sudo if needed, but normally npm -g shouldn't need it if configured well via nvm.
if npm install -g @agentfoundry/cli 2>/dev/null; then
    echo -e "${SUCCESS} ${GREEN}CLI installed successfully!${NC}"
else
    echo -e "${YELLOW}Standard install failed. Attempting with sudo...${NC}"
    sudo npm install -g @agentfoundry/cli
    echo -e "${SUCCESS} ${GREEN}CLI installed successfully via sudo!${NC}"
fi
echo ""

# ----------------------------------------------
# Step 3: Initialize Local Config
# ----------------------------------------------
echo -e "${BLUE}[3/3]${NC} Initializing local configuration..."

# Create the local directory for the SQLite db and plugins if it doesn't exist
AGENTFOUNDRY_DIR="$HOME/.agentfoundry"
if [ ! -d "$AGENTFOUNDRY_DIR" ]; then
    mkdir -p "$AGENTFOUNDRY_DIR"
    mkdir -p "$AGENTFOUNDRY_DIR/plugins"
    echo -e "${SUCCESS} ${GREEN}Created local data directory at ~/.agentfoundry${NC}"
else
    echo -e "${SUCCESS} ${GREEN}Local data directory already exists at ~/.agentfoundry${NC}"
fi

echo ""

# ----------------------------------------------
# Step 4: Verification & Next Steps
# ----------------------------------------------
if command -v agentfoundry &> /dev/null || command -v af &> /dev/null; then
    echo -e "${GREEN}${ROCKET} AgentFoundry V2 has been successfully installed!${NC}"
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                       Getting Started                        ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  1. ${GREEN}Start the Background Tracker:${NC}"
    echo -e "     Run \`agentfoundry watch\` in your project directory."
    echo ""
    echo -e "  2. ${GREEN}View Your Agent Stats:${NC}"
    echo -e "     Run \`agentfoundry stats\` to see your terminal leaderboard."
    echo ""
    echo -e "  3. ${GREEN}Open the Web Dashboard:${NC}"
    echo -e "     Run \`agentfoundry dashboard\` to view the Bento UI."
    echo ""
    echo -e "${INFO} Documentation: https://github.com/agentfoundry/agentfoundry"
else
    echo -e "${ERROR} ${RED}Installation appeared to succeed, but 'agentfoundry' command is not available.${NC}"
    echo -e "${INFO} Please ensure your global npm bin directory is in your system PATH."
fi
