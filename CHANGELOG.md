# cleaner-config

## Unreleased

- fixed: `configure` CLI runs the config file using `node -r sucrase/register` for proper module resolution handling.

## 0.1.9 (2022-09-13)

- changed: If the cleaner changes the config file in some way, write those changes to disk. This ensures that the on-disk data will always match the latest format.

## 0.1.8 (2022-06-15)

- fixed: Search for `.js` file extensions in addition to `.ts` for config file default paths.

## 0.1.7 (2021-06-08)

- fixed: Re-publish on NPM to fix missing lib/index.d.ts file.

## 0.1.6 (2021-06-07)

- fixed: Update the CLI syntax to be compatible with older Node.js versions (v12.17.0 and later).

## 0.1.5 (2021-06-02)

- fixed: Show more useful error messages when failing to create a config file.
