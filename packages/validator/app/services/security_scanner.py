"""Security scanning service for vulnerability detection"""
import re
from typing import Dict, List, Any


class SecurityScanner:
    """Scans code for security vulnerabilities and risks"""

    # Security vulnerability patterns
    CRITICAL_PATTERNS = {
        "SQL Injection": [r"execute\(.*\+.*\)", r"query\(.*%.*\)"],
        "Command Injection": [r"os\.system\(", r"subprocess\.call\(.*shell=True"],
        "Path Traversal": [r"\.\./", r"\.\.\\"],
        "Hardcoded Secrets": [
            r"password\s*=\s*['\"][^'\"]+['\"]",
            r"api_key\s*=\s*['\"][^'\"]+['\"]",
            r"secret\s*=\s*['\"][^'\"]+['\"]",
        ],
    }

    WARNING_PATTERNS = {
        "Weak Encryption": [r"md5", r"sha1"],
        "Insecure Random": [r"random\.random\(", r"random\.randint\("],
        "Debug Mode": [r"DEBUG\s*=\s*True", r"debug\s*=\s*True"],
    }

    async def scan(self, code: str) -> Dict[str, Any]:
        """
        Scan code for security vulnerabilities
        Returns critical issues and warnings
        """
        critical: List[str] = []
        warnings: List[str] = []

        # Check for critical vulnerabilities
        for vulnerability, patterns in self.CRITICAL_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, code, re.IGNORECASE):
                    critical.append(f"{vulnerability} detected")
                    break

        # Check for warning-level issues
        for issue, patterns in self.WARNING_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, code, re.IGNORECASE):
                    warnings.append(f"{issue} detected")
                    break

        safety_score = 100.0
        safety_score -= len(critical) * 25
        safety_score -= len(warnings) * 5
        safety_score = max(0.0, safety_score)

        return {
            "critical": critical,
            "warnings": warnings,
            "safety_score": safety_score,
            "passed": len(critical) == 0,
        }
