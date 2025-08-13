#!/usr/bin/env node
/**
 * Creates GitHub issues from a Markdown checklist file using the GitHub CLI (`gh`).
 *
 * Usage:
 *   node scripts/create_issues_from_todo.js docs/PRODUCTION_TODO.md --repo owner/repo --label production --dry-run
 *
 * Requirements:
 *   - GitHub CLI installed and authenticated: https://cli.github.com/
 *   - Node.js 16+
 */

const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node scripts/create_issues_from_todo.js <markdownPath> [--repo owner/repo] [--label label1,label2] [--dry-run]');
  process.exit(1);
}

const filePath = args[0];
const repoArg = args.find(a => a.startsWith('--repo')) || '';
const labelArg = args.find(a => a.startsWith('--label')) || '';
const dryRun = args.includes('--dry-run');

const repo = repoArg ? repoArg.split(' ')[1] || repoArg.split('=')[1] : '';
const labels = labelArg ? (labelArg.split(' ')[1] || labelArg.split('=')[1] || '').split(',').filter(Boolean) : [];

const content = fs.readFileSync(filePath, 'utf8');

// Parse sections (## Heading) and TODO items (- [ ])
const lines = content.split(/\r?\n/);
let currentSection = '';
const items = [];

for (const line of lines) {
  const h2 = line.match(/^##\s+(.*)/);
  if (h2) {
    currentSection = h2[1].trim();
    continue;
  }
  const todo = line.match(/^- \[ \] (.*)/); // unchecked items only
  if (todo) {
    const title = todo[1].trim();
    items.push({ section: currentSection, title });
  }
}

if (items.length === 0) {
  console.log('No unchecked TODO items found.');
  process.exit(0);
}

console.log(`Found ${items.length} TODO items. Creating issues...`);

for (const it of items) {
  const issueTitle = it.section ? `[${it.section}] ${it.title}` : it.title;
  const issueBody = `Imported from ${filePath}\n\nSection: ${it.section || 'General'}\n\n- [ ] Tracked in master TODO\n`;
  const baseCmd = ['gh', 'issue', 'create', '--title', JSON.stringify(issueTitle), '--body', JSON.stringify(issueBody)];
  if (repo) baseCmd.push('--repo', repo);
  if (labels.length) baseCmd.push('--label', labels.join(','));
  const cmd = baseCmd.join(' ');
  if (dryRun) {
    console.log('[Dry Run]', cmd);
  } else {
    try {
      const out = execSync(cmd, { stdio: 'pipe' });
      process.stdout.write(out);
    } catch (e) {
      console.error('Failed to create issue for:', issueTitle);
      console.error(e.message);
    }
  }
}

console.log('Done.');

