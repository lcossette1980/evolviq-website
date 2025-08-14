import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Target, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Network,
  Workflow
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';

const AgenticAI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const benefits = [
    {
      icon: Zap,
      title: "Autonomous Decision Making",
      description: "Agents that can analyze, decide, and act independently within defined parameters, reducing manual oversight by 80%"
    },
    {
      icon: Network,
      title: "Multi-Agent Orchestration",
      description: "Coordinate specialized agents working together - from data analysis to customer service to operations"
    },
    {
      icon: Workflow,
      title: "End-to-End Process Automation",
      description: "Complete workflows autonomously, from initial trigger to final outcome, with human-in-the-loop only when needed"
    },
    {
      icon: Brain,
      title: "Continuous Learning & Adaptation",
      description: "Agents that improve performance over time, learning from outcomes and adapting strategies"
    },
    {
      icon: Target,
      title: "Goal-Oriented Execution",
      description: "Define objectives, not steps - agents determine and execute the optimal path to achieve your goals"
    },
    {
      icon: Shield,
      title: "Governed Autonomy",
      description: "Built-in guardrails, compliance checks, and ethical constraints ensure safe, responsible AI operations"
    }
  ];

  const useCases = [
    {
      industry: "Financial Services",
      title: "Intelligent Risk Assessment",
      description: "Autonomous agents analyzing market conditions, evaluating portfolios, and executing trades within risk parameters",
      impact: "45% reduction in response time, 30% improvement in risk-adjusted returns"
    },
    {
      industry: "Healthcare",
      title: "Patient Care Coordination",
      description: "Agents managing appointments, analyzing symptoms, coordinating specialists, and monitoring treatment adherence",
      impact: "60% reduction in administrative burden, 25% improvement in patient outcomes"
    },
    {
      industry: "Manufacturing",
      title: "Supply Chain Optimization",
      description: "Real-time inventory management, predictive maintenance, and autonomous procurement decisions",
      impact: "35% reduction in downtime, 20% decrease in inventory costs"
    },
    {
      industry: "Retail & E-commerce",
      title: "Personalized Customer Journey",
      description: "Agents managing end-to-end customer experience from discovery to support to retention",
      impact: "40% increase in conversion, 50% reduction in support tickets"
    }
  ];

  const roadmapSteps = [
    {
      phase: "Foundation",
      title: "Assessment & Strategy",
      description: "Evaluate readiness, identify high-impact use cases, build governance framework",
      timeline: "Weeks 1-4"
    },
    {
      phase: "Pilot",
      title: "First Agent Deployment",
      description: "Deploy focused agent for specific workflow, measure impact, gather learnings",
      timeline: "Weeks 5-12"
    },
    {
      phase: "Expansion",
      title: "Multi-Agent System",
      description: "Scale to multiple agents, implement orchestration, cross-functional integration",
      timeline: "Months 3-6"
    },
    {
      phase: "Optimization",
      title: "Enterprise Scale",
      description: "Full deployment, continuous improvement, advanced agent collaboration",
      timeline: "Months 6-12"
    }
  ];

  return (
    <div className="min-h-screen bg-bone">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-charcoal via-charcoal to-chestnut text-white py-24 px-4">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-khaki" />
                <span className="text-khaki font-semibold font-sans uppercase tracking-wider text-sm">THE FUTURE IS AUTONOMOUS</span>
              </div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
                Agentic AI:<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-khaki to-pearl">
                  The Next Evolution
                </span>
              </h1>
              <p className="text-xl mb-8 text-pearl/90 font-sans">
                Move beyond chatbots and copilots. Deploy intelligent agents that think, decide, and act autonomously 
                to transform your business operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/services')}
                  className="px-8 py-4 bg-chestnut text-white font-sans font-medium rounded-lg hover:bg-chestnut/90 transform hover:scale-105 transition-all inline-flex items-center justify-center shadow-lg"
                >
                  Start Your Agentic Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-khaki/20 to-chestnut/20 backdrop-blur rounded-2xl p-8 border border-white/20">
                <img 
                  src="/images/ai_agent/ai_agents.png" 
                  alt="AI Agents Network" 
                  className="w-full h-auto rounded-lg shadow-xl"
                />
                <p className="text-center mt-6 text-pearl/90 font-sans">
                  Empower your team with autonomous agents that collaborate, learn, and adapt to deliver results
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Agentic AI Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4 text-charcoal">Why Agentic AI is the Game Changer</h2>
            <p className="text-xl text-charcoal/70 max-w-3xl mx-auto font-sans">
              While traditional AI assists and augments, Agentic AI takes ownership and delivers outcomes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-bone rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-pearl">
                <div className="flex items-start gap-4">
                  <div className="bg-chestnut/10 rounded-lg p-3">
                    <benefit.icon className="h-6 w-6 text-chestnut" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-charcoal font-sans">{benefit.title}</h3>
                    <p className="text-charcoal/70 font-sans">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-chestnut text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-serif text-4xl font-bold text-pearl mb-2">75%</div>
              <div className="text-pearl/80 font-sans">Reduction in operational costs</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-pearl mb-2">10x</div>
              <div className="text-pearl/80 font-sans">Faster decision making</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-pearl mb-2">24/7</div>
              <div className="text-pearl/80 font-sans">Autonomous operations</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-pearl mb-2">90%</div>
              <div className="text-pearl/80 font-sans">Task automation rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-pearl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4 text-charcoal">Real-World Impact Across Industries</h2>
            <p className="text-xl text-charcoal/70 font-sans">See how leading organizations are deploying agentic AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-sm font-semibold text-chestnut mb-2 font-sans uppercase tracking-wider">{useCase.industry}</div>
                <h3 className="font-serif text-2xl font-bold mb-3 text-charcoal">{useCase.title}</h3>
                <p className="text-charcoal/70 mb-4 font-sans">{useCase.description}</p>
                <div className="bg-khaki/10 rounded-lg p-4 border border-khaki/30">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-chestnut mt-0.5" />
                    <div>
                      <div className="font-semibold text-charcoal font-sans">Measured Impact</div>
                      <div className="text-charcoal/70 font-sans">{useCase.impact}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 px-4 bg-bone">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4 text-charcoal">Your Path to Agentic AI</h2>
            <p className="text-xl text-charcoal/70 font-sans">A proven roadmap from assessment to enterprise scale</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-khaki/30"></div>
            <div className="space-y-12">
              {roadmapSteps.map((step, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-pearl">
                      <div className="text-sm font-semibold text-chestnut mb-1 font-sans">{step.timeline}</div>
                      <h3 className="font-serif text-xl font-bold mb-2 text-charcoal">{step.title}</h3>
                      <p className="text-charcoal/70 font-sans">{step.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center text-white font-bold font-sans shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-charcoal to-chestnut text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">Ready to Lead the Agentic Revolution?</h2>
          <p className="text-xl mb-8 text-pearl/90 font-sans">
            Join forward-thinking organizations deploying autonomous AI agents to transform their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
              className="px-8 py-4 bg-white text-chestnut font-sans font-bold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all inline-flex items-center"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/service-intake')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-sans font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              Talk to an Expert
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AgenticAI;