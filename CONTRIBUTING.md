# Contributing to AgentFoundry

Thank you for your interest in contributing to AgentFoundry! This document provides guidelines and instructions for contributing.

## 📋 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/agentfoundry.git
cd agentfoundry
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd packages/validator
poetry install
```

### 3. Set Up Development Environment

```bash
# Copy environment files
cp packages/web/.env.example packages/web/.env.local
cp packages/api/.env.example packages/api/.env
cp packages/validator/.env.example packages/validator/.env

# Set up database
cd packages/db
pnpm prisma migrate dev
pnpm prisma db seed
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
feat: add Claude Skills adapter
fix: resolve validation timeout issue
docs: update SDK usage examples
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @agentfoundry/sdk test

# Run tests in watch mode
pnpm test -- --watch
```

## 📝 Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions
- Update ARCHITECTURE.md for architectural changes
- Include examples in package READMEs

## 🎯 Pull Request Process

1. **Update Documentation**: Ensure all relevant docs are updated
2. **Add Tests**: Include tests for new features
3. **Run Linters**: Fix all linting errors
4. **Update Changelog**: Add entry to CHANGELOG.md (if exists)
5. **Create PR**: Use the PR template and provide clear description

### PR Title Format

```
feat(package): brief description

Example:
feat(sdk): add GPT adapter support
fix(validator): handle timeout edge cases
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for new features
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

## 🐛 Reporting Bugs

Use GitHub Issues with the bug template:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Environment details (OS, Node version, etc.)

## 💡 Suggesting Features

Use GitHub Issues with the feature template:

- Clear use case description
- Proposed solution
- Alternative solutions considered
- Additional context

## 📦 Package-Specific Guidelines

### @agentfoundry/web (Frontend)

- Follow Next.js best practices
- Use TypeScript strict mode
- Style with Tailwind utility classes
- Ensure components are accessible (a11y)

### @agentfoundry/api (Backend)

- Keep routes RESTful
- Add proper error handling
- Use TypeScript types (no `any`)
- Document API endpoints

### @agentfoundry/validator (Python)

- Follow PEP 8 style guide
- Add type hints
- Write docstrings for functions
- Use async/await for I/O operations

### @agentfoundry/sdk

- Maintain backward compatibility
- Export types for public APIs
- Add usage examples in docstrings
- Keep bundle size minimal

### @agentfoundry/cli

- Keep commands intuitive
- Add `--help` documentation
- Handle errors gracefully
- Use colored output for clarity

## 🔍 Code Review Process

All PRs require:

1. Passing CI checks
2. Approval from at least one maintainer
3. No merge conflicts
4. Updated documentation

Maintainers will review within 48 hours (usually faster).

## 🏗️ Architecture Decisions

For major architectural changes:

1. Open a GitHub Discussion first
2. Propose alternatives
3. Get consensus from maintainers
4. Document decision in ARCHITECTURE.md

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙋 Questions?

- Open a GitHub Discussion
- Join our Discord (coming soon)
- Email: dev@agentfoundry.ai (coming soon)

## 🌟 Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Annual contributor spotlight

Thank you for helping make AgentFoundry better! 🚀
