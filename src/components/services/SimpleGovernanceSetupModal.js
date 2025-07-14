import React from 'react';
import { Shield, FileText, Users, CheckCircle, Calendar, X } from 'lucide-react';

const SimpleGovernanceSetupModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-bone max-w-6xl w-full max-h-[90vh] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-charcoal text-bone p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-pearl hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-12 h-12 text-chestnut" />
            <h1 className="text-4xl font-serif font-bold">Simple Governance Setup</h1>
          </div>
          <p className="text-xl text-pearl font-serif mb-2">
            Basic guidelines for responsible AI use
          </p>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 bg-white">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Establish AI Governance Framework
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">Policy Framework</h3>
                <p className="text-charcoal text-sm">Essential policies for safe AI implementation</p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-khaki rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">Oversight Structure</h3>
                <p className="text-charcoal text-sm">Clear roles and responsibilities for AI governance</p>
              </div>
              
              <div className="text-center p-4 rounded-lg border-2 border-pearl bg-bone">
                <div className="w-12 h-12 bg-chestnut rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-serif font-bold text-charcoal mb-2">Documentation</h3>
                <p className="text-charcoal text-sm">Templates and guidelines for ongoing compliance</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-bone">
            <h2 className="text-3xl font-serif font-bold text-charcoal text-center mb-8">
              Governance Components
            </h2>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-3">
              {[
                "AI use policy and acceptable use guidelines",
                "Data privacy and security protocols",
                "Risk assessment and mitigation procedures",
                "Vendor evaluation and selection criteria",
                "Training and awareness requirements",
                "Incident response and reporting procedures"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-white">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-chestnut flex-shrink-0" />
                  <span className="text-charcoal">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-charcoal text-white">
            <div className="text-center">
              <h2 className="text-3xl font-serif font-bold mb-4">
                Establish Responsible AI Foundation
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Setup Governance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGovernanceSetupModal;