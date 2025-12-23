/**
 * Tests for the generate command
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { parseGenerateFlags } from '../../src/dd/generate.mjs'

// ============================================================================
// Flag Parsing Tests
// ============================================================================

test('parseGenerateFlags: parses --description flag', () => {
  const flags = parseGenerateFlags(['--description', 'A test project'])
  assert.equal(flags.description, 'A test project')
})

test('parseGenerateFlags: parses -d short flag', () => {
  const flags = parseGenerateFlags(['-d', 'A test project'])
  assert.equal(flags.description, 'A test project')
})

test('parseGenerateFlags: parses --name flag', () => {
  const flags = parseGenerateFlags(['--name', 'my-project'])
  assert.equal(flags.name, 'my-project')
})

test('parseGenerateFlags: parses -n short flag', () => {
  const flags = parseGenerateFlags(['-n', 'my-project'])
  assert.equal(flags.name, 'my-project')
})

test('parseGenerateFlags: parses --template flag', () => {
  const flags = parseGenerateFlags(['--template', 'saas'])
  assert.equal(flags.template, 'saas')
})

test('parseGenerateFlags: parses -t short flag', () => {
  const flags = parseGenerateFlags(['-t', 'flagship-saas'])
  assert.equal(flags.template, 'flagship-saas')
})

test('parseGenerateFlags: parses --tier flag with valid value', () => {
  const flags = parseGenerateFlags(['--tier', 'quality'])
  assert.equal(flags.tier, 'quality')
})

test('parseGenerateFlags: ignores invalid tier value', () => {
  const flags = parseGenerateFlags(['--tier', 'invalid'])
  assert.equal(flags.tier, 'balanced') // Default value
})

test('parseGenerateFlags: parses --output flag', () => {
  const flags = parseGenerateFlags(['--output', './my-dir'])
  assert.equal(flags.output, './my-dir')
})

test('parseGenerateFlags: parses -o short flag', () => {
  const flags = parseGenerateFlags(['-o', '/path/to/output'])
  assert.equal(flags.output, '/path/to/output')
})

test('parseGenerateFlags: parses --no-stream flag', () => {
  const flags = parseGenerateFlags(['--no-stream'])
  assert.equal(flags.stream, false)
})

test('parseGenerateFlags: stream defaults to true', () => {
  const flags = parseGenerateFlags([])
  assert.equal(flags.stream, true)
})

test('parseGenerateFlags: parses --vision flag', () => {
  const flags = parseGenerateFlags(['--vision', 'To be the best'])
  assert.equal(flags.vision, 'To be the best')
})

test('parseGenerateFlags: parses --mission flag', () => {
  const flags = parseGenerateFlags(['--mission', 'Help people'])
  assert.equal(flags.mission, 'Help people')
})

test('parseGenerateFlags: parses multiple flags together', () => {
  const flags = parseGenerateFlags([
    '-d', 'A fitness app',
    '-n', 'fittrack',
    '-t', 'saas',
    '--tier', 'fast',
    '-o', './output',
    '--no-stream',
  ])

  assert.equal(flags.description, 'A fitness app')
  assert.equal(flags.name, 'fittrack')
  assert.equal(flags.template, 'saas')
  assert.equal(flags.tier, 'fast')
  assert.equal(flags.output, './output')
  assert.equal(flags.stream, false)
})

test('parseGenerateFlags: returns defaults for empty args', () => {
  const flags = parseGenerateFlags([])

  assert.equal(flags.description, null)
  assert.equal(flags.name, null)
  assert.equal(flags.template, null)
  assert.equal(flags.tier, 'balanced')
  assert.equal(flags.output, './')
  assert.equal(flags.stream, true)
  assert.equal(flags.vision, null)
  assert.equal(flags.mission, null)
})

test('parseGenerateFlags: does not consume flags without values', () => {
  // If a flag is at the end without a value, it should not crash
  const flags = parseGenerateFlags(['--description'])
  assert.equal(flags.description, null)
})

test('parseGenerateFlags: does not consume next flag as value', () => {
  // If --description is followed by another flag, it should not consume it
  const flags = parseGenerateFlags(['--description', '--name', 'project'])
  assert.equal(flags.description, null)
  assert.equal(flags.name, 'project')
})

// ============================================================================
// Integration Tests (CLI Interface)
// ============================================================================

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLI_PATH = path.resolve(__dirname, '../../bin/framework.js')

function runCLI(args, env = {}) {
  const result = spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    timeout: 10000,
  })
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status,
  }
}

test('generate: --help shows usage', () => {
  const { stdout, exitCode } = runCLI(['generate', '--help'])
  
  assert.equal(exitCode, 0)
  assert.ok(stdout.includes('Usage: framework generate'))
  assert.ok(stdout.includes('--description'))
  assert.ok(stdout.includes('--name'))
  assert.ok(stdout.includes('--tier'))
  assert.ok(stdout.includes('ANTHROPIC_API_KEY'))
})

test('generate: -h shows usage', () => {
  const { stdout, exitCode } = runCLI(['generate', '-h'])
  
  assert.equal(exitCode, 0)
  assert.ok(stdout.includes('Usage: framework generate'))
})

test('generate: help shows usage', () => {
  const { stdout, exitCode } = runCLI(['generate', 'help'])
  
  assert.equal(exitCode, 0)
  assert.ok(stdout.includes('Usage: framework generate'))
})

test('generate: without API key shows error', () => {
  // Unset the API key for this test
  const { stdout, exitCode } = runCLI(
    ['generate', '-d', 'Test project', '-n', 'test'],
    { ANTHROPIC_API_KEY: '' }
  )
  
  assert.equal(exitCode, 1)
  assert.ok(stdout.includes('ANTHROPIC_API_KEY'))
  assert.ok(stdout.includes('Solutions'))
})

test('generate: shows model tiers in help', () => {
  const { stdout } = runCLI(['generate', '--help'])
  
  assert.ok(stdout.includes('fast'))
  assert.ok(stdout.includes('balanced'))
  assert.ok(stdout.includes('quality'))
})

test('generate: help includes examples', () => {
  const { stdout } = runCLI(['generate', '--help'])
  
  assert.ok(stdout.includes('Examples:'))
  assert.ok(stdout.includes('framework generate -d'))
  assert.ok(stdout.includes('Interactive mode'))
})

test('generate: help mentions all flag options', () => {
  const { stdout } = runCLI(['generate', '--help'])
  
  assert.ok(stdout.includes('-d, --description'))
  assert.ok(stdout.includes('-n, --name'))
  assert.ok(stdout.includes('-t, --template'))
  assert.ok(stdout.includes('--tier'))
  assert.ok(stdout.includes('-o, --output'))
  assert.ok(stdout.includes('--no-stream'))
  assert.ok(stdout.includes('--vision'))
  assert.ok(stdout.includes('--mission'))
})

