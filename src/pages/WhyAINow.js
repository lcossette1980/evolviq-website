import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Users, 
  Target, 
  Zap, 
  Shield, 
  CheckCircle, 
  Phone,
  ShoppingBag,
  Heart,
  Briefcase,
  Home,
  Utensils,
  Stethoscope,
  GraduationCap,
  Palette,
  Building,
  TrendingUp,
  Clock,
  DollarSign,
  Bot,
  Brain,
  Sparkles
} from 'lucide-react';

const WhyAINow = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('retail');

  const sectors = [
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      icon: <ShoppingBag className="w-5 h-5" />,
      description: 'Transform your retail business with AI-powered insights and automation',
      challenges: [
        'Manual inventory tracking leads to stockouts or overstock',
        'Generic marketing that doesn\'t connect with customers',
        'Time-consuming customer service inquiries',
        'Difficulty predicting seasonal demand'
      ],
      aiSolutions: [
        {
          title: 'Smart Inventory Management',
          description: 'AI predicts demand patterns and automates reordering',
          tools: 'Inventory AI, demand forecasting models',
          timeToImplement: '2-4 weeks',
          roi: '20-30% reduction in inventory costs'
        },
        {
          title: 'Personalized Marketing',
          description: 'Create targeted campaigns based on customer behavior',
          tools: 'Email AI, social media content generators',
          timeToImplement: '1-2 weeks',
          roi: '35% increase in email open rates'
        },
        {
          title: 'AI Customer Support',
          description: '24/7 chatbot handles common questions instantly',
          tools: 'ChatGPT, custom chatbot platforms',
          timeToImplement: '2-3 weeks',
          roi: '60% reduction in support tickets'
        },
        {
          title: 'Dynamic Pricing',
          description: 'Optimize prices based on demand and competition',
          tools: 'Pricing optimization AI',
          timeToImplement: '3-4 weeks',
          roi: '15% increase in profit margins'
        }
      ],
      realExample: {
        business: 'Local Boutique Store',
        challenge: 'Spending 10+ hours/week on inventory and missing sales opportunities',
        solution: 'Implemented AI inventory tracking and personalized email campaigns',
        result: '30% increase in sales, 15 hours/week saved'
      },
      image: '/images/sectors/retail-ai.jpg'
    },
    {
      id: 'nonprofit',
      name: 'Non-Profit Organizations',
      icon: <Heart className="w-5 h-5" />,
      description: 'Amplify your impact with AI tools designed for mission-driven organizations',
      challenges: [
        'Limited staff handling multiple responsibilities',
        'Donor engagement and retention challenges',
        'Grant writing is time-intensive and competitive',
        'Measuring and communicating impact effectively'
      ],
      aiSolutions: [
        {
          title: 'Automated Grant Writing',
          description: 'AI assists in writing compelling grant proposals',
          tools: 'GPT-4, specialized grant writing AI',
          timeToImplement: '1 week',
          roi: '3x more grant applications submitted'
        },
        {
          title: 'Donor Engagement AI',
          description: 'Personalized communication at scale',
          tools: 'Email automation, donor analytics AI',
          timeToImplement: '2-3 weeks',
          roi: '40% increase in donor retention'
        },
        {
          title: 'Impact Reporting',
          description: 'Generate compelling reports and visualizations',
          tools: 'Data analysis AI, report generators',
          timeToImplement: '1-2 weeks',
          roi: '80% time reduction in reporting'
        },
        {
          title: 'Volunteer Matching',
          description: 'Match volunteers to opportunities based on skills',
          tools: 'Matching algorithms, scheduling AI',
          timeToImplement: '2-3 weeks',
          roi: '50% improvement in volunteer retention'
        }
      ],
      realExample: {
        business: 'Food Bank Organization',
        challenge: 'Staff of 5 managing 200+ volunteers and complex logistics',
        solution: 'AI-powered volunteer scheduling and donor communication',
        result: 'Doubled food distribution capacity without adding staff'
      },
      image: '/images/sectors/nonprofit-ai.jpg'
    },
    {
      id: 'professional',
      name: 'Professional Services',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Enhance client service and efficiency with AI-powered professional tools',
      challenges: [
        'Repetitive document creation and review',
        'Time tracking and billing inefficiencies',
        'Research takes hours for each client project',
        'Difficulty scaling personalized service'
      ],
      aiSolutions: [
        {
          title: 'Document Automation',
          description: 'Generate contracts, reports, and proposals instantly',
          tools: 'Legal AI, document generators',
          timeToImplement: '1-2 weeks',
          roi: '70% faster document creation'
        },
        {
          title: 'AI Research Assistant',
          description: 'Instant market research and competitive analysis',
          tools: 'Research AI, data analysis tools',
          timeToImplement: '1 week',
          roi: '5x faster research completion'
        },
        {
          title: 'Client Communication AI',
          description: 'Draft personalized emails and updates',
          tools: 'Email AI, CRM integration',
          timeToImplement: '1-2 weeks',
          roi: '40% time saved on communication'
        },
        {
          title: 'Predictive Analytics',
          description: 'Forecast project timelines and resource needs',
          tools: 'Project management AI',
          timeToImplement: '2-3 weeks',
          roi: '25% improvement in project margins'
        }
      ],
      realExample: {
        business: 'Small Accounting Firm',
        challenge: '60% of time spent on repetitive tasks, limiting growth',
        solution: 'AI for document processing and client communication',
        result: 'Doubled client capacity with same team size'
      },
      image: '/images/sectors/professional-ai.jpg'
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Wellness',
      icon: <Stethoscope className="w-5 h-5" />,
      description: 'Improve patient care and practice efficiency with healthcare AI',
      challenges: [
        'Administrative tasks consume clinical time',
        'Patient no-shows impact revenue',
        'Documentation requirements are overwhelming',
        'Difficulty providing 24/7 patient support'
      ],
      aiSolutions: [
        {
          title: 'Medical Documentation AI',
          description: 'Transcribe and summarize patient visits instantly',
          tools: 'Medical transcription AI, EHR integration',
          timeToImplement: '2-3 weeks',
          roi: '2 hours/day saved on documentation'
        },
        {
          title: 'Appointment Optimization',
          description: 'Reduce no-shows with smart scheduling',
          tools: 'Scheduling AI, reminder systems',
          timeToImplement: '1-2 weeks',
          roi: '30% reduction in no-shows'
        },
        {
          title: 'Patient Triage Chatbot',
          description: '24/7 symptom checking and appointment booking',
          tools: 'Healthcare chatbots, triage AI',
          timeToImplement: '3-4 weeks',
          roi: '50% reduction in phone calls'
        },
        {
          title: 'Billing Automation',
          description: 'Streamline insurance claims and patient billing',
          tools: 'Medical billing AI',
          timeToImplement: '2-3 weeks',
          roi: '40% faster payment collection'
        }
      ],
      realExample: {
        business: 'Family Medical Practice',
        challenge: 'Doctors spending 3+ hours daily on documentation',
        solution: 'AI transcription and automated patient communication',
        result: 'Increased patient visits by 25% with happier staff'
      },
      image: '/images/sectors/healthcare-ai.jpg'
    },
    {
      id: 'restaurant',
      name: 'Food Service',
      icon: <Utensils className="w-5 h-5" />,
      description: 'Optimize operations and delight customers with restaurant AI',
      challenges: [
        'Food waste from poor demand forecasting',
        'Staff scheduling complexity',
        'Managing online reviews and reputation',
        'Menu optimization for profitability'
      ],
      aiSolutions: [
        {
          title: 'Demand Forecasting',
          description: 'Predict busy periods and optimize prep',
          tools: 'Restaurant analytics AI',
          timeToImplement: '2-3 weeks',
          roi: '25% reduction in food waste'
        },
        {
          title: 'Smart Staff Scheduling',
          description: 'Optimize shifts based on predicted demand',
          tools: 'Scheduling AI, labor optimization',
          timeToImplement: '1-2 weeks',
          roi: '20% reduction in labor costs'
        },
        {
          title: 'Review Management AI',
          description: 'Monitor and respond to reviews automatically',
          tools: 'Reputation management AI',
          timeToImplement: '1 week',
          roi: '0.5 star increase in ratings'
        },
        {
          title: 'Menu Engineering',
          description: 'Optimize menu for profit and popularity',
          tools: 'Menu analysis AI, pricing tools',
          timeToImplement: '2-3 weeks',
          roi: '15% increase in profit margins'
        }
      ],
      realExample: {
        business: 'Local Restaurant Chain (3 locations)',
        challenge: 'Inconsistent service quality and high food costs',
        solution: 'AI demand forecasting and automated review responses',
        result: '20% reduction in costs, 4.2 to 4.7 star rating improvement'
      },
      image: '/images/sectors/restaurant-ai.jpg'
    },
    {
      id: 'education',
      name: 'Education & Training',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Transform learning experiences with educational AI tools',
      challenges: [
        'Creating personalized learning paths is time-intensive',
        'Grading and feedback consume teaching time',
        'Student engagement in virtual settings',
        'Curriculum development and updates'
      ],
      aiSolutions: [
        {
          title: 'Personalized Learning AI',
          description: 'Adapt content to each student\'s pace and style',
          tools: 'Adaptive learning platforms, AI tutors',
          timeToImplement: '2-4 weeks',
          roi: '40% improvement in outcomes'
        },
        {
          title: 'Automated Grading',
          description: 'Grade assignments and provide instant feedback',
          tools: 'Grading AI, feedback generators',
          timeToImplement: '1-2 weeks',
          roi: '10 hours/week saved on grading'
        },
        {
          title: 'Content Creation AI',
          description: 'Generate quizzes, lessons, and study materials',
          tools: 'Educational content AI',
          timeToImplement: '1 week',
          roi: '75% faster content creation'
        },
        {
          title: 'Student Support Chatbot',
          description: '24/7 answers to common student questions',
          tools: 'Educational chatbots',
          timeToImplement: '2-3 weeks',
          roi: '60% reduction in admin emails'
        }
      ],
      realExample: {
        business: 'Online Training Company',
        challenge: 'One instructor managing 500+ students',
        solution: 'AI grading, personalized learning paths, and chatbot support',
        result: 'Scaled to 2000 students without adding instructors'
      },
      image: '/images/sectors/education-ai.jpg'
    }
  ];

  const currentSector = sectors.find(s => s.id === activeTab);

  return (
    <div className="min-h-screen bg-bone">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-bone to-pearl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-khaki/10 px-4 py-2 rounded-full mb-6">
              <Brain className="w-5 h-5 text-khaki mr-2" />
              <span className="text-sm font-medium text-charcoal">The AI Advantage</span>
            </div>
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
              Why Small Businesses Need AI Now
            </h1>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto mb-8">
              Discover how AI can transform your specific type of business with practical, 
              affordable solutions that deliver immediate results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/tools/ai-knowledge-navigator')}
                className="bg-gradient-to-r from-khaki to-khaki/80 text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Assess Your AI Readiness
              </button>
              <button 
                onClick={() => navigate('/services')}
                className="border-2 border-chestnut text-chestnut px-8 py-4 rounded-lg font-medium hover:bg-chestnut hover:text-white transition-colors"
              >
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-chestnut mb-2">73%</div>
              <div className="text-sm text-charcoal/70">of small businesses want AI but don't know where to start</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-khaki mb-2">2.5x</div>
              <div className="text-sm text-charcoal/70">productivity gains from AI implementation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-chestnut mb-2">45%</div>
              <div className="text-sm text-charcoal/70">cost reduction in operational tasks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-khaki mb-2">6mo</div>
              <div className="text-sm text-charcoal/70">average payback period</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sector Tabs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              How AI Transforms Your Industry
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              Select your industry to see specific AI solutions and real success stories
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-2 mb-12 overflow-x-auto">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setActiveTab(sector.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === sector.id
                    ? 'bg-gradient-to-r from-chestnut to-khaki text-white shadow-lg transform scale-105'
                    : 'bg-white text-charcoal hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {sector.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {currentSector && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Sector Header */}
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-chestnut to-khaki text-white rounded-lg flex items-center justify-center mr-4">
                      {currentSector.icon}
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-charcoal">
                      {currentSector.name}
                    </h3>
                  </div>
                  <p className="text-lg text-charcoal/80 mb-6">
                    {currentSector.description}
                  </p>

                  {/* Common Challenges */}
                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="font-medium text-lg text-red-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Common Challenges
                    </h4>
                    <ul className="space-y-2">
                      {currentSector.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start text-red-800">
                          <span className="text-red-600 mr-2">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sector Image */}
                <div className="relative">
                  <div className="rounded-lg h-full min-h-[300px] overflow-hidden bg-gray-100">
                    <img 
                      src={currentSector.image} 
                      alt={`AI in ${currentSector.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="bg-pearl/30 rounded-lg p-8 h-full min-h-[300px] flex items-center justify-center" style={{display: 'none'}}>
                      <div className="text-center">
                        <div className="w-24 h-24 bg-chestnut/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          {currentSector.icon}
                        </div>
                        <div className="text-charcoal/60 text-sm">{currentSector.image}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Solutions Grid */}
              <div className="mb-12">
                <h4 className="font-serif font-bold text-2xl text-charcoal mb-6 flex items-center">
                  <Sparkles className="w-6 h-6 text-khaki mr-3" />
                  AI Solutions for {currentSector.name}
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {currentSector.aiSolutions.map((solution, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-khaki/5 to-chestnut/5 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h5 className="font-medium text-lg text-charcoal mb-2">
                        {solution.title}
                      </h5>
                      <p className="text-charcoal/80 mb-4">
                        {solution.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-charcoal/70">
                          <Bot className="w-4 h-4 mr-2 text-khaki" />
                          <span><strong>Tools:</strong> {solution.tools}</span>
                        </div>
                        <div className="flex items-center text-charcoal/70">
                          <Clock className="w-4 h-4 mr-2 text-chestnut" />
                          <span><strong>Time:</strong> {solution.timeToImplement}</span>
                        </div>
                        <div className="flex items-center text-charcoal/70">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                          <span><strong>ROI:</strong> {solution.roi}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Example */}
              <div className="bg-gradient-to-r from-chestnut/10 to-khaki/10 rounded-lg p-8">
                <h4 className="font-serif font-bold text-xl text-charcoal mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                  Real Success Story
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium text-charcoal mb-2">
                      {currentSector.realExample.business}
                    </p>
                    <p className="text-charcoal/80 mb-4">
                      <strong>Challenge:</strong> {currentSector.realExample.challenge}
                    </p>
                    <p className="text-charcoal/80 mb-4">
                      <strong>Solution:</strong> {currentSector.realExample.solution}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                      <p className="text-lg font-medium text-chestnut mb-2">Result:</p>
                      <p className="text-2xl font-bold text-charcoal">
                        {currentSector.realExample.result}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Now Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              Why AI Implementation Can't Wait
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              The gap between AI-enabled businesses and traditional ones is growing daily
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-chestnut to-chestnut/80 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-xl text-charcoal mb-3">Competitive Advantage</h3>
              <p className="text-charcoal/70">
                Early adopters are already seeing 2-3x productivity gains. Every month you wait, 
                competitors pull further ahead.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-khaki to-khaki/80 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-xl text-charcoal mb-3">Cost Efficiency</h3>
              <p className="text-charcoal/70">
                AI tools are more affordable and accessible than ever. What cost $100k+ 
                five years ago is now available for $50-500/month.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-chestnut to-chestnut/80 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-medium text-xl text-charcoal mb-3">Customer Expectations</h3>
              <p className="text-charcoal/70">
                Customers now expect 24/7 support, instant responses, and personalized 
                experiences—only possible with AI.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-chestnut/5 to-khaki/5 rounded-xl p-8 text-center">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
              The Cost of Waiting
            </h3>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">15hrs</div>
                <div className="text-sm text-charcoal/70">wasted weekly on tasks AI could handle</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">$3.2k</div>
                <div className="text-sm text-charcoal/70">monthly cost of inefficiency</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">23%</div>
                <div className="text-sm text-charcoal/70">customers lost to AI-enabled competitors</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">6mo</div>
                <div className="text-sm text-charcoal/70">behind industry leaders</div>
              </div>
            </div>
            <p className="text-lg text-charcoal/80 mb-6">
              Every day without AI is a day your competitors gain ground. Start your transformation today.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-bone to-pearl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              Ready to Transform Your Business with AI?
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto mb-8">
              Join thousands of small businesses already using AI to work smarter, not harder.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-khaki to-khaki/80 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-lg text-charcoal mb-2">Step 1: Assess</h3>
                <p className="text-charcoal/70 mb-4">
                  Discover your AI readiness with our intelligent assessment
                </p>
                <button 
                  onClick={() => navigate('/tools/ai-knowledge-navigator')}
                  className="text-khaki font-medium hover:underline"
                >
                  Take Assessment →
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-chestnut to-chestnut/80 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-lg text-charcoal mb-2">Step 2: Plan</h3>
                <p className="text-charcoal/70 mb-4">
                  Get a customized AI roadmap for your specific business
                </p>
                <button 
                  onClick={() => navigate('/services')}
                  className="text-chestnut font-medium hover:underline"
                >
                  Explore Services →
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-khaki to-khaki/80 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-lg text-charcoal mb-2">Step 3: Transform</h3>
                <p className="text-charcoal/70 mb-4">
                  Implement AI solutions and see immediate results
                </p>
                <button 
                  onClick={() => window.location.href = '/service-intake'}
                  className="text-khaki font-medium hover:underline"
                >
                  Get Started →
                </button>
              </div>
            </div>

            <div className="mt-12">
              <button 
                onClick={() => navigate('/tools/ai-knowledge-navigator')}
                className="bg-gradient-to-r from-chestnut to-khaki text-white px-12 py-5 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
              >
                Start Your AI Journey Today - Free Assessment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyAINow;