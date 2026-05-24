import net from "node:net";

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { Logger } from "@medusajs/framework/types";

type DependencyCheck = {
  name: "database" | "redis";
  ok: boolean;
  error?: string;
};

const READY_TIMEOUT_MS = 1500;

function parseDependencyUrl(name: DependencyCheck["name"], value?: string) {
  if (!value) {
    return { error: `${name} URL is not configured` };
  }

  try {
    const url = new URL(value);
    const port = url.port
      ? Number(url.port)
      : url.protocol === "rediss:"
        ? 6380
        : url.protocol.startsWith("redis")
          ? 6379
          : 5432;

    if (!url.hostname || !Number.isInteger(port)) {
      return { error: `${name} URL host or port is invalid` };
    }

    return { host: url.hostname, port };
  } catch {
    return { error: `${name} URL is invalid` };
  }
}

function checkTcpConnection({
  host,
  port,
}: {
  host: string;
  port: number;
}) {
  return new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host, port });

    const onError = (error: Error) => {
      socket.destroy();
      reject(error);
    };

    socket.setTimeout(READY_TIMEOUT_MS);
    socket.once("connect", () => {
      socket.end();
      resolve();
    });
    socket.once("timeout", () => onError(new Error("connection timed out")));
    socket.once("error", onError);
  });
}

async function checkDependency(
  name: DependencyCheck["name"],
  value?: string,
): Promise<DependencyCheck> {
  const parsed = parseDependencyUrl(name, value);

  if ("error" in parsed) {
    return { name, ok: false, error: parsed.error };
  }

  try {
    await checkTcpConnection(parsed);
    return { name, ok: true };
  } catch (error) {
    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : "connection failed",
    };
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const checks = await Promise.all([
    checkDependency("database", process.env.DATABASE_URL),
    checkDependency("redis", process.env.REDIS_URL),
  ]);

  const ready = checks.every((check) => check.ok);

  if (!ready) {
    const logger = req.scope.resolve("logger") as Logger;
    logger.warn(`Readiness check failed: ${JSON.stringify(checks)}`);
  }

  res.status(ready ? 200 : 503).json({
    ready,
    checks,
  });
}
