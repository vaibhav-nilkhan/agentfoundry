# Error Recovery Orchestrator

> **Infrastructure Skill**: Automatically detect, analyze, and recover from AI agent workflow failures

[![Category](https://img.shields.io/badge/category-infrastructure-blue)](https://agentfoundry.ai/skills)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](https://agentfoundry.ai/skills/error-recovery-orchestrator)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

## 🎯 Overview

The Error Recovery Orchestrator is AgentFoundry's flagship infrastructure skill that solves the #1 cause of AI agent failures: **error compounding**. It automatically detects failures, classifies their severity and recoverability, and executes intelligent recovery strategies including retry with exponential backoff, rollback to previous states, and fallback to alternative paths.

### Problem Statement

Current AI agents fail at alarming rates:
- **36% success rate** over 20-step workflows due to error cascading
- **<55% task completion** in production systems
- Manual debugging required for every failure
- No automated recovery mechanisms

### Solution

Error Recovery Orchestrator increases workflow success rates from **36% → 80%+** through:
- Automatic error classification (transient/permanent/critical)
- Intelligent recovery strategy selection
- Health monitoring and failure prediction
- Detailed postmortem reports for continuous improvement

---

## 🚀 Quick Start

### Installation

```bash
npm install @agentfoundry/error-recovery-orchestrator
```

### Basic Usage

```typescript
import { detectFailure, executeRecovery } from '@agentfoundry/error-recovery-orchestrator';

// 1. Detect and classify the failure
const diagnosis = await detectFailure({
  error_message: "ETIMEDOUT: Connection timeout",
  step_number: 5,
  workflow_context: {
    total_steps: 10,
    completed_steps: 4,
    previous_step: "fetch_data",
    next_step: "process_data"
  }
});

console.log(diagnosis.failure_classification.type); // "transient"
console.log(diagnosis.recovery_recommendation.strategy); // "retry"

// 2. Execute the recommended recovery strategy
const recovery = await executeRecovery({
  strategy: diagnosis.recovery_recommendation.strategy,
  workflow_state: {
    current_step: 5,
    total_steps: 10,
    state_snapshot: { /* your state */ },
    failed_step_id: "step_5"
  },
  retry_config: {
    max_attempts: 3,
    backoff_strategy: "exponential",
    initial_delay_ms: 1000,
    max_delay_ms: 30000
  }
});

if (recovery.new_workflow_state.can_continue) {
  console.log("Recovery successful! Continuing workflow...");
}
```

---

## 🛠️ Tools

### 1. `detect_failure`

Analyze errors and classify their severity, type, and recoverability.

**Input:**
```typescript
{
  error_message: string;           // The error text
  error_code?: string;             // Optional error code
  step_number: number;             // Which step failed
  workflow_context: {
    total_steps: number;
    completed_steps: number;
    previous_step: string;
    next_step: string;
  };
  execution_history?: Array<{     // For learning
    step: string;
    status: 'success' | 'failure';
    timestamp: string;
  }>;
}
```

**Output:**
```typescript
{
  failure_classification: {
    type: 'transient' | 'permanent' | 'critical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    is_recoverable: boolean;
    confidence: number;              // 0-100
  };
  root_cause: {
    category: 'network' | 'auth' | 'data' | 'logic' | 'resource';
    description: string;
    likely_causes: string[];
  };
  recovery_recommendation: {
    strategy: 'retry' | 'rollback' | 'fallback' | 'skip' | 'manual';
    estimated_success_rate: number;
    reasoning: string;
  };
}
```

**Examples:**

```typescript
// Network timeout (transient)
await detectFailure({
  error_message: "ECONNREFUSED: Connection refused",
  step_number: 3,
  workflow_context: { /* ... */ }
});
// → Recommends: retry with exponential backoff

// Authentication failure (permanent)
await detectFailure({
  error_message: "401 Unauthorized: Invalid token",
  step_number: 2,
  workflow_context: { /* ... */ }
});
// → Recommends: manual intervention (needs credential update)

// Rate limit (transient)
await detectFailure({
  error_message: "429 Too Many Requests",
  step_number: 5,
  workflow_context: { /* ... */ }
});
// → Recommends: retry with backoff
```

---

### 2. `execute_recovery`

Execute recovery strategies with automatic retry, rollback, fallback, or skip logic.

**Input:**
```typescript
{
  strategy: 'retry' | 'rollback' | 'fallback' | 'skip';
  workflow_state: {
    current_step: number;
    total_steps: number;
    state_snapshot: any;            // State before failure
    failed_step_id: string;
  };
  retry_config?: {                  // For retry strategy
    max_attempts: number;           // Default: 3
    backoff_strategy: 'linear' | 'exponential' | 'fixed';
    initial_delay_ms: number;       // Default: 1000
    max_delay_ms: number;           // Default: 30000
  };
  fallback_config?: {               // For fallback strategy
    alternative_step: string;
    alternative_parameters: any;
  };
  rollback_config?: {               // For rollback strategy
    target_step: number;
    cleanup_actions: string[];
  };
}
```

**Output:**
```typescript
{
  recovery_result: {
    status: 'success' | 'partial_success' | 'failure';
    strategy_used: string;
    attempts_made: number;
    recovered_at_step: number;
  };
  execution_log: Array<{
    attempt: number;
    strategy: string;
    status: string;
    duration_ms: number;
    error?: string;
  }>;
  new_workflow_state: {
    current_step: number;
    state_snapshot: any;
    can_continue: boolean;
  };
  recommendations: {
    should_continue: boolean;
    next_steps: string[];
    warnings: string[];
  };
}
```

**Strategies:**

**Retry** - Automatic retry with exponential backoff:
```typescript
await executeRecovery({
  strategy: 'retry',
  workflow_state: { /* ... */ },
  retry_config: {
    max_attempts: 5,
    backoff_strategy: 'exponential',  // 1s, 2s, 4s, 8s, 16s
    initial_delay_ms: 1000,
    max_delay_ms: 60000
  }
});
```

**Rollback** - Revert to previous step and clean up:
```typescript
await executeRecovery({
  strategy: 'rollback',
  workflow_state: { /* ... */ },
  rollback_config: {
    target_step: 3,                   // Roll back to step 3
    cleanup_actions: [
      'delete_temp_files',
      'reset_database_transaction',
      'clear_cache'
    ]
  }
});
```

**Fallback** - Execute alternative path:
```typescript
await executeRecovery({
  strategy: 'fallback',
  workflow_state: { /* ... */ },
  fallback_config: {
    alternative_step: 'use_cached_data',
    alternative_parameters: {
      cache_key: 'user_data_backup',
      max_age_hours: 24
    }
  }
});
```

**Skip** - Skip failed step and continue:
```typescript
await executeRecovery({
  strategy: 'skip',
  workflow_state: { /* ... */ }
});
// Use for non-critical steps
```

---

### 3. `monitor_health`

Track workflow health metrics and predict failures before they occur.

**Input:**
```typescript
{
  workflow_id: string;
  metrics: {
    step_durations_ms: number[];
    error_count: number;
    warning_count: number;
    memory_usage_mb?: number;
    cpu_usage_percent?: number;
    api_call_count?: number;
  };
  thresholds?: {
    max_step_duration_ms: number;    // Default: 30000
    max_error_rate: number;          // Default: 0.2 (20%)
    max_memory_mb: number;           // Default: 1024
  };
  prediction_window_minutes: number; // Default: 5
}
```

**Output:**
```typescript
{
  health_status: {
    overall: 'healthy' | 'degraded' | 'critical';
    score: number;                    // 0-100
    confidence: number;               // 0-100
  };
  anomalies_detected: Array<{
    metric: string;
    current_value: number;
    expected_value: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  failure_prediction: {
    likely_to_fail: boolean;
    probability: number;              // 0-100
    predicted_failure_time_minutes?: number;
    predicted_failure_type?: string;
  };
  recommendations: {
    immediate_actions: string[];
    preventive_measures: string[];
  };
}
```

**Example:**
```typescript
const healthCheck = await monitorHealth({
  workflow_id: 'wf_prod_123',
  metrics: {
    step_durations_ms: [100, 150, 25000], // One very slow step!
    error_count: 5,
    warning_count: 10,
    memory_usage_mb: 950
  },
  thresholds: {
    max_step_duration_ms: 5000,
    max_error_rate: 0.1,
    max_memory_mb: 1024
  }
});

if (healthCheck.failure_prediction.likely_to_fail) {
  console.log(`Failure predicted in ${healthCheck.failure_prediction.predicted_failure_time_minutes} minutes`);
  console.log('Immediate actions:', healthCheck.recommendations.immediate_actions);
}
```

---

### 4. `generate_postmortem`

Create detailed failure analysis reports with root cause, timeline, and action items.

**Input:**
```typescript
{
  workflow_id: string;
  failure_data: {
    failed_step: string;
    error_message: string;
    stack_trace?: string;
    execution_history: Array<{
      step: string;
      status: string;
      duration_ms: number;
      timestamp: string;
    }>;
  };
  recovery_attempts: Array<{
    strategy: string;
    result: string;
    details: any;
  }>;
  context?: {
    user_id?: string;
    environment: 'dev' | 'staging' | 'production';
    agent_version: string;
  };
  include_recommendations: boolean;  // Default: true
}
```

**Output:**
```typescript
{
  postmortem: {
    incident_id: string;
    summary: string;                  // Executive summary
    timeline: Array<{
      timestamp: string;
      event: string;
      details: string;
    }>;
    root_cause_analysis: {
      primary_cause: string;
      contributing_factors: string[];
      why_it_happened: string;
    };
    impact_assessment: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      downtime_minutes?: number;
      cost_impact_usd?: number;
    };
    recovery_summary: {
      strategies_attempted: string[];
      successful_strategy?: string;
      total_recovery_time_ms: number;
    };
    lessons_learned: string[];
    action_items: Array<{
      priority: 'low' | 'medium' | 'high';
      action: string;
      owner?: string;
      deadline?: string;
    }>;
  };
  visualizations?: {
    execution_timeline_url: string;
    error_distribution_url: string;
  };
}
```

---

## 📊 Performance

- **Error Detection:** <100ms
- **Recovery Execution:** <500ms (retry), <100ms (rollback)
- **Health Monitoring:** <50ms
- **Postmortem Generation:** <2s

## 💰 Pricing

| Tier | Limit | Price |
|------|-------|-------|
| Free | 100 recoveries/month | $0 |
| Pro | Unlimited | $99/month |
| Enterprise | Unlimited + SLA | Custom |

## 🔒 Security

- No sensitive data stored
- All operations are stateless
- Audit logs available for compliance

## 📖 Documentation

- [Full API Documentation](https://docs.agentfoundry.ai/skills/error-recovery-orchestrator)
- [Examples & Use Cases](https://github.com/agentfoundry/skills/tree/main/examples/error-recovery)
- [Integration Guide](https://docs.agentfoundry.ai/guides/infrastructure-skills)

## 🤝 Support

- **Community:** [Discord](https://discord.gg/agentfoundry)
- **Issues:** [GitHub Issues](https://github.com/agentfoundry/skills/issues)
- **Enterprise:** enterprise@agentfoundry.ai

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by AgentFoundry** | [Website](https://agentfoundry.ai) | [Documentation](https://docs.agentfoundry.ai)
