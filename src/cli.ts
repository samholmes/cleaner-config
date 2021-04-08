#!/usr/bin/env node -r sucrase/register
import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import minimist from 'minimist'
import { join as joinPath } from 'path'
import { transform } from 'sucrase'

// Constants:

const defaultPaths = ['config.ts', 'src/config.ts']

// Env:

const { VERBOSE = 'false' } = process.env
const verbose = Boolean(!['0', 'false'].includes(VERBOSE))

// Args:

const argv = minimist(process.argv.slice(2))
const pathArg = argv._[0]

// Read Config:

let configPath: string | null = null
const paths = pathArg == null ? defaultPaths : [pathArg]

const code = (() => {
  let code
  while (code == null) {
    if (configPath == null) {
      const path = paths.shift()
      if (path == null) break
      configPath = path[0] === '/' ? path : joinPath(process.cwd(), path)
    }
    try {
      if (verbose) console.log(`Reading config file: ${configPath}`)
      code = readFileSync(configPath, 'utf-8')
    } catch (error) {
      configPath = null
    }
  }
  return code
})()

if (code == null) {
  console.error('Config not found')
  process.exit(1)
}

// Compile:

const compiledCode = transform(code, {
  transforms: ['typescript', 'imports']
}).code

// Run:

const node = spawn('node')

node.stdout.pipe(process.stdout)
node.stdin.write(compiledCode)
node.stdin.end()
