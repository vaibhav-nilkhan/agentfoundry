import { Command } from 'commander';
import chalk from 'chalk';
import { benchmarkService } from '../services/benchmarkService';

export const benchmarkCommand = new Command()
    .name('benchmark')
    .description('Run multiple agents on the same task and compare results')
    .argument('<prompt>', 'The prompt/task to give to the agents')
    .option('-a, --agents <agents>', 'Comma-separated list of agents to run', 'claude-code,codex')
    .action(async (prompt, options) => {
        const agentList = options.agents.split(',').map((a: string) => a.trim());
        
        try {
            const results = await benchmarkService.runBenchmark(prompt, agentList);

            if (results.length === 0) {
                console.log(chalk.red('\nNo benchmark results collected.'));
                return;
            }

            console.log(chalk.cyan('\n🏆 Benchmark Results Summary'));
            console.log(chalk.dim('━'.repeat(60)));

            // Sort by a simple heuristic: Success -> Tests -> Speed
            const sorted = [...results].sort((a, b) => {
                if (a.success !== b.success) return a.success ? -1 : 1;
                if (a.testsPassed !== b.testsPassed) return b.testsPassed - a.testsPassed;
                return a.durationSeconds - b.durationSeconds;
            });

            console.log(
                chalk.bold('Agent').padEnd(15) + 
                chalk.bold('Status').padEnd(12) + 
                chalk.bold('Time').padEnd(10) + 
                chalk.bold('Cost').padEnd(10) + 
                chalk.bold('Tests')
            );

            sorted.forEach((res, index) => {
                const color = index === 0 && res.success ? chalk.green : chalk.white;
                const status = res.success ? chalk.green('PASS') : chalk.red('FAIL');
                
                console.log(
                    color(res.agentName.padEnd(15)) + 
                    status.padEnd(21) + // Adjust for ANSI codes
                    `${res.durationSeconds}s`.padEnd(10) + 
                    `$${res.costUsd.toFixed(3)}`.padEnd(10) + 
                    `${res.testsPassed}/${res.testsPassed + res.testsFailed}`
                );
            });

            console.log(chalk.dim('━'.repeat(60)));
            const winner = sorted[0];
            if (winner.success) {
                console.log(chalk.bold.yellow(`\n🌟 WINNER: ${winner.agentName.toUpperCase()}`));
            } else {
                console.log(chalk.yellow('\n⚠️ All agents failed the quality checks.'));
            }

        } catch (error) {
            console.error(chalk.red(`\nBenchmark failed: ${error}`));
            process.exit(1);
        }
    });
