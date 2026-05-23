import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

function isConfigured(value?: string) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !value.includes('replace_me')
  )
}

const razorpayConfigured =
  isConfigured(process.env.RAZORPAY_KEY_ID) &&
  isConfigured(process.env.RAZORPAY_KEY_SECRET)
const resendConfigured =
  isConfigured(process.env.RESEND_API_KEY) &&
  isConfigured(process.env.RESEND_FROM_EMAIL)
const r2Configured =
  isConfigured(process.env.S3_FILE_URL) &&
  isConfigured(process.env.S3_REGION) &&
  isConfigured(process.env.S3_BUCKET) &&
  isConfigured(process.env.S3_ENDPOINT) &&
  isConfigured(process.env.S3_ACCESS_KEY_ID) &&
  isConfigured(process.env.S3_SECRET_ACCESS_KEY)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode:
      (process.env.MEDUSA_WORKER_MODE as 'shared' | 'server' | 'worker') ||
      'shared',
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    ...(razorpayConfigured
      ? [
          {
            resolve: '@medusajs/medusa/payment',
            options: {
              providers: [
                {
                  resolve: './src/modules/razorpay-payment',
                  id: 'razorpay',
                  options: {
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(resendConfigured
      ? [
          {
            resolve: '@medusajs/medusa/notification',
            options: {
              providers: [
                {
                  resolve: './src/modules/resend-notification',
                  id: 'resend',
                  options: {
                    api_key: process.env.RESEND_API_KEY,
                    from: process.env.RESEND_FROM_EMAIL,
                  },
                  channels: ['email'],
                },
              ],
            },
          },
        ]
      : []),
    ...(r2Configured
      ? [
          {
            resolve: '@medusajs/medusa/file',
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/file-s3',
                  id: 's3',
                  options: {
                    file_url: process.env.S3_FILE_URL,
                    access_key_id: process.env.S3_ACCESS_KEY_ID,
                    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                    region: process.env.S3_REGION,
                    bucket: process.env.S3_BUCKET,
                    endpoint: process.env.S3_ENDPOINT,
                    cache_control: 'public, max-age=31536000',
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
