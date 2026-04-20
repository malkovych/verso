import { useTranslation } from 'react-i18next';
import {
  MessageSquare, Users, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const mockStats = {
  totalConversations: 1_247,
  activeLeads: 89,
  conversionRate: 12.4,
  revenue: 28_450,
};

const mockFunnel = [
  { stage: 'Awareness', count: 450, color: 'bg-blue-500' },
  { stage: 'Interest', count: 320, color: 'bg-indigo-500' },
  { stage: 'Consideration', count: 180, color: 'bg-violet-500' },
  { stage: 'Intent', count: 95, color: 'bg-purple-500' },
  { stage: 'Purchase', count: 42, color: 'bg-primary-600' },
];

const mockRecentChats = [
  { id: '1', title: 'Product inquiry — Enterprise plan', time: '5 min ago', status: 'active' },
  { id: '2', title: 'Pricing negotiation — Startup Co', time: '23 min ago', status: 'active' },
  { id: '3', title: 'Demo request — John Smith', time: '1h ago', status: 'completed' },
  { id: '4', title: 'Feature comparison question', time: '2h ago', status: 'completed' },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  const statCards = [
    { key: 'totalConversations', value: mockStats.totalConversations.toLocaleString(), icon: MessageSquare, change: '+12%', up: true },
    { key: 'activeLeads', value: mockStats.activeLeads.toString(), icon: Users, change: '+5%', up: true },
    { key: 'conversionRate', value: `${mockStats.conversionRate}%`, icon: TrendingUp, change: '-0.8%', up: false },
    { key: 'revenue', value: `$${mockStats.revenue.toLocaleString()}`, icon: DollarSign, change: '+18%', up: true },
  ];

  const maxFunnel = Math.max(...mockFunnel.map((f) => f.count));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('dashboard.title')}</h1>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="card flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t(`dashboard.${stat.key}`)}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${stat.up ? 'text-accent-600' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Funnel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.funnelStages')}</h2>
          <div className="space-y-4">
            {mockFunnel.map((stage) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-gray-500">{stage.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent chats */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('dashboard.recentChats')}</h2>
          <div className="space-y-3">
            {mockRecentChats.map((chat) => (
              <div key={chat.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${chat.status === 'active' ? 'bg-accent-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{chat.title}</p>
                    <p className="text-xs text-gray-400">{chat.time}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
