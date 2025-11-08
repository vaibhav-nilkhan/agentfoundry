"""Permission scanning service to verify manifest accuracy"""
import re
from typing import Dict, List, Any


class PermissionScanner:
    """Scans code for permission usage and validates against manifest"""

    # Permission patterns to detect in code
    PERMISSION_PATTERNS = {
        "network.http": [r"requests\.", r"httpx\.", r"urllib", r"http\.client"],
        "file.read": [r"open\(.*['\"]r", r"\.read\(", r"pathlib\.Path"],
        "file.write": [r"open\(.*['\"]w", r"\.write\(", r"\.save\("],
        "email.send": [r"smtplib", r"send_email", r"sendgrid"],
        "database.query": [r"execute\(", r"query\(", r"sql"],
    }

    async def scan(self, manifest: Dict[str, Any], code: str) -> Dict[str, Any]:
        """
        Scan code for permission usage and compare with manifest
        Returns validation result with detected vs declared permissions
        """
        declared_permissions = set(manifest.get("permissions", []))
        detected_permissions = set()

        # Detect permissions used in code
        for permission, patterns in self.PERMISSION_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, code):
                    detected_permissions.add(permission)
                    break

        # Find missing permissions (used but not declared)
        missing_permissions = detected_permissions - declared_permissions

        # Find unused permissions (declared but not used)
        unused_permissions = declared_permissions - detected_permissions

        valid = len(missing_permissions) == 0

        return {
            "valid": valid,
            "declared": list(declared_permissions),
            "detected": list(detected_permissions),
            "missing": list(missing_permissions),
            "unused": list(unused_permissions),
        }
