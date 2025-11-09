const fs = require('fs');
const testFile = 'tests/error-recovery.test.ts';
let content = fs.readFileSync(testFile, 'utf8');

// Fix monitor_health tests - add prediction_window_minutes where missing
content = content.replace(
  /const input = \{[\s\S]*?workflow_id: 'wf_\d+',[\s\S]*?metrics: \{[\s\S]*?\},[\s\S]*?thresholds: \{[\s\S]*?\}[\s\S]*?\};[\s\S]*?const result = await monitorHealth\.run\(input\);/g,
  (match) => {
    if (!match.includes('prediction_window_minutes')) {
      // Add prediction_window_minutes before the closing };
      return match.replace(/\n      \};/, ',\n        prediction_window_minutes: 5\n      };');
    }
    return match;
  }
);

// Fix generatePostmortem tests - add include_recommendations where missing  
content = content.replace(
  /(const (?:input|productionInput) = \{[\s\S]*?recovery_attempts: \[[\s\S]*?\])([\s\S]*?\};[\s\S]*?const result = await generatePostmortem\.run\((?:input|productionInput)\);)/g,
  (match, p1, p2) => {
    if (!match.includes('include_recommendations')) {
      // Add include_recommendations before closing };
      return p1 + ',\n        include_recommendations: true' + p2;
    }
    return match;
  }
);

fs.writeFileSync(testFile, content);
console.log('Tests fixed!');
