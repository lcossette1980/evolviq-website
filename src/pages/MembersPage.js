import React from 'react';
import { Target, CheckCircle, Download, BookOpen, FileText, Play, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MembersPage = () => {
  const { user, setIsLoginModalOpen } = useAuth();

  const resources = [
    {
      category: "Assessment Tools",
      items: [
        {
          title: "AIMI Self-Assessment Tool",
          description: "Interactive assessment to evaluate your organization's AI maturity",
          type: "tool",
          icon: <Target className="w-6 h-6" />,
          premium: false
        },
        {
          title: "Change Readiness Diagnostic", 
          description: "Comprehensive evaluation of organizational change capacity",
          type: "tool",
          icon: <CheckCircle className="w-6 h-6" />,
          premium: true
        },
        {
          title: "ROI Calculator",
          description: "Calculate potential returns on AI investment scenarios",
          type: "tool", 
          icon: <Target className="w-6 h-6" />,
          premium: true
        }
      ]
    },
    {
      category: "Implementation Guides",
      items: [
        {
          title: "AI Governance Framework Template",
          description: "Ready-to-use templates for establishing AI governance",
          type: "download",
          icon: <Download className="w-6 h-6" />,
          premium: true
        },
        {
          title: "Change Management Playbook",
          description: "Step-by-step guide for managing AI transformation",
          type: "download", 
          icon: <BookOpen className="w-6 h-6" />,
          premium: false
        },
        {
          title: "Use Case Prioritization Matrix",
          description: "Framework for evaluating and prioritizing AI opportunities",
          type: "download",
          icon: <FileText className="w-6 h-6" />,
          premium: true
        }
      ]
    },
    {
      category: "Video Training",
      items: [
        {
          title: "AI Leadership Fundamentals",
          description: "Essential knowledge for executives leading AI initiatives",
          type: "video",
          icon: <Play className="w-6 h-6" />,
          premium: false
        },
        {
          title: "Advanced Strategy Workshop",
          description: "Deep-dive into strategic AI implementation planning",
          type: "video", 
          icon: <Play className="w-6 h-6" />,
          premium: true
        },
        {
          title: "Culture Change Masterclass",
          description: "Building an AI-ready organizational culture",
          type: "video",
          icon: <Play className="w-6 h-6" />,
          premium: true
        }
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-bone py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lock className="w-16 h-16 text-chestnut mx-auto mb-6" />
          <h1 className="font-serif font-bold text-4xl text-charcoal mb-6">
            Members Only Area
          </h1>
          <p className="text-xl text-charcoal/80 mb-8">
            Access exclusive tools, templates, and resources to accelerate your AI transformation.
          </p>
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-chestnut text-white px-8 py-4 rounded-lg font-medium hover:bg-chestnut/90 transition-colors"
          >
            Login to Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
            Welcome Back, <span className="text-chestnut">{user.name}</span>
          </h1>
          <p className="text-xl text-charcoal/80">
            Access your exclusive transformation resources and tools.
          </p>
          {!user.isPremium && (
            <div className="mt-4 inline-block bg-khaki/20 px-4 py-2 rounded-lg">
              <span className="text-charcoal/70 text-sm">
                Upgrade to Premium for full access to all resources
              </span>
            </div>
          )}
        </div>

        {/* Membership Status */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-8 h-8 text-chestnut mr-4" />
              <div>
                <h2 className="font-medium text-lg text-charcoal">
                  {user.isPremium ? 'Premium Member' : 'Free Member'}
                </h2>
                <p className="text-charcoal/70 text-sm">
                  {user.isPremium 
                    ? 'Access to all premium tools and resources'
                    : 'Upgrade for exclusive premium content'
                  }
                </p>
              </div>
            </div>
            {!user.isPremium && (
              <button className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors">
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-12">
          {resources.map((category, index) => (
            <div key={index} className="bg-white rounded-xl p-8">
              <h2 className="font-serif font-bold text-2xl text-charcoal mb-6">
                {category.category}
              </h2>
              <div className="grid lg:grid-cols-3 gap-6">
                {category.items.map((item, i) => (
                  <div key={i} className={`border rounded-lg p-6 relative ${
                    item.premium && !user.isPremium 
                      ? 'border-khaki/30 bg-khaki/5' 
                      : 'border-pearl hover:border-chestnut transition-colors cursor-pointer'
                  }`}>
                    {item.premium && !user.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-khaki" />
                      </div>
                    )}
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-lg mr-4 ${
                        item.premium && !user.isPremium 
                          ? 'bg-khaki/10 text-khaki' 
                          : 'bg-chestnut/10 text-chestnut'
                      }`}>
                        {item.icon}
                      </div>
                      {item.premium && (
                        <span className="bg-chestnut/10 text-chestnut px-2 py-1 rounded text-xs font-medium">
                          Premium
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-lg text-charcoal mb-2">{item.title}</h3>
                    <p className="text-charcoal/70 text-sm mb-4">{item.description}</p>
                    <button 
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        item.premium && !user.isPremium
                          ? 'bg-khaki/20 text-khaki cursor-not-allowed'
                          : 'bg-chestnut text-white hover:bg-chestnut/90'
                      }`}
                      disabled={item.premium && !user.isPremium}
                    >
                      {item.premium && !user.isPremium ? 'Premium Required' : 
                       item.type === 'tool' ? 'Launch Tool' :
                       item.type === 'download' ? 'Download' : 'Watch Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade CTA for Free Members */}
        {!user.isPremium && (
          <div className="bg-chestnut/10 rounded-2xl p-12 text-center mt-16">
            <h2 className="font-serif font-bold text-3xl text-charcoal mb-6">
              Unlock Full Access with Premium
            </h2>
            <p className="text-xl text-charcoal/80 mb-8 max-w-2xl mx-auto">
              Get unlimited access to all assessment tools, implementation templates, 
              and exclusive video training content.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-chestnut text-white px-8 py-4 rounded-lg font-medium hover:bg-chestnut/90 transition-colors">
                Upgrade Now - $97/month
              </button>
              <button className="border-2 border-chestnut text-chestnut px-8 py-4 rounded-lg font-medium hover:bg-chestnut hover:text-white transition-colors">
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersPage;