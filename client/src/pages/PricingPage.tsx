import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscriptionsApi } from '../services/api';
import toast from 'react-hot-toast';

const plans = ['basic', 'pro', 'business'] as const;

export default function PricingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelect = async (plan: string) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    setLoading(plan);
    try {
      const { data } = await subscriptionsApi.checkout(plan, billing);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || t('common.error'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h1>
          <p className="text-xl text-gray-600 mb-8">{t('pricing.subtitle')}</p>

          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === 'yearly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {t('pricing.yearly')} (-20%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPro = plan === 'pro';
            const features = t(`pricing.${plan}.features`, { returnObjects: true }) as string[];
            const isLoading = loading === plan;

            return (
              <div
                key={plan}
                className={`relative rounded-2xl p-8 ${
                  isPro
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/25 scale-105'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {t('pricing.pro.popular')}
                  </div>
                )}

                <h3 className={`text-xl font-bold mb-2 ${isPro ? 'text-white' : 'text-gray-900'}`}>
                  {t(`pricing.${plan}.name`)}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-extrabold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                    {t(`pricing.${plan}.price`)}
                  </span>
                  <span className={`text-sm ${isPro ? 'text-primary-200' : 'text-gray-500'}`}>
                    {t(`pricing.${plan}.period`)}
                  </span>
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${isPro ? 'text-primary-100' : 'text-gray-500'}`}>
                  {t(`pricing.${plan}.description`)}
                </p>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${isPro ? 'text-primary-200' : 'text-accent-500'}`} />
                      <span className={`text-sm ${isPro ? 'text-primary-100' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={isLoading}
                  className={`w-full text-center px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 ${
                    isPro
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'btn-primary'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    t(`pricing.${plan}.cta`)
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          Powered by LemonSqueezy. Secure payments worldwide.
        </p>
      </div>
    </div>
  );
}
