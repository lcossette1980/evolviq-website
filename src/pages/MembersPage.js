import React, { useState } from 'react';
import { 
  Target, 
  BookOpen, 
  Brain, 
  Zap,
  Users,
  Shield,
  Star,
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PremiumPaywall from '../components/auth/PremiumPaywall';

const colors = {
  charcoal: '#2A2A2A',
  chestnut: '#A44A3F',
  khaki: '#A59E8C',
  pearl: '#D7CEB2',
  bone: '#F5F2EA'
};

const MembersPage = () => {
  const { user, setIsLoginModalOpen, isPremium, initiatePremiumUpgrade } = useAuth();
  const navigate = useNavigate();
  const [paywall, setPaywall] = useState({
    isOpen: false,
    guideTitle: '',
    guideDescription: ''
  });
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (plan) => {
    setIsUpgrading(true);
    try {
      // Use secure payment flow instead of client-side bypass
      await initiatePremiumUpgrade(plan);
      // User will be redirected to Stripe checkout
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      // Show user-friendly error message
      alert('Failed to start payment process. Please try again.');
      setIsUpgrading(false);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      if (isPremium) {
        navigate('/dashboard');
      } else {
        // Show upgrade options
        setPaywall({
          isOpen: true,
          guideTitle: 'Premium Membership',
          guideDescription: 'Unlock all features and accelerate your AI journey'
        });
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Intelligent AI Assessments",
      description: "Multi-agent AI assessments that understand you and provide personalized recommendations",
      details: [
        "AI Knowledge Navigator with custom learning paths",
        "Change Readiness Assessment for your team",
        "Sector-specific recommendations and use cases",
        "Real-time progress tracking and insights"
      ]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Interactive AI Tools",
      description: "Hands-on tools to explore and understand AI capabilities for your business",
      details: [
        "Linear Regression Explorer for sales forecasting",
        "Classification tools for customer segmentation", 
        "Clustering analysis for market insights",
        "NLP tools for customer feedback analysis"
      ]
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Implementation Guides",
      description: "Step-by-step guides designed for small businesses to implement AI successfully",
      details: [
        "AI Implementation Playbook for your industry",
        "Right-sized strategies for small teams",
        "Budget-conscious implementation plans",
        "ROI tracking and measurement tools"
      ]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Action-Oriented Results",
      description: "Every assessment generates specific, actionable next steps tailored to your business",
      details: [
        "Prioritized action item lists",
        "Timeline and resource estimates",
        "Quick wins and long-term strategies",
        "Implementation difficulty ratings"
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Small Business Focus",
      description: "All tools and resources designed for small businesses, nonprofits, and service organizations",
      details: [
        "Right-sized for small teams and budgets",
        "Industry-specific examples and case studies",
        "Affordable implementation strategies",
        "Community of like-minded business owners"
      ]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Simple & Secure",
      description: "Easy-to-use platform with enterprise-grade security that doesn't require technical expertise",
      details: [
        "No technical background required",
        "Secure data handling and privacy",
        "Export your data anytime",
        "Mobile-friendly tools and assessments"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Executive Director",
      company: "Community Food Bank",
      image: "/images/testimonials/maria-santos.jpg",
      quote: "The AI Assessment showed us exactly where to start with our limited resources. We've doubled our volunteer coordination efficiency without adding staff.",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Owner",
      company: "Kim's Hardware Store",
      image: "/images/testimonials/david-kim.jpg",
      quote: "As a small business owner, I thought AI was too complex for us. EvolvIQ's tools made it simple and affordable. Our inventory management is now automated and our sales have increased 25%.",
      rating: 5
    },
    {
      name: "Jennifer Walsh",
      role: "Practice Manager",
      company: "Riverside Family Medicine",
      image: "/images/testimonials/jennifer-walsh.jpg",
      quote: "The step-by-step approach helped our small medical practice implement AI scheduling and documentation. Our doctors now spend 2 more hours per day with patients.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get started with AI assessment basics",
      features: [
        "AI Knowledge Navigator assessment only",
        "Limited EDA Explorer tool (10K rows, CSV export)",
        "View assessment results",
        "Basic learning resources"
      ],
      limitations: [
        "No Organizational Readiness Assessment",
        "No premium interactive ML/AI tools",
        "No action item generation",
        "No implementation guides",
        "No projects or progress tracking"
      ],
      cta: "Start Free Today",
      popular: false
    },
    {
      name: "Premium",
      price: "$47",
      period: "month",
      description: "Complete AI transformation toolkit for small businesses",
      features: [
        "All AI assessments (Knowledge + Organizational Readiness)",
        "30+ premium interactive ML/AI tools",
        "Complete implementation guides and playbooks",
        "Automatic action item generation",
        "Unlimited projects and progress tracking",
        "Priority email support (24hr response)",
        "Industry-specific recommendations",
        "Export all data (PDF, Excel, no watermarks)"
      ],
      limitations: [],
      cta: "Start 3-Day Free Trial",
      popular: true
    },
    {
      name: "Business",
      price: "$147",
      period: "month",
      description: "Everything for growing teams and multiple locations",
      features: [
        "Everything in Premium",
        "Team collaboration features",
        "Multiple user accounts (up to 10)",
        "Advanced analytics dashboard",
        "Priority phone support",
        "Custom assessment schedules",
        "Team progress reporting",
        "Dedicated success manager"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const stats = [
    { number: "2,500+", label: "Small Businesses Served" },
    { number: "87%", label: "See ROI Within 6 Months" },
    { number: "45%", label: "Average Cost Reduction" },
    { number: "2.5x", label: "Productivity Increase" }
  ];

  const renderHeroSection = () => (
    <div className="bg-gradient-to-br from-pearl to-bone py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
            Transform Your Organization with AI
          </span>
        </div>
        <h1 className="text-5xl font-bold mb-6" style={{ color: colors.charcoal }}>
          AI Tools & Resources for
          <span className="block" style={{ color: colors.chestnut }}>
            Small Business Success
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Everything you need to transform your business with AI - from intelligent assessments 
          to step-by-step guides, designed specifically for small businesses and nonprofits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ backgroundColor: colors.chestnut }}
          >
            {user ? (isPremium ? 'Go to Dashboard' : 'Upgrade to Premium') : 'Start Free Trial'}
          </button>
          <button
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-full border-2 font-semibold text-lg transition-all duration-200 hover:bg-gray-50"
            style={{ borderColor: colors.charcoal, color: colors.charcoal }}
          >
            Learn More
          </button>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold" style={{ color: colors.chestnut }}>
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeaturesSection = () => (
    <div id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.charcoal }}>
            Everything You Need for AI Success
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools and resources to guide your AI implementation journey from assessment to deployment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div 
                  className="p-3 rounded-lg mr-4"
                  style={{ backgroundColor: `${colors.chestnut}20` }}
                >
                  <div style={{ color: colors.chestnut }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold" style={{ color: colors.charcoal }}>
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.chestnut }} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTestimonialsSection = () => (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.charcoal }}>
            Trusted by Small Business Leaders
          </h2>
          <p className="text-xl text-gray-600">
            See how small businesses, nonprofits, and service organizations are succeeding with AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" style={{ color: colors.chestnut }} />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-sm font-medium" style={{ color: colors.chestnut }}>
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPricingSection = () => (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.charcoal }}>
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you're ready to scale
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-8 relative ${
                plan.popular 
                  ? 'border-2 shadow-lg' 
                  : 'border border-gray-200'
              }`}
              style={{ 
                borderColor: plan.popular ? colors.chestnut : undefined,
                backgroundColor: plan.popular ? `${colors.chestnut}05` : 'white'
              }}
            >
              {plan.popular && (
                <div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: colors.chestnut }}
                >
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold" style={{ color: colors.chestnut }}>
                    {plan.price}
                  </span>
                  {plan.period !== 'contact us' && (
                    <span className="text-gray-500">/{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.chestnut }} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, idx) => (
                  <li key={idx} className="flex items-start text-gray-400">
                    <X className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => {
                  if (plan.name === 'Business') {
                    window.location.href = 'mailto:loren@evolviq.org';
                  } else {
                    handleGetStarted();
                  }
                }}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'text-white shadow-lg hover:scale-105'
                    : 'border-2 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: plan.popular ? colors.chestnut : 'transparent',
                  borderColor: plan.popular ? colors.chestnut : colors.charcoal,
                  color: plan.popular ? 'white' : colors.charcoal
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCTASection = () => (
    <div className="py-20 text-white" style={{ background: `linear-gradient(to right, ${colors.chestnut}, ${colors.khaki})` }}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Transform Your Business with AI?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of small businesses already using AI to work smarter, not harder
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white rounded-full font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ color: colors.chestnut }}
          >
            Start Your AI Journey
          </button>
          <button
            onClick={() => window.location.href = 'mailto:loren@evolviq.org'}
            className="px-8 py-4 border-2 border-white rounded-full font-semibold text-lg transition-all duration-200 hover:bg-white"
            style={{ 
              borderColor: 'white',
              color: 'white'
            }}
            onMouseEnter={(e) => e.target.style.color = colors.chestnut}
            onMouseLeave={(e) => e.target.style.color = 'white'}
          >
            Talk to an Expert
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {renderHeroSection()}
      {renderFeaturesSection()}
      {renderTestimonialsSection()}
      {renderPricingSection()}
      {renderCTASection()}
      
      {/* Premium Paywall Modal */}
      <PremiumPaywall
        isOpen={paywall.isOpen}
        onClose={() => setPaywall({ ...paywall, isOpen: false })}
        guideTitle={paywall.guideTitle}
        guideDescription={paywall.guideDescription}
        onUpgrade={handleUpgrade}
        isUpgrading={isUpgrading}
      />
    </div>
  );
};

export default MembersPage;