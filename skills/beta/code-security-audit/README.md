# Code Security Audit

> AI-powered security scanning with automated fixes and exploit generation

## What It Does

Code Security Audit helps you secure your codebase by:
- **Scanning for vulnerabilities** - OWASP Top 10, CVE database integration
- **Generating automated fixes** - AI-powered code patches
- **Verifying fixes** - Ensure vulnerabilities are actually resolved
- **Monitoring dependencies** - Continuous vulnerability tracking

## Features

### 1. Comprehensive Security Scanning
- Static + Dynamic analysis
- CVSS scoring
- Compliance framework support (SOC 2, ISO 27001, PCI-DSS, HIPAA)
- Risk scoring (0-100)

### 2. Automated Fix Generation
- AI-powered fix suggestions
- Multiple strategies (minimal, comprehensive, refactor)
- Git patches ready to apply
- Confidence scoring

### 3. Fix Verification
- Exploit simulation
- Remaining issue detection
- Merge recommendations

### 4. Dependency Monitoring
- Multi-package manager support (npm, pip, maven, gradle, cargo)
- CVE tracking
- Update recommendations

## Installation

```bash
npm install @agentfoundry-skills/code-security-audit
```

## Usage

### Scan Codebase

```typescript
import { run as scanCodebase } from './tools/scan-codebase';

const scan = await scanCodebase({
  repo_url: 'https://github.com/example/repo',
  branch: 'main',
  scan_depth: 'standard',
  include_dependencies: true,
  compliance_framework: 'soc2'
});

console.log(`Found ${scan.summary.total_vulnerabilities} vulnerabilities`);
console.log(`Risk score: ${scan.risk_score}/100`);
```

### Generate Fix

```typescript
import { run as generateFix } from './tools/generate-fix';

const fix = await generateFix({
  vulnerability_id: 'vuln_1',
  fix_strategy: 'comprehensive',
  auto_apply: false
});

console.log(fix.fix_code);
console.log(`Confidence: ${fix.confidence}%`);
```

### Verify Fix

```typescript
import { run as verifyFix } from './tools/verify-fix';

const verification = await verifyFix({
  vulnerability_id: 'vuln_1',
  fixed_code: '...',
  run_exploit: true
});

console.log(`Fixed: ${verification.is_fixed}`);
console.log(`Exploit result: ${verification.exploit_result}`);
```

### Monitor Dependencies

```typescript
import { run as monitorDeps } from './tools/monitor-dependencies';

const monitor = await monitorDeps({
  repo_url: 'https://github.com/example/repo',
  package_managers: ['npm', 'pip'],
  alert_severity: 'high'
});

console.log(`${monitor.summary.total_vulnerable} vulnerable dependencies found`);
```

## Tools

| Tool | Description |
|------|-------------|
| `scan_codebase` | Scan for security vulnerabilities |
| `generate_fix` | Generate automated security fixes |
| `verify_fix` | Verify fixes resolve vulnerabilities |
| `monitor_dependencies` | Monitor dependency vulnerabilities |

## Pricing

| Tier | Price | Limits |
|------|-------|--------|
| **Free** | $0/mo | 10 scans/month |
| **Pro** | $99/mo | 100 scans/month, automated fixes |
| **Enterprise** | $499/mo | Unlimited |

## License

MIT © AgentFoundry
