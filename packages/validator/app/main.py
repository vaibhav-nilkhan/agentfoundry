"""
AgentFoundry Validator Microservice
Provides static analysis, permission scanning, and security validation for AI Skills
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import validation, health
from app.core.config import settings

app = FastAPI(
    title="AgentFoundry Validator",
    description="Skill validation and security analysis service",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(validation.router, prefix="/api/v1/validate", tags=["validation"])


@app.get("/")
async def root():
    return {
        "service": "AgentFoundry Validator",
        "version": "0.1.0",
        "status": "running",
    }
