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

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: medusaConfig.databaseUrl,
    redisUrl: medusaConfig.redisUrl,
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
    backendUrl: medusaConfig.admin.backendUrl,
  },
  modules: [
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
