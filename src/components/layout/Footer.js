import React from 'react';
import { Linkedin, Facebook, Mail, Calendar, MapPin, Brain, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <div className="font-serif font-bold text-2xl mb-2">
                <span className="text-white">Evolv</span><span className="text-chestnut">IQ</span>
              </div>
              <div className="text-sm text-white/70">
                Adaptive Intelligence. Strategic Impact.
              </div>
            </div>
            <p className="text-white/80 text-sm mb-6">
              Empowering small businesses, nonprofits, and service organizations with practical AI transformation guidance and assessment tools.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/evolviqsatx/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-chestnut transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61578007494214" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-chestnut transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="mailto:loren@evolviq.org"
                className="text-white/60 hover:text-chestnut transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* AI Tools & Assessments */}
          <div>
            <h3 className="font-medium text-lg mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-chestnut" />
              AI Tools & Assessments
            </h3>
            <ul className="space-y-1 text-sm text-white/80">
              <li>
                <button 
                  onClick={() => navigate('/tools/ai-knowledge-navigator')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  AI Knowledge Navigator
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/tools/change-readiness-assessment')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Change Readiness Assessment
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/tools/linear-regression')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Interactive ML Tools
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/why-ai-now')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Why AI Now
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/agentic-ai')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Agentic AI Future
                </button>
              </li>
            </ul>
          </div>

          {/* Services & Resources */}
          <div>
            <h3 className="font-medium text-lg mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-chestnut" />
              Services & Resources
            </h3>
            <ul className="space-y-1 text-sm text-white/80">
              <li>
                <button 
                  onClick={() => navigate('/services')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Consulting Services
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/membership')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Premium Membership
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/guides/AIImplementationPlaybook')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Implementation Guides
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/blog')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Blog & Articles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/service-intake')}
                  className="hover:text-chestnut transition-colors text-left py-1 touch-manipulation min-h-[36px] w-full flex items-center"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3" />
                <a href="mailto:loren@evolviq.org" className="hover:text-chestnut transition-colors">
                  loren@evolviq.org
                </a>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-3" />
                <span>Schedule a Discovery Call</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3" />
                <span>San Antonio, TX</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm">
              © 2025 EvolvIQ. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-sm text-white/60 mt-4 md:mt-0">
              <button onClick={() => navigate('/privacy-policy')} className="hover:text-chestnut transition-colors py-2 touch-manipulation min-h-[44px] flex items-center justify-center sm:justify-start">Privacy Policy</button>
              <button onClick={() => navigate('/terms-of-service')} className="hover:text-chestnut transition-colors py-2 touch-manipulation min-h-[44px] flex items-center justify-center sm:justify-start">Terms of Service</button>
              <button onClick={() => navigate('/cookie-policy')} className="hover:text-chestnut transition-colors py-2 touch-manipulation min-h-[44px] flex items-center justify-center sm:justify-start">Cookie Policy</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;