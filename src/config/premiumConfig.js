// Centralized Premium Content Configuration
// This file ensures consistency across all premium content displays

export const PREMIUM_PRICING = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Premium',
    price: 97,
    billing: 'per month',
    displayPrice: '$97',
    badge: 'Most Popular',
    billingCycle: 'monthly'
  },
  annual: {
    id: 'annual', 
    name: 'Annual Premium',
    price: 777,
    billing: 'per year',
    displayPrice: '$777',
    badge: 'Best Value',
    savings: 'Save $387/year',
    billingCycle: 'annual'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    billing: 'contact sales',
    displayPrice: 'Custom',
    badge: 'Enterprise'
  }
};

export const PREMIUM_FEATURES = {
  core: [
    'Access to all implementation guides',
    'Advanced assessment tools', 
    'Exclusive video training library',
    'Priority email support',
    'Downloadable templates & frameworks'
  ],
  monthly: [
    'Access to all implementation guides',
    'Advanced assessment tools',
    'Exclusive video training library', 
    'Priority email support',
    'Monthly strategy sessions',
    'Downloadable templates & frameworks'
  ],
  annual: [
    'Everything in Monthly Premium',
    'Quarterly 1-on-1 strategy calls',
    'Custom AI implementation roadmap',
    'White-label presentation templates',
    'Advanced ROI modeling tools',
    'Private Slack community access'
  ],
  enterprise: [
    'Everything in Annual Premium',
    'Custom assessments',
    'Dedicated success manager',
    'White-label solutions',
    'API access',
    'Custom integrations'
  ]
};

export const PREMIUM_BENEFITS = [
  {
    title: 'Complete Implementation Guides',
    description: 'Step-by-step playbooks for AI transformation',
    icon: 'Crown'
  },
  {
    title: 'Assessment Tools',
    description: 'Evaluate readiness and identify opportunities', 
    icon: 'CheckCircle'
  },
  {
    title: 'Expert Support',
    description: 'Direct access to AI implementation experts',
    icon: 'Star'
  }
];

export const PREMIUM_MESSAGING = {
  paywall: {
    title: 'Premium Content',
    subtitle: 'Unlock Advanced AI Implementation Resources',
    description: 'Access exclusive guides, assessments, and expert support to accelerate your AI transformation.'
  },
  upgrade: {
    title: 'Upgrade to Premium',
    subtitle: 'Accelerate Your AI Journey',
    description: 'Join thousands of executives who\'ve successfully implemented AI with our proven frameworks.'
  },
  benefits: {
    title: 'What You\'ll Get with Premium',
    description: 'Comprehensive resources and expert guidance for successful AI implementation.'
  }
};

export const PREMIUM_CTA = {
  primary: 'Start Premium Access',
  secondary: 'Upgrade to Premium', 
  trial: 'Start Premium Trial',
  login: 'Sign In to Continue',
  maybe_later: 'Maybe Later',
  contact_sales: 'Contact Sales'
};

export const PREMIUM_GUARANTEES = [
  '30-day money-back guarantee',
  'Cancel anytime', 
  'Secure payment',
  'No setup fees'
];

// Utility functions for premium content
export const getPremiumFeatures = (planType = 'core') => {
  return PREMIUM_FEATURES[planType] || PREMIUM_FEATURES.core;
};

export const getPremiumPricing = (planId) => {
  return PREMIUM_PRICING[planId];
};

export const formatPremiumPrice = (planId) => {
  const plan = PREMIUM_PRICING[planId];
  if (!plan) return 'Contact Sales';
  
  if (typeof plan.price === 'number') {
    return `$${plan.price}`;
  }
  return plan.price;
};

export const isPremiumRequired = (contentType) => {
  const premiumContent = [
    'implementation-guides',
    'advanced-assessments',
    'video-library',
    'strategy-templates',
    'roi-calculator'
  ];
  
  return premiumContent.includes(contentType);
};

export const getPremiumStatusMessage = (isPremium, contentType) => {
  if (isPremium) {
    return { 
      status: 'granted', 
      message: 'Premium Access', 
      action: 'Access Content'
    };
  }
  
  if (isPremiumRequired(contentType)) {
    return {
      status: 'required',
      message: 'Premium Required',
      action: 'Upgrade to Premium'
    };
  }
  
  return {
    status: 'free',
    message: 'Free Access',
    action: 'Access Content'
  };
};