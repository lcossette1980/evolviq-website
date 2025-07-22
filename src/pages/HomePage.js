import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Target, Zap, Shield, CheckCircle, Phone } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "AI That Works for Small Businesses",
      subtitle: "Accessible, practical AI solutions that grow with you",
      description: "From family-owned shops to growing service companies, we make AI transformation achievable without enterprise-level complexity or cost.",
      image: "/images/hero/hero-small-business.jpg",
      cta: "Start Small, Scale Smart"
    },
    {
      title: "Nonprofits Amplifying Impact with AI",
      subtitle: "Technology that serves your mission",
      description: "Maximize your impact with AI tools designed for nonprofits. Streamline operations, enhance donor engagement, and focus more resources on what matters most.",
      image: "/images/hero/hero-nonprofit.jpg", 
      cta: "Amplify Your Mission"
    },
    {
      title: "Service Organizations Staying Competitive",
      subtitle: "Human-centered AI that enhances client relationships",
      description: "Professional services firms using AI to deliver better client outcomes while maintaining the personal touch that sets them apart.",
      image: "/images/hero/hero-services.jpg",
      cta: "Enhance Your Service"
    }
  ];

  const frameworks = [
    {
      phase: "1",
      title: "Discovery",
      description: "Readiness evaluation, opportunity identification, budget-conscious planning",
      duration: "1-2 weeks",
      investment: "$2.5K - $7.5K"
    },
    {
      phase: "2", 
      title: "Strategic Planning",
      description: "Right-sized AI roadmap, priority use cases, simple governance framework",
      duration: "2-3 weeks",
      investment: "$3.5K - $12K"
    },
    {
      phase: "3",
      title: "Team Preparation", 
      description: "Staff training, change support, practical AI literacy for your team",
      duration: "2-4 weeks",
      investment: "$2K - $8K"
    },
    {
      phase: "4",
      title: "Implementation",
      description: "Start small pilot project, hands-on support, measurable quick wins", 
      duration: "3-8 weeks",
      investment: "$5K - $25K"
    },
    {
      phase: "5",
      title: "Growth & Support",
      description: "Expand successful initiatives, ongoing guidance, sustainable AI practices",
      duration: "4-8 weeks", 
      investment: "$3K - $15K"
    }
  ];

  const differentiators = [
    {
      icon: <Target className="w-8 h-8 text-chestnut" />,
      title: "Right-Sized for You",
      description: "AI solutions scaled to your team size, budget, and goals—no enterprise overhead"
    },
    {
      icon: <Users className="w-8 h-8 text-chestnut" />,
      title: "People-First Approach", 
      description: "Your team stays at the center—AI enhances their work, doesn't replace it"
    },
    {
      icon: <Zap className="w-8 h-8 text-chestnut" />,
      title: "Practical Implementation",
      description: "Start with simple, high-impact projects that show results quickly and build confidence"
    },
    {
      icon: <Shield className="w-8 h-8 text-chestnut" />,
      title: "Affordable Excellence",
      description: "Professional-grade AI guidance at prices that make sense for growing organizations"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="min-h-screen bg-bone">
      {/* Hero Carousel Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-bone to-pearl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-1000 ${
                  index === currentSlide 
                    ? 'opacity-100 transform translate-x-0' 
                    : 'opacity-0 transform translate-x-full absolute inset-0'
                }`}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="text-left">
                    <div className="text-chestnut font-medium mb-2">{slide.subtitle}</div>
                    <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-charcoal/80 mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    {/* Two Ways to Transform - Hero CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                      <button 
                        onClick={() => navigate('/tools/ai-knowledge-navigator')}
                        className="flex-1 bg-khaki text-white py-3 px-6 rounded-lg hover:bg-khaki/90 transition-colors font-medium text-center"
                      >
                        🧠 Start with AI Assessment
                      </button>
                      <button 
                        onClick={() => navigate('/services')}
                        className="flex-1 border-2 border-chestnut text-chestnut py-3 px-6 rounded-lg hover:bg-chestnut hover:text-white transition-colors font-medium text-center"
                      >
                        📞 Get Expert Guidance
                      </button>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-charcoal/60">
                        ✨ <strong>Two ways to transform:</strong> Self-paced learning or guided consulting
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="rounded-2xl h-64 sm:h-80 lg:h-96 overflow-hidden">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="bg-pearl/30 rounded-2xl p-8 h-64 sm:h-80 lg:h-96 flex items-center justify-center" style={{display: 'none'}}>
                        <div className="text-center">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-chestnut/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-chestnut" />
                          </div>
                          <div className="text-charcoal/60 text-sm">{slide.image}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Carousel Controls - moved further down */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-white/80 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors touch-manipulation ${
                    index === currentSlide ? 'bg-chestnut' : 'bg-chestnut/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-6">
                The AI Gap for Small Organizations
              </h2>
              <div className="space-y-4 text-charcoal/80">
                <div className="bg-pearl/20 rounded-lg p-4 border-l-4 border-chestnut">
                  <p className="text-lg font-medium text-chestnut mb-2">The Challenge:</p>
                  <p className="text-base">
                    73% of small businesses want AI but feel overwhelmed by enterprise solutions that don't fit their budget, team size, or processes.
                  </p>
                </div>
                <div className="bg-khaki/10 rounded-lg p-4 border-l-4 border-khaki">
                  <p className="text-lg font-medium text-khaki mb-2">Our Solution:</p>
                  <p className="text-base">
                    Right-sized AI transformation that works with your existing team and delivers real results—without the complexity or enterprise price tag.
                  </p>
                </div>
                <div className="flex items-center justify-center mt-6">
                  <button 
                    onClick={() => navigate('/tools/ai-knowledge-navigator')}
                    className="bg-gradient-to-r from-chestnut to-khaki text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    🚀 Discover Your AI Readiness - Free Assessment
                  </button>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl h-64 sm:h-72 lg:h-80 overflow-hidden">
                <img 
                  src="/images/homepage/small-business-challenges.jpg" 
                  alt="Small business challenges with AI adoption"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="bg-pearl/30 rounded-2xl p-8 h-64 sm:h-72 lg:h-80 flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-khaki/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-khaki" />
                    </div>
                    <div className="text-charcoal/60 text-sm">small-business-challenges.jpg</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-chestnut mb-2">73%</div>
                  <div className="text-sm text-charcoal">of small businesses want AI but don't know where to start</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The EvolvIQ Difference */}
      <section className="py-16 bg-bone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              The EvolvIQ Difference
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              We unite strategy, culture, and technology under one unified vision for transformation that lasts.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentiators.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-medium text-lg text-charcoal mb-2">{item.title}</h3>
                <p className="text-charcoal/70 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Approach: Consulting + Interactive Tools */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-chestnut/10 to-khaki/10 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium text-chestnut mr-2">✨</span>
              <span className="text-sm font-medium text-charcoal">Choose Your Path</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              Two Ways to Transform with AI
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              Start learning immediately or get expert guidance—both paths lead to AI transformation success.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Consulting Path */}
            <div className="bg-pearl/20 rounded-xl p-8 hover:bg-pearl/30 transition-all duration-300 border-2 border-transparent hover:border-chestnut/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-chestnut to-chestnut/80 text-white rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl text-charcoal">Guided Consulting</h3>
                  <p className="text-sm text-chestnut font-medium">Expert-Led Transformation</p>
                </div>
              </div>
              <p className="text-charcoal/80 mb-6 text-lg">
                Work directly with our AI strategists to create a customized transformation roadmap, 
                train your team, and implement solutions that deliver <strong>measurable results</strong>.
              </p>
              <div className="bg-white/50 rounded-lg p-4 mb-6">
                <div className="flex items-center text-chestnut font-medium text-sm mb-2">
                  <span className="mr-2">🏆</span>
                  Best for organizations that want:
                </div>
                <div className="text-sm text-charcoal/70">
                  Customized strategy • Expert implementation • Team training • Ongoing support
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-chestnut mr-3 flex-shrink-0" />
                  <span>1-on-1 strategy sessions</span>
                </li>
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-chestnut mr-3 flex-shrink-0" />
                  <span>Custom implementation plans</span>
                </li>
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-chestnut mr-3 flex-shrink-0" />
                  <span>Team training & change management</span>
                </li>
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-chestnut mr-3 flex-shrink-0" />
                  <span>Ongoing support & guidance</span>
                </li>
              </ul>
              <button 
                onClick={() => navigate('/services')}
                className="w-full bg-chestnut text-white py-3 rounded-lg hover:bg-chestnut/90 transition-colors"
              >
                Explore Consulting Services
              </button>
            </div>

            {/* Webapp/Membership Path */}
            <div className="bg-khaki/20 rounded-xl p-8 border-2 border-khaki/40 hover:bg-khaki/30 transition-all duration-300 hover:border-khaki/60 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-khaki text-white text-xs px-2 py-1 rounded-full font-medium">Popular</span>
              </div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-khaki to-khaki/80 text-white rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl text-charcoal">Interactive Learning</h3>
                  <p className="text-sm text-khaki font-medium">Self-Paced Discovery</p>
                </div>
              </div>
              <p className="text-charcoal/80 mb-6 text-lg">
                Learn through doing with our <strong>intelligent AI assessments</strong>, interactive tools, and premium resources. 
                Perfect for self-directed learners and teams ready to experiment.
              </p>
              <div className="bg-white/50 rounded-lg p-4 mb-6">
                <div className="flex items-center text-khaki font-medium text-sm mb-2">
                  <span className="mr-2">🚀</span>
                  Best for teams that want to:
                </div>
                <div className="text-sm text-charcoal/70">
                  Start immediately • Learn by doing • Control the pace • Access premium resources
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-khaki mr-3 flex-shrink-0" />
                  <span>5 interactive ML tools & playgrounds</span>
                </li>
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-khaki mr-3 flex-shrink-0" />
                  <span>🤖 <strong>Intelligent AI readiness assessments</strong></span>
                </li>
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-khaki mr-3 flex-shrink-0" />
                  <span>Strategy templates & guides</span>
                </li>
                <li className="flex items-center text-charcoal/80">
                  <CheckCircle className="w-5 h-5 text-khaki mr-3 flex-shrink-0" />
                  <span>Premium learning resources</span>
                </li>
              </ul>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/tools/ai-knowledge-navigator')}
                  className="w-full bg-gradient-to-r from-khaki to-khaki/80 text-white py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  🚀 Start Free AI Assessment
                </button>
                <button 
                  onClick={() => navigate('/membership')}
                  className="w-full border-2 border-khaki text-khaki py-3 rounded-lg hover:bg-khaki hover:text-white transition-colors font-medium"
                >
                  Explore Premium Features
                </button>
              </div>
            </div>
          </div>

          {/* Combined Value Proposition */}
          <div className="mt-12 text-center bg-gradient-to-r from-chestnut/10 to-khaki/10 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-chestnut/5 to-khaki/5"></div>
            <div className="relative z-10">
              <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
                ✨ Best of Both Worlds
              </h3>
              <p className="text-lg text-charcoal/80 mb-6 max-w-3xl mx-auto">
                <strong>Smart Path:</strong> Many clients start with our intelligent AI assessment to build literacy, 
                then engage our consulting services for strategic implementation. 
                Both paths include lifetime access to our growing resource library.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-chestnut">📊 73%</div>
                  <div className="text-sm text-charcoal/60">Start with Assessment</div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-khaki">📞 45%</div>
                  <div className="text-sm text-charcoal/60">Add Consulting</div>
                </div>
                <div className="bg-white px-4 py-3 rounded-lg shadow-sm">
                  <div className="text-lg font-bold text-chestnut">10%</div>
                  <div className="text-sm text-charcoal/60">Member Discount</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/tools/ai-knowledge-navigator')}
                className="bg-gradient-to-r from-chestnut to-khaki text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🚀 Start Your AI Journey - Free Assessment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-charcoal mb-4">
              Our Right-Sized Transformation Process
            </h2>
            <p className="text-lg sm:text-xl text-charcoal/80 max-w-3xl mx-auto">
              A practical, affordable approach designed specifically for small businesses, nonprofits, and service organizations.
            </p>
          </div>
          <div className="grid gap-6 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {frameworks.map((phase, index) => (
                <div key={index} className="bg-pearl/30 rounded-xl p-4 sm:p-6 hover:bg-pearl/50 transition-colors text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chestnut text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg mx-auto mb-3 sm:mb-4">
                    {phase.phase}
                  </div>
                  <h3 className="font-medium text-base sm:text-lg text-charcoal mb-2">{phase.title}</h3>
                  <p className="text-charcoal/70 text-sm mb-3 sm:mb-4">{phase.description}</p>
                  <div className="space-y-1">
                    <div className="text-xs sm:text-sm text-charcoal/60">{phase.duration}</div>
                    <div className="font-medium text-chestnut text-sm">{phase.investment}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center bg-khaki/10 rounded-xl p-6 sm:p-8">
            <h3 className="font-medium text-lg sm:text-xl text-charcoal mb-2">Complete Transformation Package</h3>
            <div className="text-2xl sm:text-3xl font-bold text-chestnut mb-2">$15K - $65K</div>
            <div className="text-sm sm:text-base text-charcoal/70 mb-4">Flexible payment plans available</div>
            <button 
              onClick={() => navigate('/services')}
              className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation min-h-[44px]"
            >
              Explore Our Services
            </button>
          </div>
        </div>
      </section>

      {/* Multiple CTAs */}
      <section className="py-16 bg-khaki/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              Ready to Start Your AI Journey?
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              Choose the path that fits your organization's needs and budget.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="relative mb-6">
                <div className="rounded-lg h-24 sm:h-28 lg:h-32 overflow-hidden">
                  <img 
                    src="/images/homepage/consultation_call.jpg" 
                    alt="Consultation call session"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="bg-pearl/30 rounded-lg h-24 sm:h-28 lg:h-32 flex items-center justify-center" style={{display: 'none'}}>
                    <div className="text-center">
                      <Phone className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-chestnut mx-auto mb-2" />
                      <div className="text-charcoal/60 text-xs">consultation_call.jpg</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium text-xl text-charcoal mb-4">Free Discovery Call</h3>
              <p className="text-charcoal/70 mb-6">
                30-minute conversation to explore how AI can help your specific organization and goals.
              </p>
              <button 
                onClick={() => window.location.href = '/service-intake'}
                className="w-full bg-chestnut text-white py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation min-h-[44px]"
              >
                Schedule Free Call
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border-2 border-chestnut relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-chestnut text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="relative mb-6">
                <div className="rounded-lg h-24 sm:h-28 lg:h-32 overflow-hidden">
                  <img 
                    src="/images/homepage/assessment-process.jpg" 
                    alt="Assessment process overview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="bg-pearl/30 rounded-lg h-24 sm:h-28 lg:h-32 flex items-center justify-center" style={{display: 'none'}}>
                    <div className="text-center">
                      <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-chestnut mx-auto mb-2" />
                      <div className="text-charcoal/60 text-xs">assessment-process.jpg</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium text-xl text-charcoal mb-4">🤖 AI Readiness Assessment</h3>
              <p className="text-charcoal/70 mb-6">
                <strong>Intelligent multi-agent evaluation</strong> of your AI knowledge with personalized recommendations, actionable insights, and custom learning paths.
              </p>
              <div className="text-center mb-4">
                <div className="inline-flex items-center bg-khaki/10 px-3 py-1 rounded-full text-sm">
                  <span className="text-khaki font-medium">✨ Now with AI Agents</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/tools/ai-knowledge-navigator')}
                className="w-full bg-gradient-to-r from-khaki to-khaki/80 text-white py-4 sm:py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 touch-manipulation min-h-[44px] font-medium"
              >
                🚀 Take Smart Assessment
              </button>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="relative mb-6">
                <div className="rounded-lg h-24 sm:h-28 lg:h-32 overflow-hidden">
                  <img 
                    src="/images/homepage/workshop-session.jpg" 
                    alt="Team workshop session"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="bg-pearl/30 rounded-lg h-24 sm:h-28 lg:h-32 flex items-center justify-center" style={{display: 'none'}}>
                    <div className="text-center">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-chestnut mx-auto mb-2" />
                      <div className="text-charcoal/60 text-xs">workshop-session.jpg</div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="font-medium text-xl text-charcoal mb-4">Team Workshop</h3>
              <p className="text-charcoal/70 mb-6">
                Half-day session to identify opportunities and get your team aligned on AI possibilities.
              </p>
              <button 
                onClick={() => window.location.href = '/service-intake'}
                className="w-full bg-chestnut text-white py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation min-h-[44px]"
              >
                Book Workshop
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;