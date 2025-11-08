"""Health check endpoints"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("")
async def health_check():
    """Check if the service is healthy"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "validator",
    }
