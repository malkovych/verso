import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Trello, Clock, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';

interface Integration {
  id: string;
  nameKey: string;
  icon: typeof Calendar;
  connected: boolean;
  description: string;
}

const initialIntegrations: Integration[] = [
  { id: 'google-calendar', nameKey: 'googleCalendar', icon: Calendar, connected: false, description: 'Sync meetings and schedule follow-ups automatically.' },
  { id: 'trello', nameKey: 'trello', icon: Trello, connected: false, description: 'Create cards for leads and track funnel progress on boards.' },
  { id: 'hubstaff', nameKey: 'hubstaff', icon: Clock, connected: false, description: 'Track time spent on sales conversations and measure productivity.' },
  { id: 'shop-chat', nameKey: 'shopChat', icon: ShoppingBag, connected: false, description: 'Embed AI chat widget on your online store for instant support.' },
];

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const toggle = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('integrations.title')}</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div key={integration.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t(`integrations.${integration.nameKey}`)}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {integration.connected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-500" />
                          <span className="text-xs text-accent-600 font-medium">{t('integrations.connected')}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-400">{t('integrations.disconnected')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{integration.description}</p>
              <button
                onClick={() => toggle(integration.id)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  integration.connected
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
              >
                {integration.connected ? t('integrations.disconnect') : t('integrations.connect')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
