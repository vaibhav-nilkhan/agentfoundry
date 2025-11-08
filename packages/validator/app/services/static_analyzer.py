"""Static code analysis service using AST parsing"""
import ast
from typing import Dict, List, Any


class StaticAnalyzer:
    """Analyzes code structure and syntax"""

    async def analyze(self, code: str) -> Dict[str, Any]:
        """
        Perform static analysis on code
        Returns errors and warnings found
        """
        errors: List[str] = []
        warnings: List[str] = []

        try:
            # Parse the code into an AST
            tree = ast.parse(code)

            # Check for common issues
            for node in ast.walk(tree):
                # Check for eval/exec usage (security risk)
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        if node.func.id in ["eval", "exec"]:
                            errors.append(
                                f"Dangerous function '{node.func.id}' detected at line {node.lineno}"
                            )

                # Check for subprocess usage
                if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                    module = getattr(node, "module", None)
                    if module in ["subprocess", "os"]:
                        warnings.append(
                            f"Potentially risky module '{module}' imported at line {node.lineno}"
                        )

            return {
                "errors": errors,
                "warnings": warnings,
                "passed": len(errors) == 0,
            }

        except SyntaxError as e:
            return {
                "errors": [f"Syntax error: {str(e)}"],
                "warnings": [],
                "passed": False,
            }
        except Exception as e:
            return {
                "errors": [f"Analysis failed: {str(e)}"],
                "warnings": [],
                "passed": False,
            }
