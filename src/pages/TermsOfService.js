import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, AlertCircle, Shield, Users, CreditCard } from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();
  const lastUpdated = "January 17, 2025";

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: <FileText className="w-5 h-5" />,
      content: [
        "By accessing or using EvolvIQ's services, you agree to be bound by these Terms of Service.",
        "If you disagree with any part of these terms, you may not access our services.",
        "We reserve the right to update these terms at any time. Continued use after changes constitutes acceptance."
      ]
    },
    {
      title: "Use of Services",
      icon: <Users className="w-5 h-5" />,
      content: [
        {
          subtitle: "Permitted Use",
          items: [
            "You may use our services for lawful purposes only",
            "You must provide accurate and complete information",
            "You are responsible for maintaining account security",
            "You may not share login credentials with others"
          ]
        },
        {
          subtitle: "Prohibited Use",
          items: [
            "Violating any laws or regulations",
            "Infringing on intellectual property rights",
            "Transmitting malware or harmful code",
            "Attempting to gain unauthorized access",
            "Using automated systems to access services",
            "Reselling or redistributing our services without permission"
          ]
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: <Shield className="w-5 h-5" />,
      content: [
        {
          subtitle: "Our Property",
          items: [
            "All content, features, and functionality are owned by EvolvIQ",
            "This includes text, graphics, logos, and software",
            "You may not copy, modify, or distribute without permission"
          ]
        },
        {
          subtitle: "Your Content",
          items: [
            "You retain ownership of content you submit",
            "You grant us license to use your content to provide services",
            "You warrant that your content doesn't infringe on others' rights"
          ]
        }
      ]
    },
    {
      title: "Subscriptions and Payments",
      icon: <CreditCard className="w-5 h-5" />,
      content: [
        {
          subtitle: "Billing",
          items: [
            "Subscription fees are billed in advance",
            "Prices are subject to change with 30 days notice",
            "You authorize automatic renewal unless cancelled"
          ]
        },
        {
          subtitle: "Cancellation and Refunds",
          items: [
            "You may cancel subscription at any time",
            "Cancellation takes effect at end of billing period",
            "No refunds for partial months of service",
            "Annual plans may be eligible for pro-rated refunds"
          ]
        }
      ]
    },
    {
      title: "Limitation of Liability",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        "EvolvIQ provides services 'as is' without warranties",
        "We are not liable for indirect, incidental, or consequential damages",
        "Our total liability shall not exceed fees paid in the last 12 months",
        "Some jurisdictions don't allow limitation of liability"
      ]
    },
    {
      title: "Governing Law",
      icon: <Scale className="w-5 h-5" />,
      content: [
        "These terms are governed by the laws of [Your State/Country]",
        "Disputes shall be resolved in courts of [Your Jurisdiction]",
        "You waive any objections to jurisdiction or venue"
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
            Terms of Service
          </h1>
          <p className="text-charcoal/70">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-charcoal/80 leading-relaxed mb-4">
            Welcome to EvolvIQ. These Terms of Service ("Terms") govern your use of our website, 
            applications, and services (collectively, the "Service"). Please read these Terms carefully 
            before using our Service.
          </p>
          <p className="text-charcoal/80 leading-relaxed">
            By using EvolvIQ, you agree to be bound by these Terms. If you're using our Service on 
            behalf of an organization, you're agreeing to these Terms for that organization.
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
            
            {Array.isArray(section.content) && !section.content[0].subtitle ? (
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <span className="text-chestnut mr-2 mt-1">•</span>
                    <span className="text-charcoal/80">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              section.content.map((subsection, subIndex) => (
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
              ))
            )}
          </div>
        ))}

        {/* Additional Terms */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
            Additional Terms
          </h2>
          <div className="space-y-4 text-charcoal/80">
            <div>
              <h3 className="font-semibold mb-2">Severability</h3>
              <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in effect.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Entire Agreement</h3>
              <p>These Terms constitute the entire agreement between you and EvolvIQ regarding the use of our Service.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <p>For questions about these Terms, please contact us at loren@evolviq.org.</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-charcoal/60">
          <p>
            Thank you for reading our Terms of Service. We're committed to providing you with the best possible service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;