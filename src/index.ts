import { asMaybe, asString, Cleaner } from 'cleaners'
import { readFileSync, writeFileSync } from 'fs'
import { join as joinPath } from 'path'

export const makeConfig = <T>(
  asConfig: Cleaner<T>,
  filepath: string = 'config.json'
): T => {
  let config: unknown

  try {
    const json = configFromFile(filepath)
    config = JSON.parse(json)
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw new Error(
        `Failed to read config file.\n${indentErrorStack(error.stack)}`
      )
    }

    let defaultConfig: T
    try {
      defaultConfig = asConfig({})
    } catch (error: any) {
      const errorMessage =
        asMaybe(asString)(error.message) ?? JSON.stringify(error)

      throw new Error(
        `Failed to create missing config file ${filepath} from cleaner: ${errorMessage} `
      )
    }

    try {
      configToFile(defaultConfig, filepath)
    } catch (error: any) {
      throw new Error(
        `Failed to write config file.\n${indentErrorStack(error.stack)}`
      )
    }

    return defaultConfig
  }

  // Validate config
  try {
    return asConfig(config)
  } catch (error: any) {
    throw new TypeError(
      `Config validation failed\n${indentErrorStack(
        error.stack
      )}\n\n${JSON.stringify(config)}`
    )
  }
}

const configFromFile = (filepath: string): string => {
  const configPath =
    filepath[0] === '/' ? filepath : joinPath(process.cwd(), filepath)

  return readFileSync(configPath, 'utf8')
}

const configToFile = (config: unknown, filepath: string): void => {
  const configPath =
    filepath[0] === '/' ? filepath : joinPath(process.cwd(), filepath)
  const json = JSON.stringify(config, null, 2)

  writeFileSync(configPath, json, 'utf8')
}

// Utility functions:

function indentErrorStack(stack: string): string {
  return stack
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n')
}
