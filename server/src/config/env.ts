import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || '',
  TRELLO_API_KEY: process.env.TRELLO_API_KEY || '',
  TRELLO_TOKEN: process.env.TRELLO_TOKEN || '',
  HUBSTAFF_APP_TOKEN: process.env.HUBSTAFF_APP_TOKEN || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY || '',
  LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID || '',
  LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
  LS_VARIANT_BASIC_MONTHLY: process.env.LS_VARIANT_BASIC_MONTHLY || '',
  LS_VARIANT_BASIC_YEARLY: process.env.LS_VARIANT_BASIC_YEARLY || '',
  LS_VARIANT_PRO_MONTHLY: process.env.LS_VARIANT_PRO_MONTHLY || '',
  LS_VARIANT_PRO_YEARLY: process.env.LS_VARIANT_PRO_YEARLY || '',
  LS_VARIANT_BUSINESS_MONTHLY: process.env.LS_VARIANT_BUSINESS_MONTHLY || '',
  LS_VARIANT_BUSINESS_YEARLY: process.env.LS_VARIANT_BUSINESS_YEARLY || '',
} as const;
