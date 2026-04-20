import axios from 'axios';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';

const lsApi = axios.create({
  baseURL: 'https://api.lemonsqueezy.com/v1',
  headers: {
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
  },
});

/**
 * Variant IDs from LemonSqueezy dashboard.
 * Create products/variants in https://app.lemonsqueezy.com and paste IDs here.
 */
export const VARIANT_IDS: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: env.LS_VARIANT_BASIC_MONTHLY || '',
    yearly: env.LS_VARIANT_BASIC_YEARLY || '',
  },
  pro: {
    monthly: env.LS_VARIANT_PRO_MONTHLY || '',
    yearly: env.LS_VARIANT_PRO_YEARLY || '',
  },
  business: {
    monthly: env.LS_VARIANT_BUSINESS_MONTHLY || '',
    yearly: env.LS_VARIANT_BUSINESS_YEARLY || '',
  },
};

export async function createCheckout(
  userId: string,
  email: string,
  tier: string,
  billing: 'monthly' | 'yearly' = 'monthly'
) {
  const variantConfig = VARIANT_IDS[tier];
  if (!variantConfig) throw new Error(`Invalid tier: ${tier}`);

  const variantId = variantConfig[billing];
  if (!variantId) throw new Error(`Variant not configured for ${tier}/${billing}`);

  const { data } = await lsApi.post('/checkouts', {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email,
          custom: { user_id: userId },
        },
        product_options: {
          redirect_url: `${env.CLIENT_URL}/settings?checkout=success`,
          receipt_link_url: `${env.CLIENT_URL}/settings`,
        },
      },
      relationships: {
        store: {
          data: { type: 'stores', id: env.LEMONSQUEEZY_STORE_ID },
        },
        variant: {
          data: { type: 'variants', id: variantId },
        },
      },
    },
  });

  return { url: data.data.attributes.url };
}

export async function getCustomerPortalUrl(lsCustomerId: string): Promise<string> {
  const { data } = await lsApi.get(`/customers/${lsCustomerId}`);
  return data.data.attributes.urls.customer_portal;
}

export async function cancelSubscription(lsSubscriptionId: string) {
  await lsApi.delete(`/subscriptions/${lsSubscriptionId}`);
}

export async function resumeSubscription(lsSubscriptionId: string) {
  await lsApi.patch(`/subscriptions/${lsSubscriptionId}`, {
    data: {
      type: 'subscriptions',
      id: lsSubscriptionId,
      attributes: { cancelled: false },
    },
  });
}

/**
 * Verify webhook signature from LemonSqueezy.
 * Uses HMAC SHA-256 with the webhook secret.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', env.LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function tierFromVariantId(variantId: string): string {
  for (const [tier, variants] of Object.entries(VARIANT_IDS)) {
    if (variants.monthly === variantId || variants.yearly === variantId) return tier;
  }
  return 'basic';
}

export async function handleWebhook(rawBody: string, signature: string) {
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new Error('Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody);
  const eventName: string = payload.meta.event_name;
  const obj = payload.data;
  const attrs = obj.attributes;
  const userId: string | undefined = payload.meta?.custom_data?.user_id;

  switch (eventName) {
    case 'subscription_created': {
      if (!userId) break;
      const tier = tierFromVariantId(String(attrs.variant_id));

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        ls_subscription_id: String(obj.id),
        ls_customer_id: String(attrs.customer_id),
        ls_variant_id: String(attrs.variant_id),
        tier,
        status: 'active',
        current_period_start: attrs.created_at,
        current_period_end: attrs.renews_at,
      }, { onConflict: 'user_id' });

      await supabase.from('profiles')
        .update({ subscription_tier: tier, ls_customer_id: String(attrs.customer_id) })
        .eq('id', userId);
      break;
    }

    case 'subscription_updated': {
      const subId = String(obj.id);
      const status = attrs.status === 'active' ? 'active'
        : attrs.status === 'past_due' ? 'past_due'
        : attrs.status === 'cancelled' ? 'canceled'
        : attrs.status;

      const newVariant = String(attrs.variant_id);
      const newTier = tierFromVariantId(newVariant);

      await supabase.from('subscriptions')
        .update({
          status,
          tier: newTier,
          ls_variant_id: newVariant,
          current_period_end: attrs.renews_at,
          cancel_at_period_end: attrs.cancelled ?? false,
        })
        .eq('ls_subscription_id', subId);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('ls_subscription_id', subId)
        .single();

      if (sub) {
        await supabase.from('profiles').update({ subscription_tier: newTier }).eq('id', sub.user_id);
      }
      break;
    }

    case 'subscription_cancelled':
    case 'subscription_expired': {
      const subId = String(obj.id);
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('ls_subscription_id', subId);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('ls_subscription_id', subId)
        .single();

      if (sub) {
        await supabase.from('profiles').update({ subscription_tier: 'free' }).eq('id', sub.user_id);
      }
      break;
    }

    case 'subscription_payment_success': {
      const subId = String(obj.attributes?.subscription_id || obj.id);
      await supabase.from('subscriptions')
        .update({
          status: 'active',
          current_period_end: attrs.renews_at || attrs.created_at,
        })
        .eq('ls_subscription_id', subId);
      break;
    }
  }
}
