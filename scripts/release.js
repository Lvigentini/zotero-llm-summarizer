#!/usr/bin/env node
/**
 * Cross-platform release script for Zotero LLM Summarizer
 * Usage: node scripts/release.js <version> "<description>"
 * Or via npm: npm run release -- 1.2.1 "Bug fixes"
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function run(command, silent = false) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    })
  } catch (error) {
    if (!silent) {
      log('red', `Error running: ${command}`)
      process.exit(1)
    }
    return ''
  }
}

// Parse arguments
const args = process.argv.slice(2)
if (args.length === 0) {
  log('red', 'Error: Version number required')
  console.log('Usage: npm run release -- <version> "<description>"')
  console.log('Example: npm run release -- 1.2.1 "Bug fixes"')
  process.exit(1)
}

const VERSION = args[0]
const DESCRIPTION = args[1] || `Release v${VERSION}`
const TAG = `v${VERSION}`

log('yellow', `\n🚀 Starting release process for v${VERSION}\n`)

// Step 0: Collect commit history
log('green', '[0/7] Collecting commit history...')
let lastTag = ''
try {
  lastTag = run('git describe --tags --abbrev=0 2>nul || echo ""', true).trim()
} catch (e) {
  lastTag = ''
}

let commits = []
if (lastTag) {
  console.log(`  Changes since ${colors.cyan}${lastTag}${colors.reset}:`)
  try {
    const commitLog = run(`git log --oneline ${lastTag}..HEAD --no-merges`, true).trim()
    if (commitLog) {
      commits = commitLog.split('\n').filter(Boolean)
      commits.forEach(c => console.log(`    - ${c}`))
    } else {
      console.log('    (no commits since last tag)')
    }
  } catch (e) {
    console.log('    (could not read commit history)')
  }
} else {
  console.log('  (first release - no previous tags)')
  try {
    const commitLog = run('git log --oneline --no-merges -20', true).trim()
    if (commitLog) {
      commits = commitLog.split('\n').filter(Boolean)
      commits.forEach(c => console.log(`    - ${c}`))
    }
  } catch (e) {}
}
console.log('')

// Step 1: Update package.json version
log('green', '[1/7] Updating version in package.json...')
const packagePath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
packageJson.version = VERSION
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')
console.log(`  ✓ Version set to ${VERSION}`)

// Step 2: Build
log('green', '[2/7] Building plugin...')
run('npm run build')
console.log('  ✓ Build complete')

// Step 3: Copy clean XPI
log('green', '[3/7] Creating clean XPI...')
const xpiDir = path.join(process.cwd(), 'xpi')
const files = fs.readdirSync(xpiDir)
const xpiSource = files.find(f => f.startsWith(`zotero-llm-summarizer-${VERSION}.`) && f.endsWith('.xpi') && f.split('.').length > 3)

if (!xpiSource) {
  log('red', 'Error: Could not find built XPI file')
  process.exit(1)
}

const xpiClean = `zotero-llm-summarizer-${VERSION}.xpi`
fs.copyFileSync(path.join(xpiDir, xpiSource), path.join(xpiDir, xpiClean))
console.log(`  ✓ Created xpi/${xpiClean}`)

// Step 4: Git add
log('green', '[4/7] Staging changes...')
run('git add -A')
console.log('  ✓ Changes staged')

// Step 5: Commit
log('green', '[5/7] Committing...')
const commitMessage = `Release ${TAG} - ${DESCRIPTION}\n\nCo-Authored-By: Claude <noreply@anthropic.com>`
run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`)
console.log('  ✓ Committed')

// Step 6: Tag
log('green', '[6/7] Creating tag ' + TAG + '...')
run(`git tag -a "${TAG}" -m "Version ${VERSION} - ${DESCRIPTION}"`)
console.log('  ✓ Tag created')

// Step 7: Push
log('green', '[7/7] Pushing to remote...')
run('git push')
run('git push --tags')
console.log('  ✓ Pushed to GitHub')

// Done - show next steps
log('green', `\n✅ Release ${TAG} complete!\n`)

log('yellow', '📝 Next steps:')
console.log('1. Go to: https://github.com/Lvigentini/zotero-llm-summarizer/releases')
console.log("2. Click 'Draft a new release'")
console.log(`3. Select tag: ${TAG}`)
console.log(`4. Title: ${TAG} - ${DESCRIPTION}`)
console.log(`5. Upload: xpi/${xpiClean}`)
console.log("6. Click 'Publish release'")

log('yellow', '\n📋 Suggested Release Notes:')
console.log('----------------------------------------')
console.log(`## ${TAG} - ${DESCRIPTION}`)
console.log('')
console.log('### Changes')
if (commits.length > 0) {
  commits.forEach(c => {
    // Remove commit hash, keep just the message
    const msg = c.replace(/^[a-f0-9]+ /, '')
    console.log(`- ${msg}`)
  })
} else {
  console.log(`- ${DESCRIPTION}`)
}
console.log('')
console.log('### Installation')
console.log(`Download \`zotero-llm-summarizer-${VERSION}.xpi\` below and install in Zotero:`)
console.log('**Tools → Add-ons → ⚙️ → Install Add-on From File**')
console.log('----------------------------------------')
console.log('')
