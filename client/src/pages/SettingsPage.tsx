import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supportedLanguages } from '../i18n';
import { subscriptionsApi } from '../services/api';
import { ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [sub, setSub] = useState<{ tier: string; status: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    subscriptionsApi.current()
      .then(({ data }) => setSub(data))
      .catch(() => setSub({ tier: 'free', status: 'active' }));
  }, []);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await subscriptionsApi.portal();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error('No active subscription to manage');
    } finally {
      setPortalLoading(false);
    }
  };

  const tierLabels: Record<string, string> = {
    free: 'Free',
    basic: 'Basic — $9.99/mo',
    pro: 'Professional — $29.99/mo',
    business: 'Business — $49.99/mo',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('settings.title')}</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.profile')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.language')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  localStorage.setItem('language', lang.code);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  i18n.language === lang.code
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.subscription')}</h2>
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
            <div>
              <p className="font-semibold text-primary-900">
                {sub ? tierLabels[sub.tier] || sub.tier : '...'}
              </p>
              <p className="text-sm text-primary-600">
                {sub?.tier === 'free'
                  ? 'Upgrade for more features'
                  : `Status: ${sub?.status || '...'}`}
              </p>
            </div>
            <div className="flex gap-2">
              {sub?.tier !== 'free' && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  Manage
                </button>
              )}
              <a href="/pricing" className="btn-primary text-sm py-2 px-4">
                {sub?.tier === 'free' ? 'Upgrade' : 'Change Plan'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
