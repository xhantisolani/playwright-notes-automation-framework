import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const allureCommandline = require('allure-commandline');

export default class AllureHtmlReporter {
  constructor(options = {}) {
    this.resultsDir = options.resultsDir;
    this.reportDir = options.reportDir;
  }

  printsToStdio() {
    return false;
  }

  async onEnd() {
    if (!this.resultsDir || !this.reportDir) {
      return;
    }

    if (!fs.existsSync(this.resultsDir)) {
      console.warn(
        `Allure HTML report skipped because ${path.relative(
          process.cwd(),
          this.resultsDir,
        )} was not created.`,
      );
      return;
    }

    console.log(`Generating Allure HTML report at ${path.relative(process.cwd(), this.reportDir)}`);

    await runAllure(['generate', this.resultsDir, '--clean', '-o', this.reportDir]);
  }
}

async function runAllure(args) {
  const child = allureCommandline(args);
  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`Allure report generation failed with exit code ${exitCode}.`);
  }
}
