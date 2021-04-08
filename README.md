# Cleaner Config

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

The `config.json` file will automatically be created with the default values if it doesn't exist. This means zero-configuration for your app out of the box!

With a cleaner config, you no longer need to copying `config.sample.json` to `config.json`! This is automated for you. This saves you a step when running your app and also the overhead of maintaining an a default config file that isn't type checked.

### Configure Script

Although the `makeConfig` function will create a new config JSON file at app runtime, we can do better. We can add a `configure` script in our `package.json` and include this in the `prepare` life-cycle script.

```json
{
  "scripts": {
    "configure": "node -r sucrase/register src/config.ts",
    "prepare": "yarn configure && yarn build"
  }
}
```

Now our config file is available after app installation, ready for modification!
