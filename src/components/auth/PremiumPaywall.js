import React, { useState } from 'react';
import { Crown, Lock, CheckCircle, Star, ArrowRight, X } from 'lucide-react';
import { 
  PREMIUM_PRICING, 
  PREMIUM_FEATURES, 
  PREMIUM_BENEFITS, 
  PREMIUM_CTA, 
  PREMIUM_GUARANTEES, 
  PREMIUM_MESSAGING 
} from '../../config/premiumConfig';

const PremiumPaywall = ({ 
  isOpen, 
  onClose, 
  guideTitle, 
  guideDescription,
  onUpgrade 
}) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = [
    {
      ...PREMIUM_PRICING.monthly,
      features: PREMIUM_FEATURES.monthly
    },
    {
      ...PREMIUM_PRICING.annual,
      features: PREMIUM_FEATURES.annual
    }
  ];

  const getIconComponent = (iconName) => {
    const icons = {
      Crown: <Crown className="w-6 h-6" />,
      CheckCircle: <CheckCircle className="w-6 h-6" />,
      Star: <Star className="w-6 h-6" />
    };
    return icons[iconName] || icons.Crown;
  };

  const benefits = PREMIUM_BENEFITS.map(benefit => ({
    ...benefit,
    icon: getIconComponent(benefit.icon)
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-chestnut to-chestnut/80 text-white p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center mb-4">
            <Lock className="w-8 h-8 mr-3" />
            <h1 className="text-3xl font-bold font-serif">{PREMIUM_MESSAGING.paywall.title}</h1>
          </div>
          
          <p className="text-xl opacity-90 mb-2">
            {guideTitle}
          </p>
          <p className="opacity-80">
            {guideDescription}
          </p>
        </div>

        <div className="p-8">
          {/* Benefits Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-charcoal mb-6 font-serif">
              {PREMIUM_MESSAGING.benefits.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 bg-chestnut/10 rounded-lg flex-shrink-0">
                    <div className="text-chestnut">
                      {benefit.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-charcoal/70">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-charcoal mb-6 font-serif text-center">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-chestnut bg-chestnut/5'
                      : 'border-gray-200 hover:border-chestnut/50'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-charcoal">
                        {plan.name}
                      </h3>
                      {plan.savings && (
                        <p className="text-sm text-green-600 font-medium">
                          {plan.savings}
                        </p>
                      )}
                    </div>
                    {plan.badge && (
                      <span className="bg-chestnut text-white px-3 py-1 rounded-full text-sm font-medium">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-charcoal">
                      ${plan.price}
                    </span>
                    <span className="text-charcoal/70 ml-2">
                      {plan.billing}
                    </span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-charcoal/80">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlan === plan.id
                        ? 'bg-chestnut border-chestnut'
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-charcoal mb-2">
              {PREMIUM_MESSAGING.upgrade.title}
            </h3>
            <p className="text-charcoal/70 mb-6">
              {PREMIUM_MESSAGING.upgrade.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  console.log('Upgrading to:', selectedPlan);
                  onUpgrade && onUpgrade(selectedPlan);
                }}
                className="bg-chestnut text-white px-8 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors flex items-center justify-center"
              >
                <span>{PREMIUM_CTA.primary}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <button 
                onClick={onClose}
                className="border-2 border-chestnut text-chestnut px-8 py-3 rounded-lg font-medium hover:bg-chestnut hover:text-white transition-colors"
              >
{PREMIUM_CTA.maybe_later}
              </button>
            </div>

            <p className="text-xs text-charcoal/60 mt-4">
              {PREMIUM_GUARANTEES.join(' • ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPaywall;