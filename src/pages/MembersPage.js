import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle, 
  Download, 
  BookOpen, 
  FileText, 
  Play, 
  Lock, 
  User, 
  Settings, 
  TrendingUp, 
  Brain, 
  Zap,
  Crown,
  Users,
  Shield,
  BarChart3,
  ArrowRight,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  Rocket,
  Award,
  Clock,
  DollarSign,
  Briefcase,
  PlayCircle,
  Layers,
  Filter,
  Search,
  ChevronRight
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
  const { user, setIsLoginModalOpen, isPremium, upgradeToAnonymous, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [paywall, setPaywall] = useState({
    isOpen: false,
    guideTitle: '',
    guideDescription: ''
  });
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (plan) => {
    setIsUpgrading(true);
    try {
      const success = await upgradeToPremium(plan);
      if (success) {
        console.log('Successfully upgraded to premium');
        setPaywall({ ...paywall, isOpen: false });
        navigate('/dashboard');
      } else {
        console.error('Failed to upgrade to premium');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
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
      icon: <Target className="w-8 h-8" />,
      title: "AI Assessments",
      description: "Comprehensive multi-agent assessments that evaluate your AI knowledge and organizational readiness",
      details: [
        "AI Knowledge Navigator with personalized learning paths",
        "Change Readiness Assessment with expert agent analysis",
        "Project-specific assessment tracking",
        "Progress monitoring and recommendations"
      ]
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Implementation Guides",
      description: "Step-by-step guides created by AI experts to help you successfully implement AI solutions",
      details: [
        "AI Implementation Playbook",
        "AI Readiness Assessment Guide",
        "AI Use Case ROI Toolkit",
        "AI Strategy Starter Kit"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Project Management",
      description: "Organize multiple AI projects with comprehensive tracking and analytics",
      details: [
        "Multi-project dashboard",
        "Assessment history and progress tracking",
        "Action item management",
        "Timeline and milestone tracking"
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Support",
      description: "Access to AI implementation experts and community support",
      details: [
        "Priority support channels",
        "Expert consultation access",
        "Community forum participation",
        "Regular office hours and Q&A"
      ]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Tools",
      description: "Cutting-edge AI tools to accelerate your implementation journey",
      details: [
        "Agentic assessment systems",
        "Personalized recommendation engine",
        "ROI calculators and planning tools",
        "Custom analysis and reporting"
      ]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Data Security",
      description: "Enterprise-grade security and privacy for all your AI project data",
      details: [
        "End-to-end encryption",
        "SOC 2 compliance",
        "Data export capabilities",
        "Privacy-first approach"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO, TechCorp",
      company: "TechCorp",
      image: "/images/testimonials/sarah-johnson.jpg",
      quote: "The Change Readiness Assessment gave us incredible insights into our organization's AI readiness. The multi-agent approach provided perspectives we never considered.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "AI Strategy Lead",
      company: "InnovateCo",
      image: "/images/testimonials/michael-chen.jpg",
      quote: "EvolvIQ's implementation guides saved us months of planning. The step-by-step approach made our AI rollout smooth and successful. I am truly grateful for the support.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Operations Director",
      company: "ServicePro",
      image: "/images/testimonials/lisa-rodriguez.jpg",
      quote: "The project management features helped us track multiple AI initiatives simultaneously. The insights from assessments directly fed into our action plans.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for exploring AI basics",
      features: [
        "AI Knowledge Navigator (basic)",
        "1 project",
        "Basic guides access",
        "Community support"
      ],
      limitations: [
        "No Change Readiness Assessment",
        "Limited guide features",
        "No priority support",
        "No team features"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Premium",
      price: "$97",
      period: "month",
      description: "Complete AI implementation toolkit",
      features: [
        "All assessments including Change Readiness",
        "Unlimited projects",
        "Complete implementation guides",
        "Multi-agent assessment system",
        "Action item management",
        "Progress tracking and analytics",
        "Priority support",
        "Team collaboration features"
      ],
      limitations: [],
      cta: "Start Premium Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "Tailored solutions for large organizations",
      features: [
        "Everything in Premium",
        "Custom assessments",
        "Dedicated success manager",
        "White-label options",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "On-premise deployment"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const stats = [
    { number: "10,000+", label: "AI Projects Launched" },
    { number: "95%", label: "Success Rate" },
    { number: "50+", label: "Industry Experts" },
    { number: "24/7", label: "Support Available" }
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
          Master AI Implementation with
          <span className="block" style={{ color: colors.chestnut }}>
            Expert Guidance & Tools
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Join thousands of organizations successfully implementing AI with our comprehensive 
          assessment tools, implementation guides, and expert support system.
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
            Trusted by AI Leaders
          </h2>
          <p className="text-xl text-gray-600">
            See how organizations like yours are succeeding with EvolvIQ
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
                  if (plan.name === 'Enterprise') {
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
          Ready to Transform Your Organization?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of organizations successfully implementing AI with our expert guidance
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