import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import {
  createCheckout,
  getCustomerPortalUrl,
  handleWebhook,
} from '../services/lemonsqueezy.js';
import { supabase } from '../config/supabase.js';

const router = Router();

router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing signature' });
      return;
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    await handleWebhook(rawBody, signature);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
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

    const result = await createCheckout(
      req.user!.id,
      req.user!.email,
      tier,
      billing || 'monthly'
    );

    res.json({ url: result.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as any);

router.post('/portal', (async (req: AuthRequest, res: Response) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('ls_customer_id')
      .eq('id', req.user!.id)
      .single();

    if (!profile?.ls_customer_id) {
      res.status(400).json({ error: 'No active subscription' });
      return;
    }

    const portalUrl = await getCustomerPortalUrl(profile.ls_customer_id);
    res.json({ url: portalUrl });
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
