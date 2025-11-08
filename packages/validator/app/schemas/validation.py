"""Pydantic schemas for validation requests and responses"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum


class ValidationStatus(str, Enum):
    """Validation status enum"""

    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"


class ValidationRequest(BaseModel):
    """Request schema for Skill validation"""

    manifest: Dict[str, Any] = Field(..., description="Skill manifest JSON")
    code: str = Field(..., description="Skill code content")
    version: Optional[str] = Field(default="1.0.0", description="Skill version")


class ValidationResponse(BaseModel):
    """Response schema for validation results"""

    status: ValidationStatus
    passed: bool
    score: float = Field(..., ge=0.0, le=100.0)
    issues: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None
