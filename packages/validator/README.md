# AgentFoundry Validator

Python/FastAPI microservice for validating AI Skills.

## Features

- **Static Analysis**: AST-based code analysis for syntax and structure
- **Permission Scanning**: Validates declared permissions against actual usage
- **Security Scanning**: Detects vulnerabilities and security risks

## Setup

```bash
# Install dependencies with Poetry
poetry install

# Run the service
poetry run uvicorn app.main:app --reload --port 5000
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/v1/validate/skill` - Validate a Skill manifest and code
- `POST /api/v1/validate/file` - Upload and validate a Skill file

## Development

```bash
# Run tests
poetry run pytest

# Format code
poetry run black .

# Type checking
poetry run mypy .
```
