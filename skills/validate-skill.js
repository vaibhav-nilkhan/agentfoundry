#!/usr/bin/env node
/**
 * Skill Validation Script
 *
 * Validates AgentFoundry Skills against SKILL_SPECIFICATION.md requirements
 *
 * Usage: node validate-skill.js <skill-path>
 */

const fs = require('fs');
const path = require('path');

class SkillValidator {
  constructor(skillPath) {
    this.skillPath = skillPath;
    this.errors = [];
    this.warnings = [];
    this.checks = {
      manifest: false,
      readme: false,
      tools: false,
      tests: false,
      build: false,
    };
  }

  async validate() {
    console.log(`\n🔍 Validating skill at: ${this.skillPath}\n`);

    // 1. Check required files exist
    this.checkRequiredFiles();

    // 2. Validate skill.yaml manifest
    await this.validateManifest();

    // 3. Validate README
    this.validateReadme();

    // 4. Validate tools
    this.validateTools();

    // 5. Validate tests
    this.validateTests();

    // 6. Check build artifacts
    this.checkBuild();

    const passed = this.errors.length === 0;
    const score = this.calculateScore();

    return {
      skill_name: path.basename(this.skillPath),
      passed,
      score,
      errors: this.errors,
      warnings: this.warnings,
      checks: this.checks,
    };
  }

  checkRequiredFiles() {
    const requiredFiles = [
      'skill.yaml',
      'README.md',
      'package.json',
      'tsconfig.json',
      'src/tools',
      'tests',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.skillPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`Missing required file: ${file}`);
      }
    }
  }

  async validateManifest() {
    const manifestPath = path.join(this.skillPath, 'skill.yaml');

    if (!fs.existsSync(manifestPath)) {
      this.errors.push('skill.yaml not found');
      return;
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');

      // Basic YAML validation (check for required fields as strings)
      const requiredFields = [
        'schema_version',
        'name:',
        'version:',
        'description:',
        'author:',
        'platforms:',
        'permissions:',
        'categories:',
        'tags:',
        'tools:',
        'dependencies:',
        'pricing:',
      ];

      for (const field of requiredFields) {
        if (!content.includes(field)) {
          this.errors.push(`Missing required field in skill.yaml: ${field}`);
        }
      }

      // Validate schema_version
      if (!content.includes('schema_version: "1.0"')) {
        this.errors.push('schema_version must be "1.0"');
      }

      // Check for tools definition
      const toolMatches = content.match(/- name: \w+/g);
      if (!toolMatches || toolMatches.length === 0) {
        this.errors.push('No tools defined in skill.yaml');
      } else {
        console.log(`  Found ${toolMatches.length} tool(s) defined`);
      }

      this.checks.manifest = this.errors.length === 0;
    } catch (error) {
      this.errors.push(`Failed to read skill.yaml: ${error.message}`);
    }
  }

  validateReadme() {
    const readmePath = path.join(this.skillPath, 'README.md');

    if (!fs.existsSync(readmePath)) {
      this.errors.push('README.md not found');
      return;
    }

    const content = fs.readFileSync(readmePath, 'utf-8');

    // Check for required sections
    const requiredSections = [
      '## Overview',
      '## Features',
      '## Installation',
      '## Usage',
      '## Tools',
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        this.warnings.push(`README missing recommended section: ${section}`);
      }
    }

    // Check minimum length
    if (content.length < 500) {
      this.warnings.push('README should be more detailed (at least 500 characters)');
    }

    this.checks.readme = true;
  }

  validateTools() {
    const toolsDir = path.join(this.skillPath, 'src/tools');

    if (!fs.existsSync(toolsDir)) {
      this.errors.push('src/tools directory not found');
      return;
    }

    const toolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.ts'));

    if (toolFiles.length === 0) {
      this.errors.push('No tool files found in src/tools/');
      return;
    }

    console.log(`  Found ${toolFiles.length} tool file(s)`);

    // Check each tool exports a run function
    for (const toolFile of toolFiles) {
      const toolPath = path.join(toolsDir, toolFile);
      const content = fs.readFileSync(toolPath, 'utf-8');

      if (!content.includes('export async function run(')) {
        this.errors.push(`Tool ${toolFile} must export async function run()`);
      }

      if (!content.includes('import { z } from \'zod\'')) {
        this.warnings.push(`Tool ${toolFile} should use Zod for input validation`);
      }
    }

    this.checks.tools = toolFiles.length > 0;
  }

  validateTests() {
    const testsDir = path.join(this.skillPath, 'tests');

    if (!fs.existsSync(testsDir)) {
      this.errors.push('tests directory not found');
      return;
    }

    const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.ts'));

    if (testFiles.length === 0) {
      this.warnings.push('No test files found - tests are recommended');
    } else {
      console.log(`  Found ${testFiles.length} test file(s)`);
    }

    this.checks.tests = testFiles.length > 0;
  }

  checkBuild() {
    const distDir = path.join(this.skillPath, 'dist');

    if (fs.existsSync(distDir)) {
      const distFiles = fs.readdirSync(distDir);
      this.checks.build = distFiles.length > 0;
      if (this.checks.build) {
        console.log(`  Build artifacts found: ${distFiles.length} file(s)`);
      }
    } else {
      this.warnings.push('dist directory not found - run build first');
    }
  }

  calculateScore() {
    const maxScore = 100;
    let score = maxScore;

    // Deduct points for errors (10 points each)
    score -= this.errors.length * 10;

    // Deduct points for warnings (2 points each)
    score -= this.warnings.length * 2;

    // Bonus points for passing checks
    const checksScore = Object.values(this.checks).filter(Boolean).length * 5;

    return Math.max(0, Math.min(maxScore, score + checksScore));
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node validate-skill.js <skill-path>');
    process.exit(1);
  }

  const skillPath = path.resolve(args[0]);

  if (!fs.existsSync(skillPath)) {
    console.error(`Error: Skill path does not exist: ${skillPath}`);
    process.exit(1);
  }

  const validator = new SkillValidator(skillPath);
  const result = await validator.validate();

  // Print results
  console.log('═'.repeat(60));
  console.log(`📊 Validation Results for: ${result.skill_name}`);
  console.log('═'.repeat(60));
  console.log(`\n${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Score: ${result.score}/100\n`);

  console.log('Checks:');
  for (const [check, passed] of Object.entries(result.checks)) {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  }

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach(error => console.log(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach(warning => console.log(`  • ${warning}`));
  }

  console.log('\n' + '═'.repeat(60) + '\n');

  process.exit(result.passed ? 0 : 1);
}

main().catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});
