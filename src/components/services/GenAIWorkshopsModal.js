import React, { useState } from 'react';
import { Lightbulb, Users, Target, Clock, Brain, Shield, CheckCircle, Calendar, FileText, X } from 'lucide-react';

const GenAIWorkshopsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const workshopFormats = [
    {
      title: "Half-Day Intensive",
      duration: "4 hours",
      description: "Foundations and hands-on practice with GenAI tools",
      price: "$2K - $3K"
    },
    {
      title: "Full-Day Deep Dive",
      duration: "6-7 hours",
      description: "Comprehensive training with advanced applications",
      price: "$4K - $6K"
    },
    {
      title: "Two-Day Immersive",
      duration: "12-14 hours",
      description: "Complete GenAI mastery with custom use case development",
      price: "$6K - $8K"
    }
  ];

  const learningModules = [
    {
      title: "Generative AI Fundamentals",
      description: "Understanding LLMs, prompt engineering, and capabilities",
      icon: <Brain className="w-5 h-5" />
    },
    {
      title: "Hands-On Tool Mastery",
      description: "Practical experience with ChatGPT, Claude, Midjourney, and more",
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      title: "Business Applications",
      description: "Real-world use cases tailored to your industry and role",
      icon: <Target className="w-5 h-5" />
    },
    {
      title: "Responsible AI Practices",
      description: "Ethics, security, and governance for GenAI deployment",
      icon: <Shield className="w-5 h-5" />
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-bone max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-charcoal text-bone p-4 sm:p-6 relative">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-pearl hover:text-white transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 mr-12 sm:mr-16">
            <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 text-chestnut" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">Generative AI Workshops</h1>
          </div>
          <p className="text-lg sm:text-xl text-pearl font-serif mb-2">
            Focused GenAI training sessions, from half-day to full two-day immersive workshops
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          <div className="p-4 sm:p-6 bg-white">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-6 sm:mb-8">
              Workshop Formats
            </h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {workshopFormats.map((format, index) => (
                <div key={index} className="p-3 sm:p-4 rounded-lg border-2 border-pearl bg-bone text-center">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-charcoal mb-2">{format.title}</h3>
                  <div className="text-xl sm:text-2xl font-bold text-chestnut mb-2">{format.price}</div>
                  <div className="text-xs sm:text-sm text-khaki mb-3">{format.duration}</div>
                  <p className="text-charcoal text-xs sm:text-sm">{format.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-bone">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-6 sm:mb-8">
              Learning Modules
            </h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              {learningModules.map((module, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 bg-white rounded-lg border border-pearl">
                  <div className="p-2 bg-chestnut rounded-lg">
                    {React.cloneElement(module.icon, { className: "w-4 h-4 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-charcoal mb-1">{module.title}</h3>
                    <p className="text-xs sm:text-sm text-charcoal">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal text-center mb-6 sm:mb-8">
              What You'll Master
            </h2>
            
            <div className="max-w-4xl mx-auto grid sm:grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Advanced prompt engineering techniques",
                "Multi-modal AI applications (text, image, code)",
                "Custom GPT and AI assistant creation",
                "Workflow integration and automation",
                "Industry-specific GenAI use cases",
                "Security and compliance best practices"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-bone">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-chestnut flex-shrink-0" />
                  <span className="text-charcoal text-sm sm:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-charcoal text-white">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-3 sm:mb-4">
                Ready to Master Generative AI?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-pearl mb-4 sm:mb-6">
                Choose the workshop format that fits your team's needs and schedule.
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => window.location.href = '/service-intake'}
                  className="bg-chestnut text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center space-x-2 touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request This Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenAIWorkshopsModal;