# Error Handling Guide

`discord-image-utils` ships custom error classes plus `ErrorHandler` and `RetryHandler` helpers.

## Available Error Classes

For normal usage, import these directly from the package root:

```ts
import {
  DiscordImageError,
  ValidationError,
  NetworkError,
  ImageProcessingError,
  FileSystemError,
  ConfigurationError,
  TimeoutError,
} from "discord-image-utils";
```

`discord-image-utils/errors` also works if you prefer that subpath.

Every custom error extends `DiscordImageError` and includes:

- `message`
- `code`
- `statusCode`
- `details`
- `timestamp`
- `cause`

## Typical Usage

```ts
import { blur } from "discord-image-utils";
import {
  DiscordImageError,
  ValidationError,
  ImageProcessingError,
} from "discord-image-utils";

try {
  await blur("./avatar.png", 8);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Invalid input", error.details);
  } else if (error instanceof ImageProcessingError) {
    console.error("Image processing failed", error.details);
  } else if (error instanceof DiscordImageError) {
    console.error(error.code, error.details);
  } else {
    console.error(error);
  }
}
```

## When Errors Usually Appear

- `ValidationError`: missing input, bad ranges, empty buffers, invalid file paths
- `NetworkError`: remote fetch failures
- `TimeoutError`: network fetch exceeded timeout
- `FileSystemError`: local template or asset loading failed
- `ImageProcessingError`: decode, draw, encode, or buffer-export failures
- `ConfigurationError`: invalid internal configuration

## `ErrorHandler`

The following methods exist today:

```ts
import { ErrorHandler } from "discord-image-utils";

ErrorHandler.setLogLevel("debug");

await ErrorHandler.withErrorHandling(async () => {
  return await someAsyncOperation();
}, "someAsyncOperation");

ErrorHandler.validateRequired(value, "value");
ErrorHandler.validateRange(level, 1, 10, "level");
ErrorHandler.validateStringLength(currency, 5, "currency", 1);
ErrorHandler.validateArray(images, "images", 2);

const safeParse = ErrorHandler.safeFn(
  (input: string) => JSON.parse(input),
  "json parse",
  {},
);
```

`setLogLevel(...)` supports `debug`, `info`, `warn`, and `error`.

## `RetryHandler`

`RetryHandler.withRetry(...)` is used internally for network image loading and is available for consumers.

```ts
import { RetryHandler, NetworkError } from "discord-image-utils";

const result = await RetryHandler.withRetry(
  async () => fetchRemoteThing(),
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    context: "fetchRemoteThing",
    retryCondition: (error) => error instanceof NetworkError,
  },
);
```

## Runtime Notes

- Remote image loading retries up to 3 times by default for retryable network failures.
- `validateURL(...)` supports URLs, data URLs, buffers, and local file paths, but it is part of the `./utils` export, not the top-level package export.
- Some helpers intentionally return empty buffers for certain Discord CDN edge cases and let higher-level generators decide how to fail.

## Importing `validateURL`

```ts
import { validateURL } from "discord-image-utils/utils";
import { ValidationError, NetworkError } from "discord-image-utils/errors";

try {
  const buffer = await validateURL("https://example.com/image.png", 5000);
} catch (error) {
  if (error instanceof ValidationError || error instanceof NetworkError) {
    console.error(error.message);
  }
}
```
