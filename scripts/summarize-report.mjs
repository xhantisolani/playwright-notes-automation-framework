import fs from 'node:fs';
import path from 'node:path';

const reportRoot = path.resolve(process.cwd(), process.env.REPORT_ROOT?.trim() || 'reports');
const runOption = readOption('--run');
const reportPath = path.join(resolveRunDir(runOption), 'test-results', 'results.json');

if (!fs.existsSync(reportPath)) {
  console.error(`No Playwright JSON report found at ${path.relative(process.cwd(), reportPath)}.`);
  console.error('Run npm test first, then run npm run report:summary.');
  process.exit(1);
}

function readOption(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function resolveRunDir(run) {
  if (run) {
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

  if (!fs.existsSync(reportRoot)) {
    console.error(`No report folder found at ${path.relative(process.cwd(), reportRoot)}.`);
    console.error('Run npm test first, then run npm run report:summary.');
    process.exit(1);
  }

  const runs = fs
    .readdirSync(reportRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(reportRoot, entry.name))
    .filter((runDir) => fs.existsSync(path.join(runDir, 'test-results', 'results.json')))
    .map((runDir) => ({
      runDir,
      modifiedAt: fs.statSync(path.join(runDir, 'test-results', 'results.json')).mtimeMs,
    }))
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  if (runs.length === 0) {
    console.error(
      `No Playwright JSON reports found under ${path.relative(process.cwd(), reportRoot)}.`,
    );
    console.error('Run npm test first, then run npm run report:summary.');
    process.exit(1);
  }

  return runs[0].runDir;
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const tests = [];

function collectSpecs(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const result = test.results?.at(-1);
      tests.push({
        title: spec.title,
        file: spec.file,
        project: test.projectName,
        status: result?.status ?? 'unknown',
        duration: result?.duration ?? 0,
      });
    }
  }

  for (const child of suite.suites ?? []) {
    collectSpecs(child);
  }
}

for (const suite of report.suites ?? []) {
  collectSpecs(suite);
}

const summary = tests.reduce(
  (acc, test) => {
    acc.total += 1;
    acc[test.status] = (acc[test.status] ?? 0) + 1;
    acc.duration += test.duration;
    return acc;
  },
  { total: 0, duration: 0 },
);

const failedTests = tests.filter((test) => test.status !== 'passed' && test.status !== 'skipped');
const seconds = (summary.duration / 1000).toFixed(1);

console.log('Playwright Test Summary');
console.log('=======================');
console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);
console.log(`Total: ${summary.total}`);
console.log(`Passed: ${summary.passed ?? 0}`);
console.log(`Failed: ${summary.failed ?? 0}`);
console.log(`Timed out: ${summary.timedOut ?? 0}`);
console.log(`Skipped: ${summary.skipped ?? 0}`);
console.log(`Duration: ${seconds}s`);
console.log('');

if (failedTests.length === 0) {
  console.log('Result: All tested Notes App and Notes API scenarios passed.');
} else {
  console.log('Failures:');
  for (const test of failedTests) {
    console.log(`- [${test.project}] ${test.title} (${test.status})`);
  }
}
