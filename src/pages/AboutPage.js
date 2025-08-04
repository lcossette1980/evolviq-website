import React, { useState } from 'react';
import { Target, Zap, Users, Shield, User, Linkedin, Mail, CheckCircle, X, ArrowRight, Layers, Rocket, BarChart3, TrendingUp, Github } from 'lucide-react';
import InteractiveResume from '../components/about/InteractiveResume';
import ImageWithFallback from '../components/shared/ImageWithFallback';

const AboutPage = () => {
  const [selectedTab, setSelectedTab] = useState('mission');

  const tabContent = {
    mission: {
      title: "Our Mission & Vision",
      content: (
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-xl">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">Our Mission</h3>
            <p className="text-charcoal/80 leading-relaxed mb-6">
              To make AI transformation accessible and practical for small businesses, nonprofits, and service organizations. 
              We believe every organization—regardless of size—deserves the competitive advantages that thoughtful AI implementation can provide.
            </p>
            <ImageWithFallback
              src="/images/about/mission-image.jpg"
              alt="Our Mission - Making AI accessible for small businesses"
              fallbackIcon={Target}
              fallbackText="Mission Image"
              className="w-full h-48 object-cover rounded-lg"
              containerClassName="rounded-lg overflow-hidden h-48"
            />
          </div>
          <div className="bg-white p-8 rounded-xl">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">Our Vision</h3>
            <p className="text-charcoal/80 leading-relaxed mb-6">
              A world where small and medium-sized organizations thrive alongside and compete with larger competitors by leveraging AI that 
              enhances their unique strengths—personal service, agility, and deep community connections.
            </p>
            <ImageWithFallback
              src="/images/about/vision-image.jpg"
              alt="Our Vision - Empowering organizations with AI"
              fallbackIcon={Zap}
              fallbackText="Vision Image"
              className="w-full h-48 object-cover rounded-lg"
              containerClassName="rounded-lg overflow-hidden h-48"
            />
          </div>
        </div>
      )
    },
    approach: {
      title: "Our Approach",
      content: (
        <div className="space-y-12">
          {/* Hero Section with Statistics */}
          <div className="relative bg-gradient-to-r from-khaki/20 to-pearl/30 rounded-xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 p-8 items-center">
              <div>
                <p className="text-xl text-charcoal/90 font-medium mb-4">
                  Most companies throw technology at problems and wonder why nothing changes.
                </p>
                <p className="text-3xl text-chestnut font-bold mb-6">
                  We know better.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-chestnut">85%</div>
                    <div className="text-sm text-charcoal/70">Projects Fail</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg">
                    <div className="text-2xl font-bold text-chestnut">95%</div>
                    <div className="text-sm text-charcoal/70">Our Success Rate</div>
                  </div>
                </div>
              </div>
              <ImageWithFallback
                src="/images/about/approach/ai-success-statistics-infographic.jpg"
                alt="AI Success Statistics - 85% of projects fail vs our 95% success rate"
                fallbackIcon={BarChart3}
                fallbackText="Success Statistics"
                className="w-full h-full object-cover"
                containerClassName="bg-white rounded-lg h-64 overflow-hidden"
              />
            </div>
          </div>

          {/* The Compound Transformation™ */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-block bg-chestnut/10 px-6 py-3 rounded-lg mb-6">
                <p className="text-lg font-medium text-charcoal">
                  The Compound Transformation™
                </p>
                <p className="text-sm text-charcoal/70 mt-1">
                  Change That Builds on Itself
                </p>
              </div>
              <h3 className="font-serif font-bold text-2xl text-charcoal mb-6">
                Why 85% of AI Projects Fail, And How We're Different
              </h3>
            </div>
            
            {/* Process Flow */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-semibold text-charcoal mb-2">Traditional Approach</h4>
                <p className="text-sm text-charcoal/70">Tech-first, people later</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-charcoal/30" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-chestnut/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-chestnut" />
                </div>
                <h4 className="font-semibold text-charcoal mb-2">EvolvIQ Method</h4>
                <p className="text-sm text-charcoal/70">Human-centered transformation</p>
              </div>
            </div>

            {/* Process diagram */}
            <ImageWithFallback
              src="/images/about/approach/ai-transformation-process-diagram.jpg"
              alt="AI Transformation Process - Step-by-step methodology"
              fallbackIcon={Layers}
              fallbackText="Process Diagram"
              className="w-full h-full object-cover"
              containerClassName="rounded-lg h-48 overflow-hidden"
            />
          </div>

          {/* Three Pillars - Enhanced */}
          <div className="bg-gradient-to-r from-pearl/20 to-khaki/20 p-8 rounded-xl">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4 text-center">
              The Complete Solution Others Miss
            </h3>
            <div className="text-center mb-8">
              <p className="text-3xl font-bold text-chestnut mb-4">
                Strategy + Culture + Technology
              </p>
              <p className="text-charcoal/80 text-lg">
                Where others focus on just one pillar, we master all three.
              </p>
            </div>
            
            {/* Three Pillars Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-chestnut/20 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-chestnut" />
                </div>
                <h4 className="font-bold text-lg text-charcoal mb-2">Strategy</h4>
                <p className="text-sm text-charcoal/80 mb-4">Clear roadmap with measurable outcomes</p>
                <ImageWithFallback
                  src="/images/about/approach/strategy-session-visual.jpg"
                  alt="Diverse team strategy session"
                  fallbackIcon={Target}
                  className="w-full h-full object-cover"
                  containerClassName="rounded h-24 overflow-hidden"
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-chestnut/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-chestnut" />
                </div>
                <h4 className="font-bold text-lg text-charcoal mb-2">Culture</h4>
                <p className="text-sm text-charcoal/80 mb-4">Team alignment and change readiness</p>
                <ImageWithFallback
                  src="/images/about/approach/culture-transformation-visual.jpg"
                  alt="Culture transformation visual"
                  fallbackIcon={Users}
                  className="w-full h-full object-cover"
                  containerClassName="rounded h-24 overflow-hidden"
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-chestnut/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-chestnut" />
                </div>
                <h4 className="font-bold text-lg text-charcoal mb-2">Technology</h4>
                <p className="text-sm text-charcoal/80 mb-4">AI tools that actually integrate</p>
                <ImageWithFallback
                  src="/images/about/approach/technology-implementation-visual.jpg"
                  alt="Technology implementation visual"
                  fallbackIcon={Zap}
                  className="w-full h-full object-cover"
                  containerClassName="rounded h-24 overflow-hidden"
                />
              </div>
            </div>

            <div className="text-center bg-white/50 rounded-lg p-6">
              <p className="text-charcoal/90 font-medium text-lg">
                It's the difference between shiny new tools gathering dust and real business transformation.
              </p>
            </div>
          </div>

          {/* Human-First Approach - Enhanced */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-center mb-8">
              <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
                Humans Drive Technology, Not Vice Versa
              </h3>
              <p className="text-lg text-charcoal/80">
                Technology should amplify your team's brilliance, not replace it
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <div className="bg-khaki/10 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-charcoal mb-3">What We've Learned:</h4>
                  <p className="text-charcoal/80">
                    From hundreds of implementations: The best AI solutions make your people more powerful, not obsolete.
                  </p>
                </div>
                
                <h4 className="text-charcoal/90 font-medium mb-4">Our human-first approach means:</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-chestnut/20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-chestnut" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">Strategic Focus</p>
                      <p className="text-sm text-charcoal/70">Your team becomes more strategic, not more stressed</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-chestnut/20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-chestnut" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">Smart Automation</p>
                      <p className="text-sm text-charcoal/70">AI handles the grunt work, humans handle the breakthroughs</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-chestnut/20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-chestnut" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">Win-Win Results</p>
                      <p className="text-sm text-charcoal/70">Everyone wins, including your bottom line</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <ImageWithFallback
                  src="/images/about/approach/human-ai-collaboration.jpg"
                  alt="Human-AI Collaboration - Team empowerment"
                  fallbackIcon={Users}
                  fallbackText="Human-AI Collaboration"
                  className="w-full h-full object-cover"
                  containerClassName="bg-white border rounded-lg h-48 overflow-hidden"
                />
                <ImageWithFallback
                  src="/images/about/approach/productivity-gains-chart.jpg"
                  alt="Productivity gains chart"
                  fallbackIcon={TrendingUp}
                  fallbackText="Productivity Gains"
                  className="w-full h-full object-cover"
                  containerClassName="bg-gray-100 rounded-lg h-32 overflow-hidden"
                />
              </div>
            </div>
          </div>

          {/* Implementation Process */}
          <div className="bg-gradient-to-r from-khaki/10 to-pearl/20 rounded-xl p-8">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-6 text-center">
              Our 4-Phase Implementation Process
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { phase: "01", title: "Assess", desc: "Current state analysis", icon: Target },
                { phase: "02", title: "Align", desc: "Strategy & culture prep", icon: Users },
                { phase: "03", title: "Implement", desc: "Phased deployment", icon: Zap },
                { phase: "04", title: "Optimize", desc: "Continuous improvement", icon: TrendingUp }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <step.icon className="w-8 h-8 text-chestnut" />
                  </div>
                  <div className="text-xs text-chestnut font-bold mb-1">PHASE {step.phase}</div>
                  <h4 className="font-semibold text-charcoal mb-1">{step.title}</h4>
                  <p className="text-sm text-charcoal/70">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action - Enhanced */}
          <div className="text-center bg-white border-2 border-chestnut/20 rounded-xl p-8">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
              Ready for Transformation That Actually Transforms?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="text-left">
                <p className="text-lg text-charcoal/80 mb-2">
                  Stop throwing money at AI projects that fizzle out.
                </p>
                <p className="text-lg text-charcoal/80 mb-4">
                  Start building change that compounds.
                </p>
                <p className="text-xl text-charcoal font-medium">
                  We're not here to sell you promises. We're here to deliver results you can bank on.
                </p>
              </div>
              <ImageWithFallback
                src="/images/about/business-transformation-meeting.jpg"
                alt="Business transformation meeting - team presenting growth metrics and results"
                fallbackIcon={BarChart3}
                fallbackText="Transformation Results"
                className="w-full h-full object-cover"
                containerClassName="bg-gray-100 rounded-lg h-40 overflow-hidden"
              />
            </div>
          </div>
        </div>
      )
    },
    founder: {
      title: "Meet Our Founder",
      content: (
        <div className="space-y-12">
          {/* Founder Introduction */}
          <div className="bg-white p-12 rounded-2xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative">
                <ImageWithFallback
                  src="/images/about/loren-cossette-photo.jpg"
                  alt="Loren Cossette, Founder & Principal Consultant"
                  fallbackIcon={User}
                  fallbackText="Loren Cossette"
                  className="w-full h-full object-cover object-top"
                  containerClassName="rounded-2xl h-96 overflow-hidden bg-gray-100"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">Loren Cossette</h3>
                <div className="text-chestnut font-medium mb-4">Founder & Principal Consultant</div>
                <p className="text-charcoal/80 mb-4">
                  After years of watching small businesses struggle with technology implementations designed for enterprises, 
                  Loren founded EvolvIQ to bridge the gap between AI's potential and practical application for smaller organizations.
                </p>
                <p className="text-charcoal/80 mb-4">
                  "I've seen too many great organizations miss out on AI's benefits because existing solutions don't fit their 
                  reality. Every business deserves access to tools that help them serve their customers better and grow sustainably."
                </p>
                <div className="bg-pearl/20 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-charcoal mb-2">Experience Includes:</h4>
                  <ul className="text-sm text-charcoal/80 space-y-1">
                    <li>• 20+ years in organizational transformation</li>
                    <li>• Led AI strategy for $126B portfolio at USAA</li>
                    <li>• Published researcher in AI ethics and education</li>
                    <li>• Military leadership experience across global operations</li>
                  </ul>
                </div>
                <div className="flex space-x-4">
                  <a 
                    href="https://linkedin.com/in/loren-cossette" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-chestnut hover:text-chestnut/80 transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://github.com/lcossette1980" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-chestnut hover:text-chestnut/80 transition-colors"
                  >
                    <Github className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Resume */}
          <InteractiveResume />
        </div>
      )
    },
    values: {
      title: "Our Values",
      content: (
        <div className="space-y-12">
          {/* Hero Image */}
          <div className="relative bg-gradient-to-r from-khaki/20 to-pearl/30 rounded-xl overflow-hidden">
            <ImageWithFallback
              src="/images/about/values/team-collaboration-diversity.jpg"
              alt="Values in Action - Team collaboration & diversity"
              fallbackIcon={Users}
              fallbackText="Team Collaboration"
              className="w-full h-full object-cover"
              containerClassName="aspect-video overflow-hidden"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Users className="w-6 h-6 text-chestnut" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-2">Accessibility First</h3>
                  <p className="text-charcoal/80">
                    AI transformation shouldn't be a privilege for large organizations. We make advanced technology 
                    accessible through practical approaches and affordable pricing.
                  </p>
                </div>
              </div>
              <ImageWithFallback
                src="/images/about/values/inclusive-workspace.jpg"
                alt="Inclusive workspace environment"
                fallbackIcon={Users}
                className="w-full h-full object-cover"
                containerClassName="rounded-lg h-32 overflow-hidden"
              />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Shield className="w-6 h-6 text-chestnut" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-2">Transparency</h3>
                  <p className="text-charcoal/80">
                    Clear pricing, honest timelines, and realistic expectations. No hidden costs or oversold promises—
                    just practical guidance you can trust.
                  </p>
                </div>
              </div>
              <ImageWithFallback
                src="/images/about/values/trust-transparency.jpg"
                alt="Trust and transparency in action"
                fallbackIcon={Shield}
                className="w-full h-full object-cover"
                containerClassName="rounded-lg h-32 overflow-hidden"
              />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Target className="w-6 h-6 text-chestnut" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-2">Results-Focused</h3>
                  <p className="text-charcoal/80">
                    Every recommendation is tied to measurable business outcomes. We're not interested in AI for AI's sake—
                    only driving real value.
                  </p>
                </div>
              </div>
              <ImageWithFallback
                src="/images/about/values/results-metrics.jpg"
                alt="Results and metrics tracking"
                fallbackIcon={Target}
                className="w-full h-full object-cover"
                containerClassName="rounded-lg h-32 overflow-hidden"
              />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Zap className="w-6 h-6 text-chestnut" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-2">Sustainable Growth</h3>
                  <p className="text-charcoal/80">
                    We build foundations for long-term success, not quick fixes. Your team learns, grows, and becomes 
                    more capable with each project.
                  </p>
                </div>
              </div>
              <ImageWithFallback
                src="/images/about/values/growth-learning.jpg"
                alt="Growth and learning culture"
                fallbackIcon={Zap}
                className="w-full h-full object-cover"
                containerClassName="rounded-lg h-32 overflow-hidden"
              />
            </div>
          </div>

          {/* Impact Statement with Image */}
          <div className="bg-gradient-to-r from-khaki/10 to-pearl/20 rounded-xl p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
                  Why This Matters to Your Organization
                </h3>
                <p className="text-lg text-charcoal/80 mb-6">
                  When you work with EvolvIQ, you're not just getting AI consulting—you're partnering with advocates 
                  who understand the unique challenges and opportunities of smaller organizations.
                </p>
                <div className="flex items-center space-x-4 text-sm text-charcoal/70">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-chestnut rounded-full mr-2"></div>
                    <span>Purpose-driven approach</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-chestnut rounded-full mr-2"></div>
                    <span>Proven methodologies</span>
                  </div>
                </div>
              </div>
              <ImageWithFallback
                src="/images/about/impact-story-transformation.jpg"
                alt="Impact Story - Client success transformation results"
                fallbackIcon={TrendingUp}
                fallbackText="Impact Story"
                className="w-full h-full object-cover"
                containerClassName="bg-white rounded-lg h-64 overflow-hidden"
              />
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
            Empowering Small Organizations to <span className="text-chestnut">Thrive with AI</span>
          </h1>
          <p className="text-xl text-charcoal/80 max-w-4xl mx-auto">
            We believe every organization—regardless of size—deserves access to AI that enhances their mission 
            and strengthens their competitive position.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-sm flex flex-wrap">
            {Object.keys(tabContent).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedTab === tab 
                    ? 'bg-chestnut text-white' 
                    : 'text-charcoal hover:text-chestnut'
                }`}
              >
                {tabContent[tab].title}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-16">
          {tabContent[selectedTab].content}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="font-serif font-bold text-3xl text-charcoal mb-8">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-charcoal/80 max-w-2xl mx-auto mb-8">
            Let's explore how AI can enhance your team's capabilities and help you better serve your community.
          </p>
          <button 
            onClick={() => window.location.href = '/service-intake'}
            className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation"
          >
            Start the Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;