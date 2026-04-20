import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = ['basic', 'pro', 'business'] as const;

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h1>
          <p className="text-xl text-gray-600">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPro = plan === 'pro';
            const features = t(`pricing.${plan}.features`, { returnObjects: true }) as string[];

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
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-extrabold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                    {t(`pricing.${plan}.price`)}
                  </span>
                  <span className={`text-sm ${isPro ? 'text-primary-200' : 'text-gray-500'}`}>
                    {t(`pricing.${plan}.period`)}
                  </span>
                </div>

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

                <Link
                  to="/signup"
                  className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    isPro
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'btn-primary w-full'
                  }`}
                >
                  {t(`pricing.${plan}.cta`)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
