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
      title: "Discovery & Assessment",
      description: "Quick AI readiness evaluation, practical opportunity identification, budget-conscious planning",
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
      title: "Right-Sized for Your Organization",
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
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => navigate('/services')}
                        className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors flex items-center justify-center touch-manipulation"
                      >
                        {slide.cta} <ChevronRight className="ml-2 w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => navigate('/about')}
                        className="border-2 border-chestnut text-chestnut px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut hover:text-white transition-colors touch-manipulation"
                      >
                        Learn Our Approach
                      </button>
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
            
            {/* Carousel Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full transition-colors touch-manipulation ${
                    index === currentSlide ? 'bg-chestnut' : 'bg-chestnut/30'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-3 sm:p-2 rounded-full shadow-lg hover:bg-white transition-colors touch-manipulation"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-6 h-6 text-chestnut transform rotate-180" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-3 sm:p-2 rounded-full shadow-lg hover:bg-white transition-colors touch-manipulation"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-chestnut" />
            </button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-6">
                Why Small Organizations Struggle with AI
              </h2>
              <div className="space-y-4 text-charcoal/80">
                <p className="text-lg">
                  Small businesses and nonprofits want to leverage AI but feel overwhelmed by enterprise-focused 
                  solutions that don't fit their reality.
                </p>
                <p>
                  You need practical, affordable AI that works with your existing team and processes—not against them.
                </p>
                <p>
                  That's why we created an approach specifically designed for organizations like yours: 
                  real impact without the complexity or enterprise price tag.
                </p>
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

      {/* Framework Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-4">
              Our Right-Sized Transformation Process
            </h2>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              A practical, affordable approach designed specifically for small businesses, nonprofits, and service organizations.
            </p>
          </div>
          <div className="grid gap-6 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
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
          <div className="text-center bg-khaki/10 rounded-xl p-8">
            <h3 className="font-medium text-xl text-charcoal mb-2">Complete Transformation Package</h3>
            <div className="text-3xl font-bold text-chestnut mb-2">$15K - $65K</div>
            <div className="text-charcoal/70 mb-4">Flexible payment plans available</div>
            <button 
              onClick={() => navigate('/services')}
              className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation"
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
              <button className="w-full bg-chestnut text-white py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation">
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
              <h3 className="font-medium text-xl text-charcoal mb-4">Quick Assessment</h3>
              <p className="text-charcoal/70 mb-6">
                Rapid evaluation of your AI readiness with practical recommendations and next steps.
              </p>
              <button className="w-full bg-chestnut text-white py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation">
                Get Assessment
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
              <button className="w-full bg-chestnut text-white py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation">
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