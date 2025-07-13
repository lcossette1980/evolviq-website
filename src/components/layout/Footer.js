import React from 'react';
import { Linkedin, Twitter, Mail, Calendar, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
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
              Empowering organizations to align people, purpose, and intelligent systems for sustainable impact.
            </p>
            <div className="flex space-x-4">
              <button className="text-white/60 hover:text-chestnut transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
              <button className="text-white/60 hover:text-chestnut transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="text-white/60 hover:text-chestnut transition-colors">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-medium text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-chestnut transition-colors">AIMI Assessment</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Strategic Roadmapping</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Workforce Enablement</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Pilot Execution</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Scale & Sustain</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-chestnut transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">White Papers</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Tools & Templates</a></li>
              <li><a href="#" className="hover:text-chestnut transition-colors">Video Library</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3" />
                <a href="mailto:info@evolviq.org" className="hover:text-chestnut transition-colors">
                  info@evolviq.org
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
            <div className="flex space-x-6 text-sm text-white/60 mt-4 md:mt-0">
              <a href="#" className="hover:text-chestnut transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-chestnut transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-chestnut transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;