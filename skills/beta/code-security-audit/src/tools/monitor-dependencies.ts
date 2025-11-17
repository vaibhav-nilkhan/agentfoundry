import { z } from 'zod';

const inputSchema = z.object({
  repo_url: z.string().url('Repository URL must be valid'),
  package_managers: z.array(z.enum(['npm', 'pip', 'maven', 'gradle', 'cargo'])).optional(),
  alert_severity: z.enum(['all', 'high', 'critical']).default('high'),
});

interface VulnerableDependency {
  package_name: string;
  current_version: string;
  vulnerable_versions: string[];
  fixed_version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve_id: string;
  published_date: string;
  patch_available: boolean;
}

interface MonitorOutput {
  vulnerable_dependencies: VulnerableDependency[];
  summary: {
    total_vulnerable: number;
    critical_count: number;
    high_count: number;
    packages_monitored: number;
  };
  recommendations: string[];
  metadata: {
    repo_url: string;
    monitored_at: string;
    alert_severity: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<MonitorOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Monitoring dependencies for: ${validated.repo_url}`);
  console.log(`Alert severity: ${validated.alert_severity}`);

  const vulnerableDeps = generateSimulatedVulnerabilities(validated.alert_severity);
  const summary = calculateSummary(vulnerableDeps);
  const recommendations = generateRecommendations(vulnerableDeps);

  return {
    vulnerable_dependencies: vulnerableDeps,
    summary,
    recommendations,
    metadata: {
      repo_url: validated.repo_url,
      monitored_at: new Date().toISOString(),
      alert_severity: validated.alert_severity,
    },
  };
}

function generateSimulatedVulnerabilities(alertSeverity: string): VulnerableDependency[] {
  const baseVulns: VulnerableDependency[] = [
    {
      package_name: 'lodash',
      current_version: '4.17.15',
      vulnerable_versions: ['< 4.17.21'],
      fixed_version: '4.17.21',
      severity: 'high',
      cve_id: 'CVE-2021-23337',
      published_date: '2021-02-15',
      patch_available: true,
    },
    {
      package_name: 'axios',
      current_version: '0.21.0',
      vulnerable_versions: ['< 0.21.2'],
      fixed_version: '0.21.2',
      severity: 'critical',
      cve_id: 'CVE-2021-3749',
      published_date: '2021-08-31',
      patch_available: true,
    },
    {
      package_name: 'minimist',
      current_version: '1.2.5',
      vulnerable_versions: ['< 1.2.6'],
      fixed_version: '1.2.6',
      severity: 'medium',
      cve_id: 'CVE-2021-44906',
      published_date: '2022-03-10',
      patch_available: true,
    },
  ];

  if (alertSeverity === 'critical') {
    return baseVulns.filter(v => v.severity === 'critical');
  } else if (alertSeverity === 'high') {
    return baseVulns.filter(v => v.severity === 'critical' || v.severity === 'high');
  }

  return baseVulns;
}

function calculateSummary(deps: VulnerableDependency[]) {
  return {
    total_vulnerable: deps.length,
    critical_count: deps.filter(d => d.severity === 'critical').length,
    high_count: deps.filter(d => d.severity === 'high').length,
    packages_monitored: 150, // Simulated
  };
}

function generateRecommendations(deps: VulnerableDependency[]): string[] {
  const recommendations: string[] = [];

  const critical = deps.filter(d => d.severity === 'critical');
  if (critical.length > 0) {
    recommendations.push(`URGENT: Update ${critical.length} critical dependencies immediately`);
  }

  const patchable = deps.filter(d => d.patch_available);
  if (patchable.length > 0) {
    recommendations.push(`Run 'npm update' to patch ${patchable.length} vulnerabilities`);
  }

  recommendations.push('Review and update dependencies regularly');
  recommendations.push('Enable automated dependency alerts');

  return recommendations;
}
