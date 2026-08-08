#!/usr/bin/env node
// Sets package.json "version" to <YYYY.MM.DD>-<N>, where N is the count of
// commits already made today (on the current branch) plus one. Run from the
// pre-commit hook so every commit gets a fresh, date-stamped version and the
// bump is staged automatically.
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const pkgPath = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

const now = new Date()
const dateStr = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('.')

let commitsToday = 0
try {
  const out = execSync('git log --since=midnight --format=%H', { encoding: 'utf8' }).trim()
  commitsToday = out ? out.split('\n').length : 0
} catch {
  commitsToday = 0
}

pkg.version = `${dateStr}-${commitsToday + 1}`
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
execSync('git add package.json')

console.log(`Version bumped to ${pkg.version}`)
