export type BackendEnv = NodeJS.ProcessEnv;

export type WorkerMode = "shared" | "server" | "worker";
type AdminPath = `/${string}`;

type RazorpayConfig =
  | {
      isConfigured: true;
      keyId: string;
      keySecret: string;
      webhookSecret?: string;
    }
  | {
      isConfigured: false;
      keyId?: string;
      keySecret?: string;
      webhookSecret?: string;
    };

type ResendConfig =
  | {
      isConfigured: true;
      apiKey: string;
      from: string;
    }
  | {
      isConfigured: false;
      apiKey?: string;
      from?: string;
    };

type R2Config =
  | {
      isConfigured: true;
      fileUrl: string;
      region: string;
      bucket: string;
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
    }
  | {
      isConfigured: false;
      fileUrl?: string;
      region?: string;
      bucket?: string;
      endpoint?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
    };

export function isConfigured(value?: string): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("replace_me")
  );
}

function readConfigured(value?: string) {
  return isConfigured(value) ? value : undefined;
}

function readWorkerMode(value?: string): WorkerMode {
  return value === "server" || value === "worker" ? value : "shared";
}

function readAdminPath(value?: string): AdminPath {
  return value?.startsWith("/") ? (value as AdminPath) : "/app";
}

export function getMedusaConfig(env: BackendEnv = process.env) {
  return {
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    workerMode: readWorkerMode(env.MEDUSA_WORKER_MODE),
    http: {
      storeCors: env.STORE_CORS,
      adminCors: env.ADMIN_CORS,
      authCors: env.AUTH_CORS,
      jwtSecret: env.JWT_SECRET,
      cookieSecret: env.COOKIE_SECRET,
    },
    admin: {
      path: readAdminPath(env.ADMIN_PATH),
      backendUrl: env.MEDUSA_BACKEND_URL,
    },
  };
}

export function getRazorpayConfig(
  env: BackendEnv = process.env,
): RazorpayConfig {
  const keyId = readConfigured(env.RAZORPAY_KEY_ID);
  const keySecret = readConfigured(env.RAZORPAY_KEY_SECRET);
  const webhookSecret = readConfigured(env.RAZORPAY_WEBHOOK_SECRET);

  if (keyId && keySecret) {
    return {
      isConfigured: true,
      keyId,
      keySecret,
      webhookSecret,
    };
  }

  return {
    isConfigured: false,
    keyId,
    keySecret,
    webhookSecret,
  };
}

export function getResendConfig(env: BackendEnv = process.env): ResendConfig {
  const apiKey = readConfigured(env.RESEND_API_KEY);
  const from = readConfigured(env.RESEND_FROM_EMAIL);

  if (apiKey && from) {
    return {
      isConfigured: true,
      apiKey,
      from,
    };
  }

  return {
    isConfigured: false,
    apiKey,
    from,
  };
}

export function getR2Config(env: BackendEnv = process.env): R2Config {
  const fileUrl = readConfigured(env.S3_FILE_URL);
  const region = readConfigured(env.S3_REGION);
  const bucket = readConfigured(env.S3_BUCKET);
  const endpoint = readConfigured(env.S3_ENDPOINT);
  const accessKeyId = readConfigured(env.S3_ACCESS_KEY_ID);
  const secretAccessKey = readConfigured(env.S3_SECRET_ACCESS_KEY);

  if (fileUrl && region && bucket && endpoint && accessKeyId && secretAccessKey) {
    return {
      isConfigured: true,
      fileUrl,
      region,
      bucket,
      endpoint,
      accessKeyId,
      secretAccessKey,
    };
  }

  return {
    isConfigured: false,
    fileUrl,
    region,
    bucket,
    endpoint,
    accessKeyId,
    secretAccessKey,
  };
}

export function getEmailConfig(env: BackendEnv = process.env) {
  return {
    adminInviteFrom: readConfigured(env.ADMIN_INVITE_FROM_EMAIL),
    ownerOrderEmail: readConfigured(env.OWNER_ORDER_EMAIL),
    ownerOrderFrom: readConfigured(env.OWNER_ORDER_FROM_EMAIL),
    orderFrom: readConfigured(env.ORDER_FROM_EMAIL),
    storefrontUrl: readConfigured(env.STOREFRONT_URL ?? env.NEXT_PUBLIC_SITE_URL),
    replyTo: readConfigured(
      env.TRANSACTIONAL_REPLY_TO_EMAIL ?? env.RESEND_REPLY_TO_EMAIL,
    ),
  };
}
