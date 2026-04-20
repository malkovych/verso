import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';

export async function getStatus(req: AuthRequest, res: Response) {
  try {
    const { data } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', req.user!.id);

    const status: Record<string, { connected: boolean; lastSync?: string }> = {
      'google-calendar': { connected: false },
      trello: { connected: false },
      hubstaff: { connected: false },
    };

    for (const row of data || []) {
      status[row.provider] = {
        connected: row.is_active,
        lastSync: row.last_sync,
      };
    }

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function googleAuth(_req: AuthRequest, res: Response) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(env.GOOGLE_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.json({ authUrl });
}

export async function googleCallback(req: AuthRequest, res: Response) {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code' });
      return;
    }

    // TODO: Exchange code for tokens using googleapis
    await supabase.from('integrations').upsert({
      user_id: req.user!.id,
      provider: 'google-calendar',
      is_active: true,
      access_token: 'placeholder',
      last_sync: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

    res.redirect('/integrations?connected=google-calendar');
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function googleDisconnect(req: AuthRequest, res: Response) {
  try {
    await supabase
      .from('integrations')
      .update({ is_active: false })
      .eq('user_id', req.user!.id)
      .eq('provider', 'google-calendar');

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function trelloAuth(_req: AuthRequest, res: Response) {
  const authUrl =
    `https://trello.com/1/authorize?` +
    `expiration=never&name=SalesAI&scope=read,write` +
    `&response_type=token&key=${env.TRELLO_API_KEY}`;

  res.json({ authUrl });
}

export async function trelloDisconnect(req: AuthRequest, res: Response) {
  try {
    await supabase
      .from('integrations')
      .update({ is_active: false })
      .eq('user_id', req.user!.id)
      .eq('provider', 'trello');

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function hubstaffConnect(req: AuthRequest, res: Response) {
  try {
    const { appToken } = req.body;
    if (!appToken) {
      res.status(400).json({ error: 'appToken is required' });
      return;
    }

    await supabase.from('integrations').upsert({
      user_id: req.user!.id,
      provider: 'hubstaff',
      is_active: true,
      access_token: appToken,
      last_sync: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function hubstaffDisconnect(req: AuthRequest, res: Response) {
  try {
    await supabase
      .from('integrations')
      .update({ is_active: false })
      .eq('user_id', req.user!.id)
      .eq('provider', 'hubstaff');

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
