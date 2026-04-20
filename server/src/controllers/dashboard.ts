import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const { count: totalConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: activeLeads } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('funnel_stage', ['Interest', 'Consideration', 'Intent']);

    const { count: purchaseCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('funnel_stage', 'Purchase');

    const total = totalConversations || 0;
    const purchases = purchaseCount || 0;
    const conversionRate = total > 0 ? Math.round((purchases / total) * 100 * 10) / 10 : 0;

    res.json({
      totalConversations: total,
      activeLeads: activeLeads || 0,
      conversionRate,
      revenue: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFunnelData(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const stages = ['Awareness', 'Interest', 'Consideration', 'Intent', 'Purchase'];

    const funnelData = await Promise.all(
      stages.map(async (stage) => {
        const { count } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('funnel_stage', stage);
        return { stage, count: count || 0 };
      })
    );

    res.json(funnelData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
