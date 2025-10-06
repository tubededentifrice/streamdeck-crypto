#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildPlugin } = require('./build');

const repoRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const devManifestPath = path.join(repoRoot, 'com.courcelle.cryptoticker-dev.sdPlugin', 'manifest.json');
const devManifestDevPath = path.join(repoRoot, 'com.courcelle.cryptoticker-dev.sdPlugin', 'manifest.dev.json');
const pubManifestPath = path.join(repoRoot, 'com.courcelle.cryptoticker-dev.sdPlugin', 'manifest.pub.json');
const changelogPath = path.join(repoRoot, 'CHANGELOG.md');

const RELEASE_TYPES = new Set(['patch', 'minor', 'major']);
const SECTION_TITLES = [
  'Features',
  'Fixes',
  'Performance',
  'Refactoring',
  'Documentation',
  'Tests',
  'Build',
  'CI',
  'Chores',
  'Style',
  'Other changes',
];

const TYPE_TO_SECTION = {
  feat: 'Features',
  fix: 'Fixes',
  perf: 'Performance',
  refactor: 'Refactoring',
  docs: 'Documentation',
  doc: 'Documentation',
  test: 'Tests',
  build: 'Build',
  ci: 'CI',
  chore: 'Chores',
  style: 'Style',
};

function fail(message, error) {
  console.error(`\n✖ ${message}`);
  if (error) {
    console.error(error.message || error);
  }
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data, indent = 2) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, indent)}\n`);
}

function bumpVersion(version, releaseType) {
  const parts = version.split('.').map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) {
    fail(`Unsupported version format in package.json: ${version}`);
  }

  const [major, minor, patch] = parts;
  switch (releaseType) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      fail(`Unknown release type: ${releaseType}`);
  }
}

function toManifestVersion(version) {
  const [major, minor, patch] = version.split('.');
  if ([major, minor, patch].some((part) => part === undefined)) {
    fail(`Cannot convert ${version} to Stream Deck manifest version`);
  }
  return `${Number(major)}.${Number(minor)}.${Number(patch)}.0`;
}

function findPreviousReleaseCommit(targetVersion) {
  const searchToken = `"version": "${targetVersion}"`;
  const result = spawnSync(
    'git',
    ['log', '-1', '--format=%H', '-S', searchToken, '--', 'package.json'],
    { cwd: repoRoot, encoding: 'utf8' }
  );

  if (result.status !== 0 || !result.stdout.trim()) {
    return null;
  }

  return result.stdout.trim();
}

function collectCommitsSince(commitish) {
  const sections = new Map();
  SECTION_TITLES.forEach((title) => sections.set(title, []));

  const format = '%H%x01%s%x01%b%x02';
  const args = ['log', '--no-merges', `--pretty=format:${format}`];
  if (commitish) {
    args.push(`${commitish}..HEAD`);
  }

  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    fail('Unable to read git history. Make sure git is available and this is a repository.');
  }

  const entries = result.stdout.split('\x02').map((line) => line.trim()).filter(Boolean);
  entries.forEach((entry) => {
    const [hash, subject, body = ''] = entry.split('\x01');
    if (!hash || !subject) {
      return;
    }

    const parsed = parseConventionalCommit(subject, body);
    const section = TYPE_TO_SECTION[parsed.type] || 'Other changes';
    const bucket = sections.get(section) || sections.get('Other changes');
    bucket.push(formatChangelogLine(parsed, hash));
  });

  return sections;
}

function parseConventionalCommit(subject, body) {
  const match = subject.match(/^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/);
  if (!match) {
    return {
      type: 'other',
      scope: null,
      description: subject.trim(),
      breaking: /BREAKING CHANGE/i.test(body),
    };
  }

  const { type, scope, breaking, description } = match.groups;
  const bodyIndicatesBreaking = /BREAKING CHANGE/i.test(body || '');
  return {
    type: type.toLowerCase(),
    scope: scope ? scope.trim() : null,
    description: description.trim(),
    breaking: Boolean(breaking) || bodyIndicatesBreaking,
  };
}

function formatChangelogLine(commit, hash) {
  const shortHash = hash.slice(0, 7);
  const scopeSuffix = commit.scope ? ` (${commit.scope})` : '';
  const breakingPrefix = commit.breaking ? 'BREAKING: ' : '';
  return `- ${breakingPrefix}${commit.description}${scopeSuffix} (${shortHash})`;
}

function buildChangelogEntry(sections, newVersion) {
  const date = new Date().toISOString().split('T')[0];
  const lines = [`## ${newVersion} - ${date}`];

  const hasContent = SECTION_TITLES.some((title) => (sections.get(title) || []).length > 0);
  if (!hasContent) {
    lines.push('\n- No notable changes.');
    return `${lines.join('\n')}\n`;
  }

  SECTION_TITLES.forEach((title) => {
    const items = sections.get(title);
    if (!items || items.length === 0) {
      return;
    }

    lines.push(`\n### ${title}`);
    lines.push(items.join('\n'));
  });

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function updateChangelogFile(entry) {
  let existingBody = '';
  if (fs.existsSync(changelogPath)) {
    const raw = fs.readFileSync(changelogPath, 'utf8');
    if (raw.startsWith('# Changelog')) {
      existingBody = raw.slice('# Changelog'.length).trimStart();
    } else {
      existingBody = raw.trimStart();
    }
  }

  const contentParts = ['# Changelog', '', entry.trimEnd()];
  if (existingBody) {
    contentParts.push('', existingBody.trimEnd());
  }
  contentParts.push('');

  fs.writeFileSync(changelogPath, `${contentParts.join('\n')}\n`);
}

function ensureCleanWorkingTree() {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    fail('Unable to determine git status.');
  }
  if (result.stdout.trim()) {
    console.warn('\n⚠️  Working tree is not clean. Uncommitted changes will be included in the release.');
  }
}

async function main() {
  const releaseType = process.argv[2];
  if (!RELEASE_TYPES.has(releaseType)) {
    console.log('Usage: node scripts/release.js <patch|minor|major>');
    process.exit(1);
  }

  ensureCleanWorkingTree();

  const packageJson = readJson(packageJsonPath);
  const previousVersion = packageJson.version;
  const nextVersion = bumpVersion(previousVersion, releaseType);

  packageJson.version = nextVersion;
  writeJson(packageJsonPath, packageJson, 2);

  const manifestVersion = toManifestVersion(nextVersion);
  updateManifestVersion(devManifestPath, manifestVersion, 4);
  updateManifestVersion(pubManifestPath, manifestVersion, 4);
  if (fs.existsSync(devManifestDevPath)) {
    updateManifestVersion(devManifestDevPath, manifestVersion, 4);
  }

  const previousReleaseCommit = findPreviousReleaseCommit(previousVersion);
  const sections = collectCommitsSince(previousReleaseCommit);
  const changelogEntry = buildChangelogEntry(sections, nextVersion);
  updateChangelogFile(changelogEntry);

  const { packagePath } = await buildPlugin({ skipPackage: false, stageRelease: true });

  console.log(`\n✔ Release ${nextVersion} ready.`);
  console.log(`   - Changelog updated at CHANGELOG.md`);
  console.log(`   - Package created at ${packagePath}`);
  console.log('\nNext steps:');
  console.log('  1. Review git diff and commit the release changes.');
  console.log('  2. Create a git tag (e.g., v' + nextVersion + ').');
  console.log('  3. Share the generated .streamDeckPlugin file.');
}

function updateManifestVersion(manifestPath, manifestVersion, indent) {
  const manifest = readJson(manifestPath);
  manifest.Version = manifestVersion;
  writeJson(manifestPath, manifest, indent);
}

main().catch((error) => fail('Release failed', error));
