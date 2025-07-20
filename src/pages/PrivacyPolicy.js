import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "January 17, 2025";

  const sections = [
    {
      title: "Information We Collect",
      icon: <Database className="w-5 h-5" />,
      content: [
        {
          subtitle: "Information You Provide",
          items: [
            "Account information (name, email, password)",
            "Organization details (company name, size, industry)",
            "Assessment responses and results",
            "Payment information (processed securely by our payment provider)",
            "Communications with our support team"
          ]
        },
        {
          subtitle: "Information Collected Automatically",
          items: [
            "Usage data (pages visited, features used, time spent)",
            "Device information (browser type, operating system)",
            "IP address and general location data",
            "Cookies and similar tracking technologies"
          ]
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
      content: [
        {
          subtitle: "Primary Uses",
          items: [
            "Provide and improve our services",
            "Process assessments and generate recommendations",
            "Manage your account and subscriptions",
            "Send service updates and important notifications",
            "Respond to support requests"
          ]
        },
        {
          subtitle: "Analytics and Improvement",
          items: [
            "Analyze usage patterns to improve features",
            "Develop new tools and services",
            "Ensure platform security and prevent fraud",
            "Comply with legal obligations"
          ]
        }
      ]
    },
    {
      title: "Data Sharing and Disclosure",
      icon: <Globe className="w-5 h-5" />,
      content: [
        {
          subtitle: "We DO NOT",
          items: [
            "Sell your personal information",
            "Share assessment results without permission",
            "Use your data for advertising purposes",
            "Transfer data to third parties for marketing"
          ]
        },
        {
          subtitle: "We MAY Share Data",
          items: [
            "With service providers who help operate our platform",
            "When required by law or legal process",
            "To protect rights, safety, or property",
            "With your explicit consent"
          ]
        }
      ]
    },
    {
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "End-to-end encryption for sensitive data",
            "Secure HTTPS connections",
            "Regular security audits and updates",
            "Access controls and authentication",
            "Secure data centers with redundancy"
          ]
        }
      ]
    },
    {
      title: "Your Rights",
      icon: <Shield className="w-5 h-5" />,
      content: [
        {
          subtitle: "You Have the Right To",
          items: [
            "Access your personal information",
            "Correct inaccurate data",
            "Delete your account and data",
            "Export your data in a portable format",
            "Opt-out of marketing communications",
            "Request restrictions on data processing"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-bone pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-charcoal/70 hover:text-charcoal mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-4">
            Privacy Policy
          </h1>
          <p className="text-charcoal/70">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-charcoal/80 leading-relaxed">
            At EvolvIQ, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our platform. We are committed 
            to protecting your personal information and your right to privacy.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-chestnut/10 rounded-lg mr-3">
                <div className="text-chestnut">
                  {section.icon}
                </div>
              </div>
              <h2 className="font-serif text-2xl font-bold text-charcoal">
                {section.title}
              </h2>
            </div>
            
            {section.content.map((subsection, subIndex) => (
              <div key={subIndex} className="mb-6 last:mb-0">
                <h3 className="font-semibold text-lg text-charcoal mb-3">
                  {subsection.subtitle}
                </h3>
                <ul className="space-y-2">
                  {subsection.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-chestnut mr-2 mt-1">•</span>
                      <span className="text-charcoal/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        {/* Contact Section */}
        <div className="bg-chestnut/10 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-chestnut mr-2" />
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Contact Us
            </h2>
          </div>
          <p className="text-charcoal/80 mb-4">
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2 text-charcoal/80">
            <p>Email: loren@evolviq.org</p>
            <p>Address: EvolvIQ, 123 Innovation Way, Tech City, TC 12345</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-charcoal/60">
          <p>
            By using EvolvIQ, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;