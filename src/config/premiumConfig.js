// Centralized Premium Content Configuration
// This file ensures consistency across all premium content displays

export const PREMIUM_PRICING = {
  monthly: {
    id: 'monthly',
    name: 'Premium',
    price: 47,
    billing: 'per month',
    displayPrice: '$47',
    badge: 'Most Popular',
    billingCycle: 'monthly'
  },
  annual: {
    id: 'annual', 
    name: 'Annual Premium',
    price: 470,
    billing: 'per year',
    displayPrice: '$470',
    badge: 'Best Value',
    savings: 'Save $94/year (2 months free)',
    billingCycle: 'annual'
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 147,
    billing: 'per month',
    displayPrice: '$147',
    badge: 'Growing Teams'
  }
};

export const PREMIUM_FEATURES = {
  core: [
    'All AI assessments (Knowledge + Organizational Readiness)',
    '30+ premium interactive ML/AI tools',
    'Complete implementation guides and playbooks',
    'Priority email support (24hr response)',
    'Industry-specific recommendations'
  ],
  monthly: [
    'All AI assessments (Knowledge + Organizational Readiness)',
    '30+ premium interactive ML/AI tools',
    'Complete implementation guides and playbooks',
    'Automatic action item generation',
    'Unlimited projects and progress tracking',
    'Priority email support (24hr response)',
    'Industry-specific recommendations',
    'Export all data (PDF, Excel, no watermarks)'
  ],
  annual: [
    'Everything in Premium',
    '3-day free trial',
    '2 months free (equivalent to $94 savings)',
    'Priority implementation support',
    'Advanced progress analytics',
    'Custom assessment schedules'
  ],
  business: [
    'Everything in Premium',
    'Team collaboration features',
    'Multiple user accounts (up to 10)',
    'Advanced analytics dashboard',
    'Priority phone support',
    'Team progress reporting',
    'Dedicated success manager'
  ]
};

export const PREMIUM_BENEFITS = [
  {
    title: 'All AI Assessments',
    description: 'Both AI Knowledge Navigator and Organizational Readiness assessments',
    icon: 'Crown'
  },
  {
    title: '30+ Premium ML/AI Tools',
    description: 'Full suite of interactive tools for regression, classification, clustering, NLP and more', 
    icon: 'CheckCircle'
  },
  {
    title: 'Action Items & Guides',
    description: 'Automatic action item generation and complete implementation guides',
    icon: 'Star'
  }
];

export const PREMIUM_MESSAGING = {
  paywall: {
    title: 'Premium Membership Required',
    subtitle: 'Unlock Complete AI Transformation Tools',
    description: 'Access intelligent assessments, interactive tools, and implementation guides designed for small businesses.'
  },
  upgrade: {
    title: 'Start Your 3-Day Free Trial',
    subtitle: 'Transform Your Business with AI',
    description: 'Join thousands of small businesses already using AI to work smarter, not harder.'
  },
  benefits: {
    title: 'What You\'ll Get with Premium',
    description: 'Complete AI transformation toolkit designed specifically for small businesses and nonprofits.'
  }
};

export const PREMIUM_CTA = {
  primary: 'Start 3-Day Free Trial',
  secondary: 'Upgrade to Premium', 
  trial: 'Start Free Trial',
  login: 'Sign In to Continue',
  maybe_later: 'Maybe Later',
  contact_sales: 'Contact Sales'
};

export const PREMIUM_GUARANTEES = [
  '3-day free trial',
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