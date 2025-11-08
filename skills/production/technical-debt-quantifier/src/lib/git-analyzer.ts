import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Git repository analysis for change frequency and history
 */

interface FileHistory {
  filePath: string;
  changeCount: number;
  lastModified: Date;
  authors: string[];
}

export class GitAnalyzer {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  /**
   * Clone repository to temporary location
   */
  static async cloneRepository(repoUrl: string, branch: string = 'main'): Promise<GitAnalyzer> {
    const tempDir = path.join('/tmp', `repo-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const git = simpleGit();
    await git.clone(repoUrl, tempDir, ['--branch', branch, '--depth', '100']);

    return new GitAnalyzer(tempDir);
  }

  /**
   * Get change frequency for a file (commits in last 6 months)
   */
  async getFileChangeFrequency(filePath: string): Promise<number> {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const log = await this.git.log({
        file: filePath,
        '--since': sixMonthsAgo.toISOString(),
      });

      return log.total;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get all files in repository
   */
  async getAllFiles(): Promise<string[]> {
    const files: string[] = [];

    async function traverse(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules, .git, dist, etc.
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === 'coverage'
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await traverse(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }

    await traverse(this.repoPath);
    return files;
  }

  /**
   * Get file history
   */
  async getFileHistory(filePath: string): Promise<FileHistory> {
    try {
      const log = await this.git.log({ file: filePath });

      const authors = new Set<string>();
      for (const commit of log.all) {
        authors.add(commit.author_name);
      }

      return {
        filePath,
        changeCount: log.total,
        lastModified: log.latest ? new Date(log.latest.date) : new Date(),
        authors: Array.from(authors),
      };
    } catch (error) {
      return {
        filePath,
        changeCount: 0,
        lastModified: new Date(),
        authors: [],
      };
    }
  }

  /**
   * Get repository path
   */
  getRepoPath(): string {
    return this.repoPath;
  }

  /**
   * Cleanup repository
   */
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.repoPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}
