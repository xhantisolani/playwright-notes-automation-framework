import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const allureCommandline = require('allure-commandline');
const reportRoot = path.resolve(process.cwd(), process.env.REPORT_ROOT?.trim() || 'reports');
const shouldOpen = process.argv.includes('--open');
const shouldGenerateAll = process.argv.includes('--all');
const runOption = readOption('--run');

function readOption(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function resolveRunDir(run) {
  if (!run) {
    return findLatestRunDir();
  }

  const directPath = path.isAbsolute(run) ? run : path.resolve(reportRoot, run);

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  const relativePath = path.resolve(process.cwd(), run);

  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  console.error(`Report run not found: ${run}`);
  process.exit(1);
}

function findLatestRunDir() {
  if (!fs.existsSync(reportRoot)) {
    console.error(`No report folder found at ${path.relative(process.cwd(), reportRoot)}.`);
    console.error('Run Playwright first, then run npm run report:allure:open.');
    process.exit(1);
  }

  const runs = fs
    .readdirSync(reportRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(reportRoot, entry.name))
    .filter((runDir) => fs.existsSync(path.join(runDir, 'allure-results')))
    .map((runDir) => ({
      runDir,
      modifiedAt: fs.statSync(path.join(runDir, 'allure-results')).mtimeMs,
    }))
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  if (runs.length === 0) {
    console.error(`No Allure results found under ${path.relative(process.cwd(), reportRoot)}.`);
    console.error('Run Playwright first, then run npm run report:allure:open.');
    process.exit(1);
  }

  return runs[0].runDir;
}

async function runAllure(args) {
  const child = allureCommandline(args);
  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });

  if (exitCode !== 0) {
    process.exit(exitCode ?? 1);
  }
}

const runDir = resolveRunDir(runOption);

if (shouldGenerateAll) {
  for (const historicalRunDir of findAllRunDirs()) {
    await generateAllureReport(historicalRunDir);
  }
} else {
  await generateAllureReport(runDir);
}

if (shouldOpen) {
  await runAllure(['open', path.join(runDir, 'allure-report')]);
}

function findAllRunDirs() {
  if (!fs.existsSync(reportRoot)) {
    console.error(`No report folder found at ${path.relative(process.cwd(), reportRoot)}.`);
    process.exit(1);
  }

  return fs
    .readdirSync(reportRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(reportRoot, entry.name))
    .filter((historicalRunDir) => fs.existsSync(path.join(historicalRunDir, 'allure-results')))
    .sort();
}

async function generateAllureReport(historicalRunDir) {
  const allureResultsDir = path.join(historicalRunDir, 'allure-results');
  const allureReportDir = path.join(historicalRunDir, 'allure-report');

  if (!fs.existsSync(allureResultsDir)) {
    console.error(`No Allure results found at ${path.relative(process.cwd(), allureResultsDir)}.`);
    process.exit(1);
  }

  console.log(`Generating Allure report for ${path.relative(process.cwd(), historicalRunDir)}`);
  await runAllure([
    'generate',
    allureResultsDir,
    '--clean',
    '--single-file',
    '-o',
    allureReportDir,
  ]);
}
