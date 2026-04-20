import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { createCheckoutSession, createPortalSession, handleWebhook } from '../services/stripe.js';
import { supabase } from '../config/supabase.js';

const router = Router();

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    await handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.use(authMiddleware as any);

router.post('/checkout', (async (req: AuthRequest, res: Response) => {
  try {
    const { tier, billing } = req.body;
    if (!tier || !['basic', 'pro', 'business'].includes(tier)) {
      res.status(400).json({ error: 'Invalid subscription tier' });
      return;
    }

    const session = await createCheckoutSession(
      req.user!.id,
      req.user!.email,
      tier,
      billing || 'monthly'
    );

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as any);

router.post('/portal', (async (req: AuthRequest, res: Response) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.user!.id)
      .single();

    if (!profile?.stripe_customer_id) {
      res.status(400).json({ error: 'No active subscription' });
      return;
    }

    const session = await createPortalSession(profile.stripe_customer_id);
    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as any);

router.get('/current', (async (req: AuthRequest, res: Response) => {
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    res.json(data || { tier: 'free', status: 'active' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as any);

export default router;
