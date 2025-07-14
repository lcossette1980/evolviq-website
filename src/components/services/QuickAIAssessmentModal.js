import React, { useState } from 'react';
import { Search, CheckCircle, Target, Clock, Users, FileText, TrendingUp, Zap, Building, Award, ArrowRight, Phone, Calendar, Eye, X } from 'lucide-react';

const QuickAIAssessmentModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(null);

  if (!isOpen) return null;

  const processSteps = [
    {
      id: 1,
      title: "Discovery Call",
      duration: "60–90 minutes",
      icon: <Phone className="w-6 h-6" />,
      description: "Understand your organization's mission, pain points, workflows, and goals",
      details: [
        "Comprehensive organizational assessment",
        "Identify key domains: operations, customer service, HR, finance, product",
        "Map current technology landscape and capabilities",
        "Understand strategic priorities and constraints",
        "Assess team readiness and change capacity"
      ]
    },
    {
      id: 2,
      title: "Opportunity Mapping",
      duration: "Internal analysis",
      icon: <Target className="w-6 h-6" />,
      description: "Rapid scan of 5–10 high-potential AI use cases",
      details: [
        "Strategic value assessment for each opportunity",
        "Ease of implementation analysis",
        "Organizational readiness evaluation",
        "Risk and sensitivity categorization",
        "ROI potential estimation",
        "Resource requirement mapping"
      ]
    },
    {
      id: 3,
      title: "Assessment Report",
      duration: "Delivered in 5–7 days",
      icon: <FileText className="w-6 h-6" />,
      description: "Comprehensive analysis with executive summary and actionable recommendations",
      details: [
        "Executive summary of key findings",
        "Top 3 AI opportunities with detailed business cases",
        "Implementation complexity analysis",
        "Data requirements and infrastructure needs",
        "Change management implications",
        "Organizational maturity snapshot (tech, talent, culture)",
        "Quick-win recommendations for immediate impact"
      ]
    },
    {
      id: 4,
      title: "Optional Readout Session",
      duration: "30–45 minutes",
      icon: <Users className="w-6 h-6" />,
      description: "Interactive session to discuss findings and next steps",
      details: [
        "Detailed walkthrough of assessment findings",
        "Clarification of recommendations and priorities",
        "Strategic next steps planning",
        "Q&A with leadership and functional teams",
        "Implementation timeline discussion",
        "Resource allocation guidance"
      ]
    }
  ];

  const deliverables = [
    {
      title: "Comprehensive PDF Report",
      description: "Executive-ready document with findings and recommendations",
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "AI Readiness Scorecard",
      description: "Visual assessment of your organization's AI maturity",
      icon: <Award className="w-5 h-5" />
    },
    {
      title: "Opportunity Matrix",
      description: "Prioritized grid of AI opportunities by value and feasibility",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Leadership Summary Slides",
      description: "Visual summaries designed for executive presentations",
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  const benefits = [
    {
      title: "Fast Insight",
      description: "Rapid evaluation without long-term commitment",
      icon: <Zap className="w-5 h-5" />
    },
    {
      title: "Leadership Alignment",
      description: "Build consensus around realistic next steps",
      icon: <Users className="w-5 h-5" />
    },
    {
      title: "Strategic Focus",
      description: "Avoid 'AI theater' with practical applications",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Perfect Entry Point",
      description: "Ideal before investing in full strategy or pilots",
      icon: <ArrowRight className="w-5 h-5" />
    }
  ];

  const idealFor = [
    "Organizations new to AI looking for strategic direction",
    "Leadership teams needing internal buy-in for AI initiatives",
    "Companies exploring AI for innovation opportunities",
    "Teams seeking cost savings through automation",
    "Organizations wanting to understand their AI readiness",
    "Businesses preparing for larger AI transformation"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bone max-w-6xl w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        {/* Header with close button */}
        <div className="bg-charcoal text-bone p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-pearl hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <Search className="w-12 h-12 text-chestnut" />
            <h1 className="text-4xl font-serif font-bold">
              Quick AI Assessment
            </h1>
          </div>
          <p className="text-xl text-pearl font-serif mb-2">
            Rapid evaluation of AI opportunities for your organization
          </p>
          <p className="text-lg text-pearl">
            A streamlined, high-impact service designed to rapidly evaluate how your organization can benefit from AI—with minimal disruption, maximum clarity, and fast turnaround.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Purpose Section */}
          <div className="p-6 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-4">
                Purpose & Value
              </h2>
              <p className="text-lg text-khaki max-w-3xl mx-auto">
                Get clarity on your AI opportunities without the complexity of a full strategic engagement
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">
                  High-Value Opportunities
                </h3>
                <p className="text-charcoal text-sm">
                  Identify low-risk, high-impact AI integration points specific to your organization
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-khaki rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">
                  Clear Starting Point
                </h3>
                <p className="text-charcoal text-sm">
                  Establish actionable next steps for your AI strategy with confidence
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">
                  Executive Buy-In
                </h3>
                <p className="text-charcoal text-sm">
                  Accelerate leadership understanding and support for AI initiatives
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="p-6 bg-bone">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Assessment Process
            </h2>
            
            <div className="space-y-4">
              {processSteps.map((step, index) => (
                <div key={step.id} className="bg-white rounded-lg shadow-sm border border-pearl">
                  <div 
                    className={`p-4 cursor-pointer transition-colors ${
                      activeSection === step.id ? 'bg-bone' : 'hover:bg-bone/50'
                    }`}
                    onClick={() => setActiveSection(activeSection === step.id ? null : step.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-chestnut rounded-lg text-white">
                          {step.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-serif font-bold text-charcoal">
                              {index + 1}. {step.title}
                            </span>
                          </div>
                          <p className="text-khaki">{step.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="w-4 h-4 text-chestnut" />
                            <span className="text-sm text-charcoal">{step.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {activeSection === step.id ? 
                          <Eye className="w-5 h-5 text-chestnut" /> : 
                          <ArrowRight className="w-5 h-5 text-chestnut" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {activeSection === step.id && (
                    <div className="px-4 pb-4 bg-bone border-t border-pearl">
                      <div className="mt-3">
                        <h4 className="text-md font-medium text-charcoal mb-2">
                          What's Included:
                        </h4>
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
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
          <div className="p-6 bg-white">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              What You'll Receive
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="p-4 rounded-lg border border-pearl bg-bone">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-chestnut rounded-lg">
                      {React.cloneElement(deliverable.icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-charcoal mb-1">
                        {deliverable.title}
                      </h3>
                      <p className="text-sm text-charcoal">{deliverable.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="p-6 bg-bone">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Why Organizations Choose Quick AI Assessment
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-pearl">
                  <div className="p-2 bg-chestnut rounded-lg">
                    {React.cloneElement(benefit.icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-charcoal mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-charcoal">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal For */}
          <div className="p-6 bg-white">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Ideal For
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-3">
                {idealFor.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-bone">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-chestnut flex-shrink-0" />
                    <span className="text-charcoal">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-6 bg-charcoal text-white">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold mb-4">
                Ready to Discover Your AI Opportunities?
              </h2>
              <p className="text-lg text-pearl mb-6">
                Get clarity on your AI potential with our Quick AI Assessment. Fast insights, strategic focus, and actionable next steps—all in just 7-10 business days.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Discovery Call</span>
                </button>
                <button className="border-2 border-pearl text-pearl px-6 py-3 rounded-lg hover:bg-pearl hover:text-charcoal transition-colors flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Download Overview</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAIAssessmentModal;