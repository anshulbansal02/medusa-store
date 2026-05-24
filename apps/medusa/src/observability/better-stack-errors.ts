import * as Sentry from "@sentry/node";

let initialized = false;
let enabled = false;

function readOptionalNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function initBetterStackErrors() {
  if (initialized) {
    return enabled;
  }

  initialized = true;

  const dsn = process.env.BETTER_STACK_ERRORS_DSN;
  if (!dsn || dsn.includes("replace_me")) {
    return false;
  }

  Sentry.init({
    dsn,
    environment:
      process.env.BETTER_STACK_ENVIRONMENT ?? process.env.NODE_ENV ?? "production",
    release:
      process.env.BETTER_STACK_RELEASE ??
      process.env.GITHUB_SHA ??
      process.env.MEDUSA_IMAGE,
    tracesSampleRate: readOptionalNumber(
      process.env.BETTER_STACK_TRACES_SAMPLE_RATE,
    ),
  });

  enabled = true;
  return true;
}

type ErrorContext = {
  method?: string;
  path?: string;
};

export function captureBetterStackException(
  error: unknown,
  context: ErrorContext = {},
) {
  if (!initBetterStackErrors()) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("service", "medusa");

    if (context.method) {
      scope.setTag("http.method", context.method);
    }

    if (context.path) {
      scope.setTag("http.route", context.path);
    }

    Sentry.captureException(error);
  });
}
