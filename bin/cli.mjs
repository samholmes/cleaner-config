#!/usr/bin/env node
import { spawn } from 'child_process'
import { accessSync } from 'fs'
import minimist from 'minimist'
import { join as joinPath } from 'path'

// Constants:

const defaultPaths = [
  'config.ts',
  'config.js',
  'src/config.ts',
  'src/config.js'
]

// Env:

const { VERBOSE = 'false' } = process.env
const verbose = Boolean(!['0', 'false'].includes(VERBOSE))

// Args:

const argv = minimist(process.argv.slice(2))
const pathArg = argv._[0]
const paths = pathArg == null ? defaultPaths : [pathArg]

const getConfigPath = () => {
  for (const path of paths) {
    if (path == null) break
    const configPath = path[0] === '/' ? path : joinPath(process.cwd(), path)
    try {
      if (verbose) console.log(`Looking for config file: ${configPath}`)
      accessSync(configPath)
      return configPath
    } catch (_) {}
  }
}

// Run:

const configPath = getConfigPath()
if (configPath == null) {
  console.error('Config not found')
  process.exit(1)
}

const node = spawn('node', ['-r', 'sucrase/register', configPath])

node.stdout.pipe(process.stdout)
node.stderr.pipe(process.stderr)
node.stdin.end()
