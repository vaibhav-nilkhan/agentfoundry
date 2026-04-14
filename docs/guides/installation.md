# AgentFoundry Installation Guide

AgentFoundry V2 is a Node.js CLI tool with a local SQLite database, making it inherently cross-platform. It runs natively on macOS, Linux, and Windows.

## Option 1: Global NPM Install (Recommended for All Platforms)

Since AgentFoundry is built on Node.js, the easiest and most reliable way to install it across all operating systems is using `npm`.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation
Open your terminal (macOS/Linux) or PowerShell/Command Prompt (Windows) and run:

```bash
npm install -g @agentfoundry/cli
```

### Starting the Daemon
Once installed, start the background watcher in any project directory:
```bash
agentfoundry watch
```

---

## Option 2: The One-Click Install Script (macOS & Linux)

For macOS and Linux users who prefer a single command that checks prerequisites and installs the CLI automatically, we provide a bootstrap script.

### Installation
```bash
curl -fsSL https://raw.githubusercontent.com/agentfoundry/agentfoundry/main/install.sh | bash
```

### What the script does:
1. Checks if `node` and `npm` are installed. If not, it prompts the user to install them (or installs them via nvm/apt/brew if permitted).
2. Runs `npm install -g @agentfoundry/cli`.
3. Initializes the local SQLite database and tracking directories at `~/.agentfoundry/`.
4. Verifies the installation by running `agentfoundry --version`.

*(Note: Windows users must use Option 1 via npm, as the bash script is not natively supported in standard Windows Command Prompt without WSL).*

---

## Post-Installation: Web Dashboard

To view your metrics, start the web dashboard from your terminal:
```bash
agentfoundry dashboard
```
This will spin up the local Next.js server and open `http://localhost:3000` in your default browser, showing your agent costs, history, and swarm analytics.