import React, { useState } from 'react';
import { Brain, Target, Users, Clock, Lightbulb, Map, CheckCircle, ArrowRight, Calendar, Video, FileText, TrendingUp, Zap, Building, ChevronDown, ChevronRight, Eye, Play, X } from 'lucide-react';

const HalfDayStrategySessionModal = ({ isOpen, onClose }) => {
  const [activeWorkshop, setActiveWorkshop] = useState(null);

  if (!isOpen) return null;

  const workshopSections = [
    {
      id: 1,
      title: "AI Landscape Overview",
      duration: "30 minutes",
      icon: <Brain className="w-6 h-6" />,
      description: "Brief, non-technical introduction to AI in business",
      details: [
        "Current state of AI technology and business applications",
        "Real-world case studies tailored to your industry",
        "Demystifying AI capabilities and limitations",
        "Understanding the competitive landscape",
        "Key success factors for AI implementation"
      ]
    },
    {
      id: 2,
      title: "Organizational Deep Dive",
      duration: "45–60 minutes",
      icon: <Building className="w-6 h-6" />,
      description: "Map current workflows, pain points, and strategic goals",
      details: [
        "Comprehensive workflow mapping across departments",
        "Identification of key pain points and inefficiencies",
        "Strategic goals and business objectives alignment",
        "Current technology landscape assessment",
        "Functions ripe for automation, augmentation, or insight generation",
        "Resource and capability inventory"
      ]
    },
    {
      id: 3,
      title: "AI Opportunity Sprint",
      duration: "60–90 minutes",
      icon: <Lightbulb className="w-6 h-6" />,
      description: "Rapid ideation and evaluation of AI use cases",
      details: [
        "Structured brainstorming sessions for AI opportunities",
        "Cross-functional perspective integration",
        "Real-time opportunity evaluation and scoring",
        "Live Opportunity Matrix creation (value vs. complexity)",
        "Feasibility assessment for each use case",
        "Resource requirement estimation",
        "Risk and impact analysis"
      ]
    },
    {
      id: 4,
      title: "Roadmap & Next Steps",
      duration: "30–45 minutes",
      icon: <Map className="w-6 h-6" />,
      description: "Group alignment on top AI initiatives and implementation planning",
      details: [
        "Consensus building on 2-3 top AI initiatives",
        "Data requirements and availability assessment",
        "Technology infrastructure needs evaluation",
        "Talent and skill gap identification",
        "Change management considerations",
        "Timeline and milestone planning",
        "Success metrics and KPI definition"
      ]
    }
  ];

  const deliverables = [
    {
      title: "Workshop Summary Report",
      description: "Comprehensive documentation of all workshop outcomes and decisions",
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "Prioritized Opportunity Matrix",
      description: "Visual framework showing AI opportunities ranked by value and complexity",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Draft Roadmap & Action Plan",
      description: "Strategic implementation plan for your top 2-3 AI initiatives",
      icon: <Map className="w-5 h-5" />
    },
    {
      title: "Session Recording (Optional)",
      description: "Video or audio recording for future reference and team sharing",
      icon: <Video className="w-5 h-5" />
    }
  ];

  const outcomes = [
    {
      title: "Strategic Alignment",
      description: "Shared understanding of how AI fits your business strategy",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Prioritized Use Cases",
      description: "Clear list of AI opportunities ranked by business impact",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: "Implementation Clarity",
      description: "Actionable next steps for pilot design and AI integration",
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      title: "Leadership Buy-In",
      description: "Increased alignment and commitment across stakeholders",
      icon: <Users className="w-5 h-5" />
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-bone max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        {/* Header with close button */}
        <div className="bg-charcoal text-bone p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-pearl hover:text-white transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 mr-12 sm:mr-16">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-chestnut" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">
              Half-Day Strategy Session
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-pearl font-serif mb-2">
            Focused workshop to identify your best AI opportunities
          </p>
          <p className="text-sm sm:text-base md:text-lg text-pearl">
            A facilitated, hands-on workshop designed to engage key stakeholders in identifying, prioritizing, and aligning on the most valuable and achievable AI use cases across your organization.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          {/* Purpose Section */}
          <div className="p-4 sm:p-6 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mb-3 sm:mb-4">
                Workshop Purpose
              </h2>
              <p className="text-base sm:text-lg text-khaki max-w-4xl mx-auto">
                Transform scattered AI ideas into a focused, actionable strategy through collaborative discovery and strategic alignment
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal mb-1 sm:mb-2">
                  Stakeholder Engagement
                </h3>
                <p className="text-charcoal text-xs sm:text-sm">
                  Bring together cross-functional leaders to build consensus and shared vision
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-khaki rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal mb-1 sm:mb-2">
                  Strategic Prioritization
                </h3>
                <p className="text-charcoal text-xs sm:text-sm">
                  Identify and rank AI opportunities by value, feasibility, and strategic impact
                </p>
              </div>
              
              <div className="text-center p-3 sm:p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Map className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal mb-1 sm:mb-2">
                  Actionable Roadmap
                </h3>
                <p className="text-charcoal text-xs sm:text-sm">
                  Leave with clear next steps and implementation guidance for your top AI initiatives
                </p>
              </div>
            </div>
          </div>

          {/* Workshop Agenda */}
          <div className="p-4 sm:p-6 bg-bone">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-6">
              3–4 Hour Interactive Workshop
            </h2>
            <p className="text-base sm:text-lg text-center text-khaki mb-6 sm:mb-8">
              Led by an AI strategist and facilitator • Available virtual or in-person
            </p>
            
            <div className="space-y-4">
              {workshopSections.map((section, index) => (
                <div key={section.id} className="bg-white rounded-lg shadow-sm border border-pearl">
                  <div 
                    className={`p-3 sm:p-4 cursor-pointer transition-colors touch-manipulation ${
                      activeWorkshop === section.id ? 'bg-bone' : 'hover:bg-bone/50'
                    }`}
                    onClick={() => setActiveWorkshop(activeWorkshop === section.id ? null : section.id)}
                  >
                    <div className="flex items-start sm:items-center justify-between">
                      <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-chestnut rounded-lg text-white flex-shrink-0">
                          {React.cloneElement(section.icon, { className: "w-4 h-4 sm:w-6 sm:h-6" })}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <span className="text-sm sm:text-base md:text-lg font-serif font-bold text-charcoal">
                              {index + 1}. {section.title}
                            </span>
                          </div>
                          <p className="text-khaki text-xs sm:text-sm md:text-base">{section.description}</p>
                          <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-chestnut" />
                            <span className="text-xs sm:text-sm text-charcoal">{section.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {activeWorkshop === section.id ? 
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-chestnut" /> : 
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-chestnut" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {activeWorkshop === section.id && (
                    <div className="px-4 pb-4 bg-bone border-t border-pearl">
                      <div className="mt-3">
                        <h4 className="text-md font-medium text-charcoal mb-2">
                          What We'll Cover:
                        </h4>
                        <ul className="space-y-2">
                          {section.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 mt-0.5 text-chestnut flex-shrink-0" />
                              <span className="text-sm text-charcoal">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="p-4 sm:p-6 bg-white">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-6 sm:mb-8">
              What You'll Receive
            </h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="p-3 sm:p-4 rounded-lg border border-pearl bg-bone">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-chestnut rounded-lg">
                      {React.cloneElement(deliverable.icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal mb-1">
                        {deliverable.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-charcoal">{deliverable.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="p-4 sm:p-6 bg-bone">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-6 sm:mb-8">
              Expected Outcomes
            </h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {outcomes.map((outcome, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 bg-white rounded-lg border border-pearl">
                  <div className="p-2 bg-chestnut rounded-lg">
                    {React.cloneElement(outcome.icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal mb-1">
                      {outcome.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-charcoal">{outcome.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-4 sm:p-6 bg-charcoal text-white">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4">
                Ready to Align Your Team on AI Strategy?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-pearl mb-4 sm:mb-6">
                Bring your stakeholders together for focused, productive discussions that turn AI possibilities into strategic priorities.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => window.location.href = '/service-intake'}
                  className="bg-chestnut text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request This Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfDayStrategySessionModal;