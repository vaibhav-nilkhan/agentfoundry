# ==========================================
# Stage 1: Builder
# ==========================================
FROM python:3.11-slim AS builder

# Install Poetry
RUN pip install --no-cache-dir poetry==1.7.1

WORKDIR /app

# Copy poetry files
COPY pyproject.toml poetry.lock ./

# Export dependencies to requirements.txt (faster for Docker)
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# ==========================================
# Stage 2: Runner
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Create non-root user
RUN groupadd --system --gid 1001 python
RUN useradd --system --uid 1001 --gid python python

# Install dependencies
COPY --from=builder /app/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Set permissions
RUN chown -R python:python /app

# Switch to non-root user
USER python

# Expose port (configurable via PORT env var, default 5100)
ENV PORT=5100
ENV PYTHONUNBUFFERED=1
EXPOSE 5100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5100/health').read()"

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5100"]
