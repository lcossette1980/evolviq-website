import React from 'react';
import { Monitor, Palette, Code, Smartphone, CheckCircle, Calendar, X } from 'lucide-react';

const WebsiteDesignDevelopmentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bone max-w-6xl w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-charcoal text-bone p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-pearl hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <Monitor className="w-12 h-12 text-chestnut" />
            <h1 className="text-4xl font-serif font-bold">Website Design & Development</h1>
          </div>
          <p className="text-xl text-pearl font-serif mb-2">
            Modern, responsive websites built with React and Tailwind CSS
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 bg-white">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Modern Web Solutions
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">React</h3>
                <p className="text-charcoal text-sm">Modern, component-based architecture</p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-khaki rounded-full flex items-center justify-center mx-auto mb-3">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">Tailwind CSS</h3>
                <p className="text-charcoal text-sm">Utility-first styling framework</p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">Responsive</h3>
                <p className="text-charcoal text-sm">Mobile-first design approach</p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-khaki rounded-full flex items-center justify-center mx-auto mb-3">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">Performance</h3>
                <p className="text-charcoal text-sm">Fast loading and optimized</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-bone">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              What's Included
            </h2>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-3">
              {[
                "Custom React component development",
                "Responsive Tailwind CSS styling",
                "Mobile-first design approach",
                "Performance optimization",
                "SEO-friendly structure",
                "Content management integration",
                "Analytics and tracking setup",
                "Cross-browser compatibility",
                "Hosting and deployment assistance",
                "Training and documentation"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-white">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-chestnut flex-shrink-0" />
                  <span className="text-charcoal">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Project Packages
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border-2 border-pearl bg-bone text-center">
                <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Starter</h3>
                <div className="text-2xl font-bold text-chestnut mb-2">$2.5K - $4K</div>
                <p className="text-charcoal text-sm">5-page website with essential features</p>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-chestnut bg-bone text-center">
                <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Professional</h3>
                <div className="text-2xl font-bold text-chestnut mb-2">$6K - $9K</div>
                <p className="text-charcoal text-sm">Full-featured business website</p>
              </div>
              
              <div className="p-4 rounded-lg border-2 border-pearl bg-bone text-center">
                <h3 className="text-xl font-serif font-bold text-charcoal mb-2">Enterprise</h3>
                <div className="text-2xl font-bold text-chestnut mb-2">$10K - $12K</div>
                <p className="text-charcoal text-sm">Complex web application</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-charcoal text-white">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold mb-4">
                Ready for a Modern Website?
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Start Your Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDesignDevelopmentModal;