import { Cleaner, uncleaner } from 'cleaners'
import { readFileSync, writeFileSync } from 'fs'
import { join as joinPath } from 'path'

import { matchJson } from './matchJson'

export const makeConfig = <T>(
  asConfig: Cleaner<T>,
  filepath: string = 'config.json'
): T => {
  const wasConfig = uncleaner(asConfig)
  const configPath =
    filepath[0] === '/' ? filepath : joinPath(process.cwd(), filepath)

  let config: unknown = {}
  try {
    const json = readFileSync(configPath, 'utf8')
    config = JSON.parse(json)
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw new Error(
        `Failed to read config file.\n${indentErrorStack(error.stack)}`
      )
    }
  }

  // Validate config
  try {
    const clean = asConfig(config)
    const dirty = wasConfig(clean)

    // Update disk if the round-trip has differences
    if (!matchJson(dirty, config)) {
      try {
        const json = JSON.stringify(dirty, null, 2)
        writeFileSync(configPath, json, 'utf8')
      } catch (error: any) {
        throw new Error(
          `Failed to write config file.\n${indentErrorStack(error.stack)}`
        )
      }
    }
    return clean
  } catch (error: any) {
    throw new TypeError(
      `Config validation failed\n${indentErrorStack(
        error.stack
      )}\n\n${JSON.stringify(config)}`
    )
  }
}

// Utility functions:

function indentErrorStack(stack: string): string {
  return stack
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n')
}
