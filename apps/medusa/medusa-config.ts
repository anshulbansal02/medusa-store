import { loadEnv, defineConfig } from '@medusajs/framework/utils'

import {
  getMedusaConfig,
  getR2Config,
  getRazorpayConfig,
  getResendConfig,
} from './src/config/env'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const medusaConfig = getMedusaConfig()
const razorpayConfig = getRazorpayConfig()
const resendConfig = getResendConfig()
const r2Config = getR2Config()
const redisUrl = medusaConfig.redisUrl

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: medusaConfig.databaseUrl,
    redisUrl,
    workerMode: medusaConfig.workerMode,
    http: {
      storeCors: medusaConfig.http.storeCors!,
      adminCors: medusaConfig.http.adminCors!,
      authCors: medusaConfig.http.authCors!,
      jwtSecret: medusaConfig.http.jwtSecret!,
      cookieSecret: medusaConfig.http.cookieSecret!,
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === 'true',
    backendUrl: medusaConfig.admin.backendUrl,
  },
  modules: [
    ...(redisUrl
      ? [
          {
            resolve: '@medusajs/medusa/caching',
            options: {
              providers: [
                {
                  resolve: '@medusajs/caching-redis',
                  id: 'caching-redis',
                  is_default: true,
                  options: {
                    redisUrl,
                  },
                },
              ],
            },
          },
          {
            resolve: '@medusajs/medusa/event-bus-redis',
            options: {
              redisUrl,
              jobOptions: {
                removeOnComplete: {
                  age: 3600,
                  count: 1000,
                },
                removeOnFail: {
                  age: 3600,
                  count: 1000,
                },
              },
            },
          },
          {
            resolve: '@medusajs/medusa/workflow-engine-redis',
            options: {
              redis: {
                redisUrl,
              },
            },
          },
          {
            resolve: '@medusajs/medusa/locking',
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/locking-redis',
                  id: 'locking-redis',
                  is_default: true,
                  options: {
                    redisUrl,
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(razorpayConfig.isConfigured
      ? [
          {
            resolve: '@medusajs/medusa/payment',
            options: {
              providers: [
                {
                  resolve: './src/modules/razorpay-payment',
                  id: 'razorpay',
                  options: {
                    key_id: razorpayConfig.keyId,
                    key_secret: razorpayConfig.keySecret,
                    webhook_secret: razorpayConfig.webhookSecret,
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(resendConfig.isConfigured
      ? [
          {
            resolve: '@medusajs/medusa/notification',
            options: {
              providers: [
                {
                  resolve: './src/modules/resend-notification',
                  id: 'resend',
                  options: {
                    api_key: resendConfig.apiKey,
                    from: resendConfig.from,
                  },
                  channels: ['email'],
                },
              ],
            },
          },
        ]
      : []),
    ...(r2Config.isConfigured
      ? [
          {
            resolve: '@medusajs/medusa/file',
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/file-s3',
                  id: 's3',
                  options: {
                    file_url: r2Config.fileUrl,
                    access_key_id: r2Config.accessKeyId,
                    secret_access_key: r2Config.secretAccessKey,
                    region: r2Config.region,
                    bucket: r2Config.bucket,
                    endpoint: r2Config.endpoint,
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
