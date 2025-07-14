import React, { useState } from 'react';
import { BookOpen, Users, Target, Clock, Lightbulb, Shield, MessageCircle, CheckCircle, ArrowRight, Calendar, FileText, Video, Award, X } from 'lucide-react';

const AIBasicsTrainingModal = ({ isOpen, onClose }) => {
  const [activeModule, setActiveModule] = useState(null);

  if (!isOpen) return null;

  const trainingModules = [
    {
      id: 1,
      title: "AI 101: Foundations Made Simple",
      icon: <BookOpen className="w-6 h-6" />,
      description: "Clear, non-technical introduction to artificial intelligence",
      details: [
        "What is AI? (And what isn't?) - Clear definitions and boundaries",
        "Key terms demystified: machine learning, generative AI, automation",
        "Evolution of AI: from simple automation to intelligent systems",
        "Different types of AI and their business applications",
        "Myths vs. reality: separating hype from substance",
        "Understanding AI capabilities and current limitations"
      ]
    },
    {
      id: 2,
      title: "Real-World Examples",
      icon: <Target className="w-6 h-6" />,
      description: "Industry-relevant case studies tailored to your organization",
      details: [
        "Industry-specific AI success stories and implementations",
        "Internal use cases: productivity, insights, customer service",
        "External facing applications: customer experience, marketing",
        "Cost-benefit analysis of real AI deployments",
        "Lessons learned from AI implementations",
        "Competitive landscape and market trends"
      ]
    },
    {
      id: 3,
      title: "Interactive Demos",
      icon: <Lightbulb className="w-6 h-6" />,
      description: "Live walkthroughs and hands-on exploration of AI tools",
      details: [
        "Live demonstrations of popular AI tools (ChatGPT, Claude, etc.)",
        "Image generation and creative AI applications",
        "Task automation and workflow enhancement tools",
        "Hands-on exercises with guided exploration",
        "Prompt engineering basics and best practices",
        "Practical tips for immediate application"
      ]
    },
    {
      id: 4,
      title: "Responsible Use & Risks",
      icon: <Shield className="w-6 h-6" />,
      description: "Critical considerations for ethical and secure AI adoption",
      details: [
        "Understanding AI bias and fairness considerations",
        "Privacy implications and data security best practices",
        "Ethical frameworks for AI decision-making",
        "Governance basics: policies and oversight needs",
        "Risk assessment and mitigation strategies",
        "Legal and compliance considerations"
      ]
    },
    {
      id: 5,
      title: "Q&A + Discussion",
      icon: <MessageCircle className="w-6 h-6" />,
      description: "Open dialogue and collaborative exploration",
      details: [
        "Safe space to ask questions and challenge assumptions",
        "Interactive discussion about organizational readiness",
        "Brainstorming potential use cases for your team",
        "Addressing concerns and misconceptions",
        "Building internal consensus and vision",
        "Next steps and implementation considerations"
      ]
    }
  ];

  const outcomes = [
    {
      title: "Shared AI Literacy",
      description: "Common baseline understanding across all departments and roles",
      icon: <Users className="w-5 h-5" />
    },
    {
      title: "Increased Confidence",
      description: "Staff feel empowered to engage with AI topics and ask informed questions",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Strategic Conversations",
      description: "Better internal discussions about AI strategy, opportunities, and implementation",
      icon: <MessageCircle className="w-5 h-5" />
    },
    {
      title: "Risk Awareness",
      description: "Clear understanding of benefits, risks, and responsible AI practices",
      icon: <Shield className="w-5 h-5" />
    }
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
            <BookOpen className="w-12 h-12 text-chestnut" />
            <h1 className="text-4xl font-serif font-bold">
              AI Basics Training
            </h1>
          </div>
          <p className="text-xl text-pearl font-serif mb-2">
            Practical AI literacy training for your team
          </p>
          <p className="text-lg text-pearl">
            Build organization-wide AI understanding through interactive, engaging training designed for all skill levels and roles.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Training Format */}
          <div className="p-6 bg-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-charcoal mb-4">
                Training Format
              </h2>
              <p className="text-lg text-khaki max-w-3xl mx-auto">
                Flexible delivery options designed to meet your team's needs and schedule
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">
                  Half-Day Session
                </h3>
                <p className="text-charcoal text-sm">
                  3-4 hours of interactive learning with breaks
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-khaki rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">
                  Team Focused
                </h3>
                <p className="text-charcoal text-sm">
                  15-30 participants for optimal engagement
                </p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">
                  All Skill Levels
                </h3>
                <p className="text-charcoal text-sm">
                  Designed for both beginners and experienced users
                </p>
              </div>
            </div>
          </div>

          {/* Training Modules */}
          <div className="p-6 bg-bone">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Training Modules
            </h2>
            
            <div className="space-y-4">
              {trainingModules.map((module, index) => (
                <div key={module.id} className="bg-white rounded-lg shadow-sm border border-pearl">
                  <div 
                    className={`p-4 cursor-pointer transition-colors ${
                      activeModule === module.id ? 'bg-bone' : 'hover:bg-bone/50'
                    }`}
                    onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-chestnut rounded-lg text-white">
                          {module.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-serif font-bold text-charcoal">
                              {index + 1}. {module.title}
                            </span>
                          </div>
                          <p className="text-khaki">{module.description}</p>
                        </div>
                      </div>
                      <div>
                        {activeModule === module.id ? 
                          <ArrowRight className="w-5 h-5 text-chestnut transform rotate-90" /> : 
                          <ArrowRight className="w-5 h-5 text-chestnut" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {activeModule === module.id && (
                    <div className="px-4 pb-4 bg-bone border-t border-pearl">
                      <div className="mt-3">
                        <h4 className="text-md font-medium text-charcoal mb-2">
                          What We'll Cover:
                        </h4>
                        <ul className="space-y-2">
                          {module.details.map((detail, idx) => (
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

          {/* Expected Outcomes */}
          <div className="p-6 bg-white">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Expected Outcomes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {outcomes.map((outcome, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-bone rounded-lg border border-pearl">
                  <div className="p-2 bg-chestnut rounded-lg">
                    {React.cloneElement(outcome.icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-charcoal mb-1">
                      {outcome.title}
                    </h3>
                    <p className="text-sm text-charcoal">{outcome.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ideal For */}
          <div className="p-6 bg-bone">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Perfect For
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Leadership teams building AI awareness",
                  "Cross-functional innovation committees",
                  "Operational staff preparing for AI integration",
                  "Customer-facing teams exploring AI applications",
                  "Technical teams expanding AI knowledge",
                  "Organizations planning AI transformation"
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-white">
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
                Ready to Build AI Literacy Across Your Team?
              </h2>
              <p className="text-lg text-pearl mb-6">
                Empower your entire organization with practical AI knowledge and confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Training</span>
                </button>
                <button className="border-2 border-pearl text-pearl px-6 py-3 rounded-lg hover:bg-pearl hover:text-charcoal transition-colors flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Download Training Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBasicsTrainingModal;