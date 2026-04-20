import Stripe from 'stripe';
import { env } from '../config/env.js';
import { supabase } from '../config/supabase.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: 'price_basic_monthly',
    yearly: 'price_basic_yearly',
  },
  pro: {
    monthly: 'price_pro_monthly',
    yearly: 'price_pro_yearly',
  },
  business: {
    monthly: 'price_business_monthly',
    yearly: 'price_business_yearly',
  },
};

export async function createCheckoutSession(
  userId: string,
  email: string,
  tier: string,
  billing: 'monthly' | 'yearly' = 'monthly'
) {
  const priceConfig = PRICE_IDS[tier];
  if (!priceConfig) throw new Error(`Invalid tier: ${tier}`);

  let customerId: string | undefined;

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    customerId = profile.stripe_customer_id;
  } else {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceConfig[billing], quantity: 1 }],
    success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing`,
    metadata: { userId, tier },
  });

  return session;
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/settings`,
  });
  return session;
}

export async function handleWebhook(rawBody: string | Buffer, signature: string) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;
      if (userId && tier) {
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_subscription_id: session.subscription as string,
          tier,
          status: 'active',
          current_period_start: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions')
        .update({
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);

      const { data } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (data) {
        await supabase.from('profiles').update({ subscription_tier: 'free' }).eq('id', data.user_id);
      }
      break;
    }
  }
}
