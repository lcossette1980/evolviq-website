import React, { useState } from 'react';
import { Target, Zap, Users, Shield, User, Linkedin, Mail, CheckCircle } from 'lucide-react';

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
            <div className="relative">
              <div className="rounded-lg h-48 overflow-hidden">
                <img 
                  src="/images/about/mission-image.jpg" 
                  alt="Our Mission"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="bg-pearl/30 rounded-lg h-48 flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center">
                    <Target className="w-12 h-12 text-chestnut mx-auto mb-2" />
                    <div className="text-charcoal/60 text-sm">mission-image.jpg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">Our Vision</h3>
            <p className="text-charcoal/80 leading-relaxed mb-6">
              A world where small and medium-sized organizations thrive alongside and compete with larger competitors by leveraging AI that 
              enhances their unique strengths—personal service, agility, and deep community connections.
            </p>
            <div className="relative">
              <div className="rounded-lg h-48 overflow-hidden">
                <img 
                  src="/images/about/vision-image.jpg" 
                  alt="Our Vision"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="bg-pearl/30 rounded-lg h-48 flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-chestnut mx-auto mb-2" />
                    <div className="text-charcoal/60 text-sm">vision-image.jpg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    approach: {
      title: "Our Approach",
      content: (
        <div className="space-y-8">
          {/* Opening Statement */}
          <div className="text-center mb-12">
            <p className="text-xl text-charcoal/90 font-medium mb-4">
              Most companies throw technology at problems and wonder why nothing changes.
            </p>
            <p className="text-2xl text-chestnut font-bold">
              We know better.
            </p>
          </div>

          {/* Why AI Projects Fail */}
          <div className="bg-white p-8 rounded-xl mb-8">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-6 text-center">
              Why 85% of AI Projects Fail, And How We're Different
            </h3>
            <div className="text-center mb-8">
              <div className="inline-block bg-chestnut/10 px-6 py-3 rounded-lg">
                <p className="text-lg font-medium text-charcoal">
                  The Compound Transformation™
                </p>
                <p className="text-sm text-charcoal/70 mt-1">
                  Change That Builds on Itself
                </p>
              </div>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="bg-pearl/20 p-8 rounded-xl mb-8">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4 text-center">
              The Complete Solution Others Miss
            </h3>
            <div className="text-center mb-8">
              <p className="text-3xl font-bold text-chestnut">
                Strategy + Culture + Technology
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-charcoal/80 text-center text-lg">
                Where others focus on just one pillar, we master all three.
              </p>
              <p className="text-charcoal/80">
                Most AI initiatives crash and burn because they treat technology as a magic bullet. 
                Reality check: Your people make or break every transformation.
              </p>
              <p className="text-charcoal/80">
                We don't just implement AI; we orchestrate the strategy, reshape the culture, 
                and deploy technology that actually works together.
              </p>
              <p className="text-charcoal/90 font-medium text-center mt-6">
                It's the difference between shiny new tools gathering dust and real business transformation.
              </p>
            </div>
          </div>

          {/* Human-First Approach */}
          <div className="bg-white p-8 rounded-xl">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-6 text-center">
              Humans Drive Technology, Not Vice Versa
            </h3>
            <p className="text-center text-lg text-charcoal/80 mb-8">
              Technology should amplify your team's brilliance, not replace it
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-charcoal/80 mb-4">
                  Here's what we've learned from hundreds of implementations: 
                  The best AI solutions make your people more powerful, not obsolete.
                </p>
                <p className="text-charcoal/90 font-medium mb-4">
                  Our human-first approach means:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-chestnut mr-3 mt-1 flex-shrink-0" />
                    <span className="text-charcoal/80">Your team becomes more strategic, not more stressed</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-chestnut mr-3 mt-1 flex-shrink-0" />
                    <span className="text-charcoal/80">AI handles the grunt work, humans handle the breakthroughs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-chestnut mr-3 mt-1 flex-shrink-0" />
                    <span className="text-charcoal/80">Everyone wins, including your bottom line</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="rounded-lg h-64 overflow-hidden">
                  <img 
                    src="/images/about/transformation-inforgraphic.png" 
                    alt="Transformation Infographic"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="bg-pearl/30 rounded-lg h-64 flex items-center justify-center" style={{display: 'none'}}>
                    <div className="text-center">
                      <Users className="w-16 h-16 text-chestnut mx-auto mb-4" />
                      <div className="text-charcoal/60 text-sm">transformation-infographic.png</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-khaki/10 rounded-xl p-8">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
              Ready for Transformation That Actually Transforms?
            </h3>
            <p className="text-lg text-charcoal/80 mb-2">
              Stop throwing money at AI projects that fizzle out.
            </p>
            <p className="text-lg text-charcoal/80 mb-6">
              Start building change that compounds.
            </p>
            <p className="text-xl text-charcoal font-medium">
              We're not here to sell you on promises. We're here to deliver results you can bank on.
            </p>
          </div>
        </div>
      )
    },
    founder: {
      title: "Meet Our Founder",
      content: (
        <div className="bg-white p-12 rounded-2xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="rounded-2xl h-96 overflow-hidden">
                <img 
                  src="/images/about/loren-cossette-photo.jpg" 
                  alt="Loren Cossette, Founder & Principal Consultant"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="bg-pearl/30 rounded-2xl h-96 flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center">
                    <User className="w-20 h-20 text-chestnut mx-auto mb-4" />
                    <div className="text-charcoal/60 text-sm">loren-cossette-photo.jpg</div>
                  </div>
                </div>
              </div>
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
                  <li>• 15+ years in organizational transformation</li>
                  <li>• Former consultant to Fortune 500 companies</li>
                  <li>• Specialized in change management for technology adoption</li>
                  <li>• Certified in multiple AI and project management frameworks</li>
                </ul>
              </div>
              <div className="flex space-x-4">
                <button className="text-chestnut hover:text-chestnut/80 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </button>
                <button className="text-chestnut hover:text-chestnut/80 transition-colors">
                  <Mail className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    values: {
      title: "Our Values",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-chestnut" />
                </div>
                <h3 className="font-serif font-bold text-xl text-charcoal">Accessibility First</h3>
              </div>
              <p className="text-charcoal/80 text-sm">
                AI transformation shouldn't be a privilege for large organizations. We make advanced technology 
                accessible through practical approaches and affordable pricing.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-chestnut" />
                </div>
                <h3 className="font-serif font-bold text-xl text-charcoal">Transparency</h3>
              </div>
              <p className="text-charcoal/80 text-sm">
                Clear pricing, honest timelines, and realistic expectations. No hidden costs or oversold promises—
                just practical guidance you can trust.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-chestnut" />
                </div>
                <h3 className="font-serif font-bold text-xl text-charcoal">Results-Focused</h3>
              </div>
              <p className="text-charcoal/80 text-sm">
                Every recommendation is tied to measurable business outcomes. We're not interested in AI for AI's sake—
                only implementations that drive real value.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-chestnut" />
                </div>
                <h3 className="font-serif font-bold text-xl text-charcoal">Sustainable Growth</h3>
              </div>
              <p className="text-charcoal/80 text-sm">
                We build foundations for long-term success, not quick fixes. Your team learns, grows, and becomes 
                more capable with each project.
              </p>
            </div>
          </div>
          <div className="text-center bg-khaki/10 rounded-xl p-8">
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
              Why This Matters to Your Organization
            </h3>
            <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
              When you work with EvolvIQ, you're not just getting AI consulting—you're partnering with advocates 
              who understand the unique challenges and opportunities of smaller organizations.
            </p>
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
          <button className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation">
            Start the Conversation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;