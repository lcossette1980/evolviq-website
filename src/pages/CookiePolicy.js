import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cookie, Info, Settings, Shield, Globe, AlertCircle } from 'lucide-react';

const CookiePolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "January 17, 2025";

  const sections = [
    {
      title: "What Are Cookies?",
      icon: <Info className="w-5 h-5" />,
      content: [
        "Cookies are small text files stored on your device when you visit our website.",
        "They help us remember your preferences and improve your experience.",
        "Cookies don't contain personal information that directly identifies you."
      ]
    },
    {
      title: "Types of Cookies We Use",
      icon: <Cookie className="w-5 h-5" />,
      content: [
        {
          subtitle: "Essential Cookies",
          description: "Required for the website to function properly",
          items: [
            "Authentication and security",
            "Session management",
            "Load balancing",
            "User preferences"
          ]
        },
        {
          subtitle: "Functional Cookies",
          description: "Enhance your experience on our platform",
          items: [
            "Remember your settings",
            "Language preferences",
            "Accessibility options",
            "Personalized features"
          ]
        },
        {
          subtitle: "Analytics Cookies",
          description: "Help us understand how you use our services",
          items: [
            "Page views and navigation paths",
            "Time spent on pages",
            "Error reporting",
            "Performance monitoring"
          ]
        }
      ]
    },
    {
      title: "Third-Party Cookies",
      icon: <Globe className="w-5 h-5" />,
      content: [
        {
          subtitle: "Service Providers",
          items: [
            "Payment processors (Stripe)",
            "Analytics services (Google Analytics)",
            "Customer support tools",
            "Security services"
          ]
        },
        {
          subtitle: "What We DON'T Use",
          items: [
            "Advertising cookies",
            "Social media tracking",
            "Cross-site tracking",
            "Data brokers"
          ]
        }
      ]
    },
    {
      title: "Managing Cookies",
      icon: <Settings className="w-5 h-5" />,
      content: [
        {
          subtitle: "Browser Settings",
          items: [
            "Most browsers allow you to control cookies through settings",
            "You can block or delete cookies",
            "You can set your browser to alert you when cookies are sent",
            "Blocking essential cookies may affect site functionality"
          ]
        },
        {
          subtitle: "Our Cookie Settings",
          items: [
            "We provide cookie preference controls",
            "You can opt-out of non-essential cookies",
            "Settings are saved for future visits",
            "Changes take effect immediately"
          ]
        }
      ]
    },
    {
      title: "Cookie Duration",
      icon: <AlertCircle className="w-5 h-5" />,
      content: [
        {
          subtitle: "Session Cookies",
          items: [
            "Deleted when you close your browser",
            "Used for temporary functions",
            "Essential for navigation"
          ]
        },
        {
          subtitle: "Persistent Cookies",
          items: [
            "Remain for a set period",
            "Remember your preferences",
            "Typical duration: 30 days to 1 year",
            "Can be deleted manually anytime"
          ]
        }
      ]
    }
  ];

  const browserInstructions = [
    { name: "Chrome", url: "https://support.google.com/chrome/answer/95647" },
    { name: "Firefox", url: "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" },
    { name: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" },
    { name: "Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" }
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
            Cookie Policy
          </h1>
          <p className="text-charcoal/70">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <p className="text-charcoal/80 leading-relaxed mb-4">
            This Cookie Policy explains how EvolvIQ uses cookies and similar technologies to recognize 
            you when you visit our platform. It explains what these technologies are and why we use them, 
            as well as your rights to control our use of them.
          </p>
          <div className="bg-chestnut/10 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-chestnut mr-2 mt-0.5" />
              <p className="text-charcoal/80 text-sm">
                <strong>Our Commitment:</strong> We use cookies responsibly and never for advertising or 
                selling your data. We prioritize your privacy and only use cookies to improve your experience.
              </p>
            </div>
          </div>
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
                  <h3 className="font-semibold text-lg text-charcoal mb-2">
                    {subsection.subtitle}
                  </h3>
                  {subsection.description && (
                    <p className="text-charcoal/70 text-sm mb-3">{subsection.description}</p>
                  )}
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

        {/* Browser Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
            Browser Cookie Settings
          </h2>
          <p className="text-charcoal/80 mb-4">
            You can manage cookies through your browser settings. Here are instructions for popular browsers:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {browserInstructions.map((browser, index) => (
              <a
                key={index}
                href={browser.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-chestnut mr-2" />
                <span className="text-charcoal/80">{browser.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-chestnut/10 rounded-lg p-6 mb-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">
            Questions About Cookies?
          </h2>
          <p className="text-charcoal/80 mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <div className="space-y-2 text-charcoal/80">
            <p>Email: loren@evolviq.org</p>
            <p>Or visit our Privacy Policy for more information about data protection.</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-charcoal/60">
          <p>
            This Cookie Policy is part of our Privacy Policy. By using EvolvIQ, you consent to our use of cookies as described.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;