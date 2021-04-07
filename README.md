# Cleaner Configs

A utility to easily manage strongly-typed JSON configs using cleaners for runtime type-checking. The benefits for using type-checked config:

1. Clear error messages
2. Easy to refactor your config
3. Always valid default/sample config

## Usage

### Installation

```sh
yarn add cleaner-config
```

### config.ts

Your config is completely managed by a cleaner (`asConfig`). ALl you need is a file for your config cleaner and config object returned by `makeConfig`.

```ts
import { makeConfig } from 'cleaner-config'
import { asObject, asString } from 'cleaners'

export const asConfig = asObject({
  username: asString,
  password: asString,
})

export const config = makeConfig(asConfig)
```

### index.ts

Now you can use this type information to make a config object from the JSON config file.

```ts
import { config } from './config'

// config is ready to use...
```

## API

```ts
function makeConfig(asConfig: Cleaner<T>, filepath?: string): T
```

The `makeConfig` utility function will read the `config.json` relative to `process.cwd()` and type-check the JSON at runtime using the `asConfig` cleaner argument.

An optional `filepath` argument can be passed to `makeConfig` to customize the config file path. The path is relative to current working directory. The path is treated as absolute if prefixed with a forward-slash (`/`).

```ts
makeConfig(asConfig, 'custom-config.json')
makeConfig(asConfig, '/etc/config.json')
makeConfig(asConfig, process.env.CONFIG)
```

## Default Config

Providing a default config (i.e sample, example) is trivial using cleaners. When a config file is not found, the return value of your `asConfig` cleaner is used as the default config as long as it doesn't throw given `{}` as the input.

```ts
export const asConfig = asObject({
  username: asOptional(asString, 'john'),
  password: asOptional(asString, 'supersecret'),
})

export const config = makeConfig(asConfig)
```

### Template Objects

You can also use a separate object for you default values.

```ts
export type Config = ReturnType<typeof asConfig>
export const asConfig = asObject({
  username: asString,
  password: asString,
})

const defaultConfig: Config = {
  username: 'john',
  passoword: 'supersecret',
}

export const config = makeConfig((raw: any) =>
  asConfig({ ...configTemplate, ...raw })
)
```

Although not recommended for every use case, this _could_ be useful for more complex configurations (e.g. multiple environments, etc).

### Generating Default Config

It's possible to use the default config from `makeConfig` to generate a `config.json` file. As long as `NODE_ENV=config` and a config file is missing, `makeConfig` will create a new config JSON file for you. This means we can simply add a `configure` script to our `package.json` that runs our `config.ts` file with this env var.

```json
{
  "scripts": {
    "configure": "NODE_ENV=config node -r sucrase/register src/config.ts"
  }
}
```

Running our script will generate a new `config.json` on a fresh install of our project.

```sh
yarn configure
```

> Tip: We can use `process.env.CONFIG` as the filepath argument for `makeConfig` in order to generate configs with differnt file names: `CONFIG=config.dev.json yarn configure`.
