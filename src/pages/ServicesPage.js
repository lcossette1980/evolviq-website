import React, { useState } from 'react';
import { CheckCircle, Phone, FileText, Zap } from 'lucide-react';

const ServicesPage = () => {
  const [selectedTab, setSelectedTab] = useState('phased');

  const phasedServices = [
    {
      phase: "1",
      title: "Discovery & Assessment",
      description: "Quick AI readiness evaluation, practical opportunity identification, budget-conscious planning",
      investment: "$2.5K - $7.5K",
      timeline: "1-2 weeks",
      deliverables: ["AI readiness snapshot", "Opportunity identification", "Budget-friendly roadmap", "Quick-start recommendations"]
    },
    {
      phase: "2", 
      title: "Strategic Planning",
      description: "Right-sized AI roadmap, priority use cases, simple governance framework",
      investment: "$3.5K - $12K",
      timeline: "2-3 weeks",
      deliverables: ["Practical AI strategy", "Priority project list", "Simple governance guidelines", "Implementation timeline"]
    },
    {
      phase: "3",
      title: "Team Preparation",
      description: "Staff training, change support, practical AI literacy for your team",
      investment: "$2K - $8K", 
      timeline: "2-4 weeks",
      deliverables: ["Team training sessions", "Change readiness plan", "AI literacy workshop", "Communication toolkit"]
    },
    {
      phase: "4",
      title: "Implementation",
      description: "Start small pilot project, hands-on support, measurable quick wins",
      investment: "$5K - $25K",
      timeline: "3-8 weeks",
      deliverables: ["Pilot project launch", "Success metrics tracking", "User feedback loops", "Scaling preparation"]
    },
    {
      phase: "5",
      title: "Growth & Support", 
      description: "Expand successful initiatives, ongoing guidance, sustainable AI practices",
      investment: "$3K - $15K",
      timeline: "4-8 weeks",
      deliverables: ["Expansion strategy", "Team capability building", "Long-term success plan", "Ongoing support framework"]
    }
  ];

  const alacarte = [
    {
      title: "Quick AI Assessment",
      description: "Rapid evaluation of AI opportunities for your organization",
      investment: "$1.5K - $4K",
      popular: true
    },
    {
      title: "Half-Day Strategy Session", 
      description: "Focused workshop to identify your best AI opportunities",
      investment: "$2K - $5K",
      popular: true
    },
    {
      title: "AI Basics Training",
      description: "Practical AI literacy training for your team", 
      investment: "$750 - $2.5K",
      popular: false
    },
    {
      title: "Change Readiness Workshop",
      description: "Prepare your team for AI transformation",
      investment: "$1.5K - $4K", 
      popular: false
    },
    {
      title: "Simple Governance Setup",
      description: "Basic guidelines for responsible AI use",
      investment: "$2.5K - $7.5K",
      popular: false
    },
    {
      title: "Pilot Project Support",
      description: "Hands-on help with your first AI implementation",
      investment: "$3K - $12K",
      popular: false
    },
    {
      title: "Vendor Selection Support", 
      description: "Help choosing the right AI tools for your needs",
      investment: "$1K - $3.5K",
      popular: false
    }
  ];

  const retainer = [
    {
      title: "Monthly AI Advisor",
      description: "Regular check-ins, strategic guidance, and ongoing support",
      investment: "$1.5K - $4K/month",
      commitment: "3-12 months"
    },
    {
      title: "Quarterly Strategy Reviews",
      description: "Quarterly planning sessions and progress assessments", 
      investment: "$2.5K - $6K/quarter",
      commitment: "1-2 years"
    },
    {
      title: "Complete Transformation Package",
      description: "Full support through all phases with flexible scheduling",
      investment: "$3K - $8K/month",
      commitment: "6-18 months"
    }
  ];

  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
            AI Solutions <span className="text-chestnut">Sized for Your Organization</span>
          </h1>
          <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
            Practical, affordable AI transformation for small businesses, nonprofits, and service organizations.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setSelectedTab('phased')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedTab === 'phased' 
                  ? 'bg-chestnut text-white' 
                  : 'text-charcoal hover:text-chestnut'
              }`}
            >
              Tiered Phase Implementation
            </button>
            <button
              onClick={() => setSelectedTab('alacarte')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedTab === 'alacarte' 
                  ? 'bg-chestnut text-white' 
                  : 'text-charcoal hover:text-chestnut'
              }`}
            >
              A La Carte Services
            </button>
            <button
              onClick={() => setSelectedTab('retainer')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedTab === 'retainer' 
                  ? 'bg-chestnut text-white' 
                  : 'text-charcoal hover:text-chestnut'
              }`}
            >
              Retainer & Subscription
            </button>
          </div>
        </div>

        {/* Phased Implementation */}
        {selectedTab === 'phased' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-serif font-bold text-2xl text-charcoal mb-4">
                Complete Transformation Journey for Growing Organizations
              </h2>
              <div className="bg-white p-4 rounded-lg inline-block">
                <span className="text-lg font-medium text-charcoal">Full Program: </span>
                <span className="text-xl font-bold text-chestnut">$15K - $65K</span>
                <span className="text-charcoal/70 ml-2">(Flexible payment plans available)</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {phasedServices.map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-chestnut text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                          {service.phase}
                        </div>
                        <h3 className="font-serif font-bold text-xl text-charcoal">{service.title}</h3>
                      </div>
                      <p className="text-charcoal/80 mb-4">{service.description}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {service.deliverables.map((item, i) => (
                          <div key={i} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-chestnut mr-2" />
                            <span className="text-sm text-charcoal/70">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-pearl/30 p-4 rounded-lg">
                        <div className="text-sm text-charcoal/70 mb-1">Investment</div>
                        <div className="font-bold text-chestnut text-lg">{service.investment}</div>
                      </div>
                      <div className="bg-pearl/30 p-4 rounded-lg">
                        <div className="text-sm text-charcoal/70 mb-1">Timeline</div>
                        <div className="font-medium text-charcoal">{service.timeline}</div>
                      </div>
                      <button className="w-full bg-chestnut text-white py-3 rounded-lg hover:bg-chestnut/90 transition-colors">
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A La Carte Services */}
        {selectedTab === 'alacarte' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-serif font-bold text-2xl text-charcoal mb-4">
                Targeted Solutions That Fit Your Budget and Timeline
              </h2>
              <div className="bg-white p-4 rounded-lg inline-block">
                <span className="text-lg font-medium text-charcoal">Most Popular: </span>
                <span className="text-chestnut font-medium">Quick Assessment + Strategy Session: $3.5K - $9K</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {alacarte.map((service, index) => (
                <div key={index} className={`bg-white rounded-xl p-6 shadow-sm relative ${service.popular ? 'ring-2 ring-chestnut' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-chestnut text-white px-3 py-1 rounded-full text-sm font-medium">
                        Popular
                      </span>
                    </div>
                  )}
                  <h3 className="font-medium text-lg text-charcoal mb-3">{service.title}</h3>
                  <p className="text-charcoal/70 mb-4 text-sm">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-chestnut text-lg">{service.investment}</span>
                    <button className="bg-chestnut text-white px-4 py-2 rounded-lg hover:bg-chestnut/90 transition-colors text-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retainer & Subscription */}
        {selectedTab === 'retainer' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="font-serif font-bold text-2xl text-charcoal mb-4">
                Ongoing Partnership for Continued Growth
              </h2>
              <p className="text-charcoal/80">
                Perfect for organizations that want expert guidance without hiring full-time AI staff
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {retainer.map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-sm text-center">
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-4">{service.title}</h3>
                  <div className="mb-6">
                    <div className="text-2xl font-bold text-chestnut mb-2">{service.investment}</div>
                    <div className="text-sm text-charcoal/70">{service.commitment}</div>
                  </div>
                  <p className="text-charcoal/80 mb-6 text-sm">{service.description}</p>
                  <button className="w-full bg-chestnut text-white py-3 rounded-lg hover:bg-chestnut/90 transition-colors">
                    Discuss Options
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Engage */}
        <div className="mt-16 bg-white rounded-2xl p-12">
          <h2 className="font-serif font-bold text-2xl text-charcoal text-center mb-8">
            How to Engage
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-chestnut/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-chestnut" />
              </div>
              <h3 className="font-medium text-lg text-charcoal mb-2">1. Discovery Call</h3>
              <p className="text-charcoal/70 text-sm">30-minute no-obligation consultation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-chestnut/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-chestnut" />
              </div>
              <h3 className="font-medium text-lg text-charcoal mb-2">2. Proposal Development</h3>
              <p className="text-charcoal/70 text-sm">Customized approach aligned to your needs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-chestnut/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-chestnut" />
              </div>
              <h3 className="font-medium text-lg text-charcoal mb-2">3. Launch</h3>
              <p className="text-charcoal/70 text-sm">Begin with assessment or chosen starting point</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button className="bg-chestnut text-white px-8 py-4 rounded-lg font-medium hover:bg-chestnut/90 transition-colors">
              Schedule Discovery Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;