import { z } from 'zod';

const inputSchema = z.object({
  repo_url: z.string().url('Repository URL must be valid'),
  branch: z.string().default('main'),
  scan_depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
  include_dependencies: z.boolean().default(true),
  compliance_framework: z.enum(['none', 'soc2', 'iso27001', 'pci-dss', 'hipaa']).default('none'),
});

interface Vulnerability {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss_score: number;
  file: string;
  line: number;
  description: string;
  exploit_poc: string;
  fix_available: boolean;
  cve_id?: string;
}

interface ScanOutput {
  scan_id: string;
  vulnerabilities: Vulnerability[];
  summary: {
    total_vulnerabilities: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
  };
  compliance_status: Record<string, boolean>;
  risk_score: number;
  metadata: {
    repo_url: string;
    branch: string;
    scanned_at: string;
    scan_depth: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<ScanOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Scanning repository: ${validated.repo_url}`);
  console.log(`Scan depth: ${validated.scan_depth}`);

  const vulnerabilities = generateSimulatedVulnerabilities(validated.scan_depth);

  const summary = calculateSummary(vulnerabilities);
  const riskScore = calculateRiskScore(vulnerabilities);
  const complianceStatus = checkCompliance(vulnerabilities, validated.compliance_framework);

  return {
    scan_id: `scan_${Date.now()}`,
    vulnerabilities,
    summary,
    compliance_status: complianceStatus,
    risk_score: riskScore,
    metadata: {
      repo_url: validated.repo_url,
      branch: validated.branch,
      scanned_at: new Date().toISOString(),
      scan_depth: validated.scan_depth,
    },
  };
}

function generateSimulatedVulnerabilities(depth: string): Vulnerability[] {
  const count = depth === 'quick' ? 3 : depth === 'standard' ? 7 : 15;
  const types = ['sql-injection', 'xss', 'csrf', 'auth-bypass', 'path-traversal', 'command-injection'];
  const severities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];

  return Array.from({ length: count }, (_, i) => ({
    id: `vuln_${i + 1}`,
    type: types[i % types.length],
    severity: severities[i % severities.length],
    cvss_score: 10 - (i % 10),
    file: `src/app/${types[i % types.length]}.ts`,
    line: 42 + i * 10,
    description: `Potential ${types[i % types.length]} vulnerability detected`,
    exploit_poc: `// Exploit code here`,
    fix_available: true,
    cve_id: i < 3 ? `CVE-2024-${1000 + i}` : undefined,
  }));
}

function calculateSummary(vulns: Vulnerability[]) {
  return {
    total_vulnerabilities: vulns.length,
    critical_count: vulns.filter(v => v.severity === 'critical').length,
    high_count: vulns.filter(v => v.severity === 'high').length,
    medium_count: vulns.filter(v => v.severity === 'medium').length,
    low_count: vulns.filter(v => v.severity === 'low').length,
  };
}

function calculateRiskScore(vulns: Vulnerability[]): number {
  const weights = { critical: 10, high: 7, medium: 4, low: 1, info: 0 };
  const total = vulns.reduce((sum, v) => sum + weights[v.severity], 0);
  return Math.min(100, total);
}

function checkCompliance(vulns: Vulnerability[], framework: string): Record<string, boolean> {
  if (framework === 'none') return {};

  const criticalCount = vulns.filter(v => v.severity === 'critical').length;
  return {
    no_critical_vulnerabilities: criticalCount === 0,
    encryption_implemented: true,
    access_controls: true,
  };
}
