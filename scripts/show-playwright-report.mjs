import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const reportRoot = path.resolve(process.cwd(), process.env.REPORT_ROOT?.trim() || 'reports');

function findLatestRunDir() {
  if (!fs.existsSync(reportRoot)) {
    console.error(`No report folder found at ${path.relative(process.cwd(), reportRoot)}.`);
    console.error('Run Playwright first, then run npm run report.');
    process.exit(1);
  }

  const runs = fs
    .readdirSync(reportRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(reportRoot, entry.name))
    .filter((runDir) => fs.existsSync(path.join(runDir, 'playwright-report')))
    .map((runDir) => ({
      runDir,
      modifiedAt: fs.statSync(path.join(runDir, 'playwright-report')).mtimeMs,
    }))
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  if (runs.length === 0) {
    console.error(
      `No Playwright HTML reports found under ${path.relative(process.cwd(), reportRoot)}.`,
    );
    console.error('Run Playwright first, then run npm run report.');
    process.exit(1);
  }

  return runs[0].runDir;
}

const runDir = findLatestRunDir();
const playwrightReportDir = path.join(runDir, 'playwright-report');
const playwrightCli = path.join(process.cwd(), 'node_modules', '@playwright', 'test', 'cli.js');

if (!fs.existsSync(playwrightReportDir)) {
  console.error(
    `No Playwright HTML report found at ${path.relative(process.cwd(), playwrightReportDir)}.`,
  );
  process.exit(1);
}

console.log(`Opening Playwright report for ${path.relative(process.cwd(), runDir)}`);

const result = spawnSync(process.execPath, [playwrightCli, 'show-report', playwrightReportDir], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
