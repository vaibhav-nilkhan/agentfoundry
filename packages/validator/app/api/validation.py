"""Validation endpoints for Skill analysis"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.validation import (
    ValidationRequest,
    ValidationResponse,
    ValidationStatus,
)
from app.services.static_analyzer import StaticAnalyzer
from app.services.permission_scanner import PermissionScanner
from app.services.security_scanner import SecurityScanner

router = APIRouter()


@router.post("/skill", response_model=ValidationResponse)
async def validate_skill(request: ValidationRequest):
    """
    Validate a Skill manifest and code
    Performs static analysis, permission scanning, and security checks
    """
    try:
        issues = []
        warnings = []
        score = 100.0

        # Static analysis
        static_analyzer = StaticAnalyzer()
        static_results = await static_analyzer.analyze(request.code)
        issues.extend(static_results.get("errors", []))
        warnings.extend(static_results.get("warnings", []))

        # Permission scanning
        permission_scanner = PermissionScanner()
        permission_results = await permission_scanner.scan(
            request.manifest, request.code
        )
        if not permission_results.get("valid"):
            issues.append("Permission manifest mismatch detected")

        # Security scanning
        security_scanner = SecurityScanner()
        security_results = await security_scanner.scan(request.code)
        issues.extend(security_results.get("critical", []))
        warnings.extend(security_results.get("warnings", []))

        # Calculate score
        score -= len(issues) * 10
        score -= len(warnings) * 2
        score = max(0.0, min(100.0, score))

        status = ValidationStatus.PASSED if len(issues) == 0 else ValidationStatus.FAILED

        return ValidationResponse(
            status=status,
            passed=len(issues) == 0,
            score=score,
            issues=issues,
            warnings=warnings,
            metadata={
                "static_analysis": static_results,
                "permissions": permission_results,
                "security": security_results,
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.post("/file")
async def validate_file(file: UploadFile = File(...)):
    """
    Validate a Skill from an uploaded file
    Supports .claudeskill.md and .json manifest files
    """
    try:
        content = await file.read()
        # TODO: Parse and validate file content
        return {
            "status": "pending",
            "message": "File validation coming soon",
            "filename": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File validation failed: {str(e)}")
