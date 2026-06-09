# Tiden SDK for JavaScript

> Lightweight, dependency-free error tracking for JavaScript & TypeScript apps.

[![@tiden/browser](https://img.shields.io/npm/v/@tiden/browser?label=%40tiden%2Fbrowser)](https://www.npmjs.com/package/@tiden/browser)
[![@tiden/sourcemaps](https://img.shields.io/npm/v/@tiden/sourcemaps?label=%40tiden%2Fsourcemaps)](https://www.npmjs.com/package/@tiden/sourcemaps)
[![CI](https://github.com/qase-tms/tiden-js/actions/workflows/ci.yml/badge.svg)](https://github.com/qase-tms/tiden-js/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@tiden/browser)](./LICENSE)

Capture uncaught exceptions, unhandled promise rejections, and manual errors in
the browser — and see fully readable stack traces, even for minified production
bundles. No runtime dependencies, tiny footprint, TypeScript-first.

## Packages

| Package | Version | Description |
|---|---|---|
| [`@tiden/browser`](./browser) | [![npm](https://img.shields.io/npm/v/@tiden/browser)](https://www.npmjs.com/package/@tiden/browser) | Browser error-tracking SDK |
| [`@tiden/sourcemaps`](./sourcemaps) | [![npm](https://img.shields.io/npm/v/@tiden/sourcemaps)](https://www.npmjs.com/package/@tiden/sourcemaps) | Build-time source-map upload plugin (Vite / webpack / Rollup / esbuild) |

## Quick start

```bash
npm install @tiden/browser
```

```ts
import { Tiden } from '@tiden/browser'

Tiden.init({
  dsn: '<your-dsn>',          // from your Tiden project settings
  release: 'my-app@1.2.3',
  environment: 'production',
})
```

Uncaught errors and unhandled promise rejections are now reported automatically.
Capture manually whenever you need to:

```ts
try {
  checkout()
} catch (err) {
  Tiden.captureException(err)
}

Tiden.captureMessage('payment retried', 'info')
```

## Readable production stack traces

Minified bundles produce unreadable traces. Add the build plugin to upload source
maps so traces resolve back to your original code:

```bash
npm install -D @tiden/sourcemaps
```

```ts
// vite.config.ts
import { tidenSourceMaps } from '@tiden/sourcemaps'

export default {
  build: { sourcemap: true },
  plugins: [tidenSourceMaps.vite({ /* ...options */ })],
}
```

See [`@tiden/sourcemaps`](./sourcemaps) for webpack/Rollup/esbuild and all options.

## Documentation

- [`@tiden/browser`](./browser) — configuration, API, and capture options
- [`@tiden/sourcemaps`](./sourcemaps) — bundler setup and options
- [tiden.ai](https://tiden.ai)

## Contributing

Bug reports and feature requests are welcome via the
[issue tracker](https://github.com/qase-tms/tiden-js/issues). For larger changes,
please open an issue to discuss first.

## Maintenance

Actively maintained by the Tiden team.

## License

[MIT](./LICENSE)
