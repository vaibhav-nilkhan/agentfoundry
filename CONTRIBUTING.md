# Contributing to AgentFoundry

Thank you for your interest in contributing to AgentFoundry! This document provides guidelines and instructions for contributing to the V2 coding agent orchestrator.

## 📋 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/vaibhav-nilkhan/agentfoundry.git
cd agentfoundry
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install
```

### 3. Set Up Development Environment

```bash
# Copy environment files
cp packages/web/.env.example packages/web/.env.local

# Set up local SQLite database
cd packages/db
npx prisma db push
```

## 🔧 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Making Changes

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests and linting
pnpm test
pnpm lint

# Commit your changes
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or updates
- `chore:` - Build process or tooling changes

Examples:
```
feat(cli): add Claude Code detection
fix(web): resolve cost calculation error
docs: update installation instructions
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @agentfoundry/cli test
```

---

## 📦 Package-Specific Guidelines

### @agentfoundry/web (Frontend)

- Follow Next.js 15 (App Router) best practices
- Use TypeScript strict mode
- Style with Tailwind utility classes (Bento UI aesthetic)

### @agentfoundry/cli (Background Daemon)

- Use `agentfoundry watch` to test the daemon
- Ensure commands are documented in `--help`
- Maintain high-contrast terminal outputs using `chalk`

### @agentfoundry/db (Prisma & SQLite)

- Always run `npx prisma generate` after schema changes
- Use local SQLite for solo development (no Postgres required)

## 🔍 Code Review Process

All PRs require:

1. Passing CI checks (Vitest & Lint)
2. Approval from at least one maintainer
3. No merge conflicts

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make AgentFoundry better! 🚀
