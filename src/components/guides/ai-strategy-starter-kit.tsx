import React, { useState, useEffect } from 'react';
import { ChevronRight, Download, CheckCircle, BookOpen, Target, Users, Database, Settings, TrendingUp, AlertTriangle } from 'lucide-react';

// Color palette constants
const colors = {
  charcoal: '#2A2A2A',
  chestnut: '#A44A3F',
  khaki: '#A59E8C',
  pearl: '#D7CEB2',
  bone: '#F5F2EA'
};

// Main Navigation Component
const AIStrategyKit = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);

  const sections = [
    { id: 'overview', title: 'Strategy Overview', icon: Target, description: 'Define your AI vision and alignment' },
    { id: 'opportunities', title: 'AI Opportunities', icon: TrendingUp, description: 'Identify and prioritize AI use cases' },
    { id: 'team', title: 'Dream Team', icon: Users, description: 'Build your AI implementation team' },
    { id: 'data', title: 'Data Strategy', icon: Database, description: 'Establish your data foundation' },
    { id: 'implementation', title: 'Implementation', icon: Settings, description: 'Plan your AI deployment strategy' },
    { id: 'monitoring', title: 'Monitoring & Improvement', icon: CheckCircle, description: 'Track progress and optimize' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const completed = completedSections.length;
    const total = sections.length;
    setProgress((completed / total) * 100);
  }, [completedSections]);

  const markSectionComplete = (sectionId) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const SectionCard = ({ section, isActive, onClick }) => {
    const Icon = section.icon;
    const isCompleted = completedSections.includes(section.id);
    
    return (
      <div 
        className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-300`}
        onClick={onClick}
        style={{
          borderColor: isActive ? colors.chestnut : isCompleted ? colors.khaki : colors.pearl,
          backgroundColor: isActive ? colors.pearl : colors.bone
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="p-3 rounded-full"
              style={{ backgroundColor: isCompleted ? '#dcfce7' : '#f3f4f6' }}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <Icon className="w-6 h-6" style={{ color: colors.chestnut }} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
                {section.title}
              </h3>
              <p className="text-sm" style={{ color: colors.khaki }}>
                {section.description}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: colors.khaki }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
      {/* Header */}
      <header className="border-b-2" style={{ backgroundColor: colors.charcoal, borderColor: colors.pearl }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.bone, fontFamily: 'Playfair Display' }}>
                AI Strategy Starter Kit
              </h1>
              <p className="text-lg" style={{ color: colors.pearl }}>
                Complete toolkit for small businesses, nonprofits, and service organizations
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm mb-2" style={{ color: colors.pearl }}>Progress</div>
              <div className="w-32 h-3 rounded-full" style={{ backgroundColor: colors.khaki }}>
                <div 
                  className="h-full rounded-full transition-all duration-300" 
                  style={{ backgroundColor: colors.chestnut, width: `${progress}%` }}
                />
              </div>
              <div className="text-sm mt-1" style={{ color: colors.pearl }}>{Math.round(progress)}% Complete</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeSection === 'overview' && (
          <StrategyOverviewSection 
            onComplete={() => markSectionComplete('overview')}
            onNext={() => setActiveSection('opportunities')}
          />
        )}
        
        {activeSection === 'opportunities' && (
          <OpportunitiesSection 
            onComplete={() => markSectionComplete('opportunities')}
            onNext={() => setActiveSection('team')}
            onBack={() => setActiveSection('overview')}
          />
        )}
        
        {activeSection === 'team' && (
          <TeamSection 
            onComplete={() => markSectionComplete('team')}
            onNext={() => setActiveSection('data')}
            onBack={() => setActiveSection('opportunities')}
          />
        )}
        
        {activeSection === 'data' && (
          <DataStrategySection 
            onComplete={() => markSectionComplete('data')}
            onNext={() => setActiveSection('implementation')}
            onBack={() => setActiveSection('team')}
          />
        )}
        
        {activeSection === 'implementation' && (
          <ImplementationSection 
            onComplete={() => markSectionComplete('implementation')}
            onNext={() => setActiveSection('monitoring')}
            onBack={() => setActiveSection('data')}
          />
        )}
        
        {activeSection === 'monitoring' && (
          <MonitoringSection 
            onComplete={() => markSectionComplete('monitoring')}
            onBack={() => setActiveSection('implementation')}
          />
        )}

        {/* Navigation Grid - shown when on overview or after completing a section */}
        {(activeSection === 'overview' || completedSections.includes(activeSection)) && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
              Your AI Strategy Journey
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  isActive={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Strategy Overview Section Component
const StrategyOverviewSection = ({ onComplete, onNext }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    mission: '',
    vision: '',
    currentGoals: '',
    aiAlignment: '',
    strategicGoals: ['', '', '', '', ''],
    achievementPlan: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.strategicGoals];
    newGoals[index] = value;
    setFormData(prev => ({ ...prev, strategicGoals: newGoals }));
  };

  const isFormComplete = () => {
    return formData.organizationName && formData.mission && formData.aiAlignment && 
           formData.strategicGoals.filter(goal => goal.trim()).length >= 3;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-lg" style={{ backgroundColor: colors.pearl }}>
        <div className="w-full h-64 rounded-lg mb-6 flex items-center justify-center" style={{ backgroundColor: colors.khaki }}>
          <BookOpen className="w-16 h-16" style={{ color: colors.bone }} />
          <span className="ml-4 text-lg" style={{ color: colors.bone }}>AI Strategy Foundation Image Placeholder</span>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Define Your AI Strategy Foundation
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.charcoal }}>
          Start by aligning AI with your organization's mission, vision, and goals. This foundation will guide all future AI decisions.
        </p>
      </div>

      {/* How to Use This Strategy Kit */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          How to Build Your AI Strategy
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 rounded-lg" style={{ backgroundColor: colors.bone }}>
            <h4 className="font-bold mb-3" style={{ color: colors.charcoal }}>📋 Your Strategy Journey</h4>
            <p className="text-sm mb-4" style={{ color: colors.khaki }}>
              This toolkit guides you through 6 essential steps to create a comprehensive AI strategy:
            </p>
            <ul className="text-sm space-y-2" style={{ color: colors.khaki }}>
              <li>• <strong>Strategy Overview:</strong> Define your foundation and goals</li>
              <li>• <strong>AI Opportunities:</strong> Identify high-impact use cases</li>
              <li>• <strong>Dream Team:</strong> Plan your implementation team</li>
              <li>• <strong>Data Strategy:</strong> Build your data foundation</li>
              <li>• <strong>Implementation:</strong> Create your deployment plan</li>
              <li>• <strong>Monitoring:</strong> Track success and improvement</li>
            </ul>
          </div>
          
          <div className="p-6 rounded-lg" style={{ backgroundColor: colors.pearl }}>
            <h4 className="font-bold mb-3" style={{ color: colors.charcoal }}>⏱️ Time & Progress</h4>
            <div className="text-sm space-y-2" style={{ color: colors.charcoal }}>
              <p>• <strong>Total time:</strong> 2-3 hours (can be split across sessions)</p>
              <p>• <strong>Progress tracking:</strong> Complete sections at your own pace</p>
              <p>• <strong>Auto-save:</strong> Your work is automatically saved</p>
              <p>• <strong>Flexible:</strong> Jump between sections as needed</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 rounded-lg" style={{ backgroundColor: colors.chestnut, color: colors.bone }}>
          <h4 className="font-bold mb-3">🎯 Success Tips</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2">• <strong>Start with clarity:</strong> Be specific about your mission and goals</p>
              <p className="mb-2">• <strong>Think strategically:</strong> Focus on long-term vision, not just quick wins</p>
              <p>• <strong>Be realistic:</strong> Consider your resources and timeline</p>
            </div>
            <div>
              <p className="mb-2">• <strong>Involve stakeholders:</strong> Get input from key team members</p>
              <p className="mb-2">• <strong>Plan for change:</strong> AI strategy should evolve with your organization</p>
              <p>• <strong>Start small:</strong> Identify pilot projects for initial implementation</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.khaki + '20', border: `1px solid ${colors.khaki}` }}>
          <h4 className="font-bold mb-2" style={{ color: colors.charcoal }}>💡 Before You Begin</h4>
          <p className="text-sm" style={{ color: colors.charcoal }}>
            <strong>Preparation:</strong> Gather information about your current processes, technology stack, and team capabilities. 
            Having recent performance data, budget constraints, and stakeholder expectations will help you create a more accurate strategy.
          </p>
        </div>
      </div>

      {/* Organization Information */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Organization Information
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Enter your organization name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Organization Type
            </label>
            <select
              value={formData.organizationType}
              onChange={(e) => handleInputChange('organizationType', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
            >
              <option value="">Select type...</option>
              <option value="small-business">Small Business</option>
              <option value="nonprofit">Nonprofit Organization</option>
              <option value="service-organization">Service Organization</option>
              <option value="startup">Startup</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Mission Statement *
            </label>
            <textarea
              value={formData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What is your organization's mission?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Vision Statement
            </label>
            <textarea
              value={formData.vision}
              onChange={(e) => handleInputChange('vision', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What is your organization's vision for the future?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Current Strategic Goals
            </label>
            <textarea
              value={formData.currentGoals}
              onChange={(e) => handleInputChange('currentGoals', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What are your current strategic objectives?"
            />
          </div>
        </div>
      </div>

      {/* AI Alignment */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          AI Strategy Alignment
        </h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
            How would an AI strategy align to your organization's overarching mission, vision, and goals? *
          </label>
          <textarea
            value={formData.aiAlignment}
            onChange={(e) => handleInputChange('aiAlignment', e.target.value)}
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
            style={{ borderColor: colors.khaki }}
            placeholder="Describe how AI can support and enhance your organization's mission and strategic objectives..."
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
            Strategic AI Goals (List 4-5 goals for how AI can improve operations, drive innovation, and maintain competitive advantage) *
          </h4>
          
          {formData.strategicGoals.map((goal, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.chestnut }}
              >
                {index + 1}
              </span>
              <textarea
                value={goal}
                onChange={(e) => handleGoalChange(index, e.target.value)}
                rows={2}
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: colors.khaki }}
                placeholder={`Strategic AI Goal ${index + 1}...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Plan */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Achievement Strategy
        </h3>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
            How do you think your organization can achieve these goals?
          </label>
          <textarea
            value={formData.achievementPlan}
            onChange={(e) => handleInputChange('achievementPlan', e.target.value)}
            rows={6}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
            style={{ borderColor: colors.khaki }}
            placeholder="Outline your approach to building talent, capabilities, data strategy, and implementation plans..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-2">
          {isFormComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5" style={{ color: colors.chestnut }} />
          )}
          <span className="text-sm" style={{ color: colors.charcoal }}>
            {isFormComplete() ? 'Section Complete' : 'Complete required fields to continue'}
          </span>
        </div>
        
        <div className="space-x-4">
          <button
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download Template
          </button>
          
          <button
            onClick={() => {
              if (isFormComplete()) {
                onComplete();
                onNext();
              }
            }}
            disabled={!isFormComplete()}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isFormComplete() ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: colors.chestnut }}
          >
            Continue to Opportunities
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// AI Opportunities Section Component
const OpportunitiesSection = ({ onComplete, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    businessProcesses: '',
    painPoints: '',
    customerJourney: '',
    customerNeeds: '',
    dataAvailability: '',
    dataQuality: '',
    dataPrivacy: '',
    competitorAnalysis: '',
    industryTrends: '',
    newMarkets: '',
    useCases: ['', '', '', '', ''],
    priorityRankings: {}
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUseCaseChange = (index, value) => {
    const newUseCases = [...formData.useCases];
    newUseCases[index] = value;
    setFormData(prev => ({ ...prev, useCases: newUseCases }));
  };

  const handlePriorityChange = (index, priority) => {
    setFormData(prev => ({
      ...prev,
      priorityRankings: { ...prev.priorityRankings, [index]: priority }
    }));
  };

  const isFormComplete = () => {
    const filledUseCases = formData.useCases.filter(useCase => useCase.trim()).length;
    return formData.businessProcesses && formData.customerNeeds && 
           formData.dataAvailability && filledUseCases >= 3;
  };

  const aiUseCaseExamples = [
    'Automating customer service with chatbots',
    'Predictive analytics for inventory management',
    'Personalized marketing campaigns',
    'Fraud detection and prevention',
    'Process optimization and automation',
    'Sentiment analysis of customer feedback',
    'Intelligent document processing',
    'Predictive maintenance',
    'Dynamic pricing optimization',
    'Content generation and curation'
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-lg" style={{ backgroundColor: colors.pearl }}>
        <div className="w-full h-64 rounded-lg mb-6 flex items-center justify-center" style={{ backgroundColor: colors.khaki }}>
          <TrendingUp className="w-16 h-16" style={{ color: colors.bone }} />
          <span className="ml-4 text-lg" style={{ color: colors.bone }}>AI Opportunities Discovery Image Placeholder</span>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Identify Your AI Opportunities
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.charcoal }}>
          Discover where AI can transform your business processes, enhance customer experiences, and drive competitive advantage.
        </p>
      </div>

      {/* Business Process Assessment */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Business Process Assessment
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Current Business Processes *
            </label>
            <textarea
              value={formData.businessProcesses}
              onChange={(e) => handleInputChange('businessProcesses', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Describe your key business processes, workflows, and operations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Pain Points & Inefficiencies
            </label>
            <textarea
              value={formData.painPoints}
              onChange={(e) => handleInputChange('painPoints', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What are your biggest operational challenges, bottlenecks, and time-consuming tasks?"
            />
          </div>
        </div>
      </div>

      {/* Customer Experience Analysis */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Customer Experience Analysis
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Customer Journey Mapping
            </label>
            <textarea
              value={formData.customerJourney}
              onChange={(e) => handleInputChange('customerJourney', e.target.value)}
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Map out your typical customer journey from awareness to post-purchase..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Customer Needs & Pain Points *
            </label>
            <textarea
              value={formData.customerNeeds}
              onChange={(e) => handleInputChange('customerNeeds', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What challenges do your customers face? Where can personalization and automation improve their experience?"
            />
          </div>
        </div>
      </div>

      {/* Data Assessment */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Data Availability Assessment
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Current Data Sources & Availability *
            </label>
            <textarea
              value={formData.dataAvailability}
              onChange={(e) => handleInputChange('dataAvailability', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What data do you currently collect? Customer data, transaction records, operational metrics, etc."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Data Quality Assessment
              </label>
              <textarea
                value={formData.dataQuality}
                onChange={(e) => handleInputChange('dataQuality', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: colors.khaki }}
                placeholder="How clean, complete, and accurate is your data?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Data Privacy Considerations
              </label>
              <textarea
                value={formData.dataPrivacy}
                onChange={(e) => handleInputChange('dataPrivacy', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: colors.khaki }}
                placeholder="What privacy regulations and data security requirements apply?"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Use Cases Identification */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          AI Use Cases & Prioritization
        </h3>
        
        {/* Example Use Cases */}
        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: colors.bone }}>
          <h4 className="text-lg font-semibold mb-3" style={{ color: colors.charcoal }}>
            Common AI Use Cases for Small Businesses:
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {aiUseCaseExamples.map((example, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.chestnut }}></div>
                <span className="text-sm" style={{ color: colors.charcoal }}>{example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
            Your Identified AI Use Cases *
          </h4>
          
          {formData.useCases.map((useCase, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start space-x-3">
                <span 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors.chestnut }}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    value={useCase}
                    onChange={(e) => handleUseCaseChange(index, e.target.value)}
                    rows={2}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                    style={{ borderColor: colors.khaki }}
                    placeholder={`AI Use Case ${index + 1}...`}
                  />
                  
                  {useCase.trim() && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.charcoal }}>
                        Priority Level:
                      </label>
                      <div className="flex space-x-2">
                        {['High', 'Medium', 'Low'].map((priority) => (
                          <label key={priority} className="flex items-center space-x-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`priority-${index}`}
                              value={priority}
                              checked={formData.priorityRankings[index] === priority}
                              onChange={(e) => handlePriorityChange(index, e.target.value)}
                              className="text-sm"
                            />
                            <span className="text-sm" style={{ color: colors.charcoal }}>{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-2">
          {isFormComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5" style={{ color: colors.chestnut }} />
          )}
          <span className="text-sm" style={{ color: colors.charcoal }}>
            {isFormComplete() ? 'Section Complete' : 'Complete required fields to continue'}
          </span>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            Back to Strategy
          </button>
          
          <button
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download Analysis
          </button>
          
          <button
            onClick={() => {
              if (isFormComplete()) {
                onComplete();
                onNext();
              }
            }}
            disabled={!isFormComplete()}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isFormComplete() ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: colors.chestnut }}
          >
            Build Your Team
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// AI Dream Team Section Component
const TeamSection = ({ onComplete, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    currentTeam: '',
    skillGaps: '',
    internalTalent: '',
    hiringPlan: '',
    externalPartners: '',
    trainingNeeds: '',
    budget: '',
    timeline: '',
    roles: {
      strategist: { needed: false, approach: '', timeline: '' },
      dataScientist: { needed: false, approach: '', timeline: '' },
      mlEngineer: { needed: false, approach: '', timeline: '' },
      developer: { needed: false, approach: '', timeline: '' },
      domainExpert: { needed: false, approach: '', timeline: '' }
    },
    collaboration: '',
    changeManagement: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleKey) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleKey]: {
          ...prev.roles[roleKey],
          needed: !prev.roles[roleKey].needed
        }
      }
    }));
  };

  const handleRoleDetailChange = (roleKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleKey]: {
          ...prev.roles[roleKey],
          [field]: value
        }
      }
    }));
  };

  const isFormComplete = () => {
    const hasSelectedRoles = Object.values(formData.roles).some(role => role.needed);
    return formData.currentTeam && formData.skillGaps && hasSelectedRoles;
  };

  const keyRoles = [
    {
      key: 'strategist',
      title: 'AI Strategist/Project Manager',
      description: 'Defines AI strategy, identifies use cases, and oversees project implementation. Bridges business objectives and technical execution.',
      skills: ['Strategic thinking', 'Project management', 'Business analysis', 'Stakeholder communication']
    },
    {
      key: 'dataScientist',
      title: 'Data Scientist',
      description: 'Extracts insights from data, builds machine learning models, and drives AI-driven decision-making.',
      skills: ['Statistics', 'Programming (Python/R)', 'Data manipulation', 'Machine learning']
    },
    {
      key: 'mlEngineer',
      title: 'Machine Learning Engineer',
      description: 'Designs, implements, and optimizes machine learning algorithms and systems.',
      skills: ['Data modeling', 'Feature engineering', 'Algorithm selection', 'System optimization']
    },
    {
      key: 'developer',
      title: 'AI Software Developer',
      description: 'Translates AI models into production-ready software solutions.',
      skills: ['Programming', 'AI frameworks', 'Software architecture', 'System integration']
    },
    {
      key: 'domainExpert',
      title: 'Domain Expert',
      description: 'Brings industry-specific knowledge and ensures AI solutions align with business needs.',
      skills: ['Industry expertise', 'Business processes', 'Regulatory knowledge', 'User needs']
    }
  ];

  const approachOptions = [
    'Hire full-time employee',
    'Hire contractor/consultant',
    'Train existing employee',
    'Partner with external provider',
    'Outsource completely'
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-lg" style={{ backgroundColor: colors.pearl }}>
        <div className="w-full h-64 rounded-lg mb-6 flex items-center justify-center" style={{ backgroundColor: colors.khaki }}>
          <Users className="w-16 h-16" style={{ color: colors.bone }} />
          <span className="ml-4 text-lg" style={{ color: colors.bone }}>AI Dream Team Building Image Placeholder</span>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Build Your AI Dream Team
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.charcoal }}>
          Assemble the right talent and expertise to drive your AI initiatives forward successfully.
        </p>
      </div>

      {/* Current Team Assessment */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Current Team Assessment
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Current Team & Skills Inventory *
            </label>
            <textarea
              value={formData.currentTeam}
              onChange={(e) => handleInputChange('currentTeam', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Describe your current team members, their skills, and any existing technical capabilities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Skill Gaps Analysis *
            </label>
            <textarea
              value={formData.skillGaps}
              onChange={(e) => handleInputChange('skillGaps', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What skills and expertise are missing from your current team? What are your biggest knowledge gaps?"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Internal Talent Potential
              </label>
              <textarea
                value={formData.internalTalent}
                onChange={(e) => handleInputChange('internalTalent', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: colors.khaki }}
                placeholder="Which team members show potential for AI training and upskilling?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Budget Considerations
              </label>
              <textarea
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: colors.khaki }}
                placeholder="What budget constraints should be considered for team building?"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Roles Selection */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Key Roles for Your AI Team
        </h3>
        <p className="mb-6" style={{ color: colors.khaki }}>
          Select the roles you need and define your approach for each:
        </p>
        
        <div className="space-y-6">
          {keyRoles.map((role) => (
            <div key={role.key} className="p-6 rounded-lg border-2 transition-all" style={{
              borderColor: formData.roles[role.key].needed ? colors.chestnut : colors.khaki,
              backgroundColor: formData.roles[role.key].needed ? colors.pearl : colors.bone
            }}>
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={formData.roles[role.key].needed}
                  onChange={() => handleRoleToggle(role.key)}
                  className="mt-1 h-5 w-5"
                  style={{ accentColor: colors.chestnut }}
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2" style={{ color: colors.charcoal }}>
                    {role.title}
                  </h4>
                  <p className="text-sm mb-3" style={{ color: colors.charcoal }}>
                    {role.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium" style={{ color: colors.charcoal }}>Key Skills: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {role.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: colors.khaki, color: colors.bone }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {formData.roles[role.key].needed && (
                    <div className="space-y-4 mt-4 pt-4 border-t" style={{ borderColor: colors.khaki }}>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                          Acquisition Approach
                        </label>
                        <select
                          value={formData.roles[role.key].approach}
                          onChange={(e) => handleRoleDetailChange(role.key, 'approach', e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-offset-2"
                          style={{ borderColor: colors.khaki }}
                        >
                          <option value="">Select approach...</option>
                          {approachOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                          Timeline
                        </label>
                        <input
                          type="text"
                          value={formData.roles[role.key].timeline}
                          onChange={(e) => handleRoleDetailChange(role.key, 'timeline', e.target.value)}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-offset-2"
                          style={{ borderColor: colors.khaki }}
                          placeholder="When do you need this role filled?"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-2">
          {isFormComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5" style={{ color: colors.chestnut }} />
          )}
          <span className="text-sm" style={{ color: colors.charcoal }}>
            {isFormComplete() ? 'Section Complete' : 'Select required roles and complete assessment'}
          </span>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            Back to Opportunities
          </button>
          
          <button
            onClick={() => {
              if (isFormComplete()) {
                onComplete();
                onNext();
              }
            }}
            disabled={!isFormComplete()}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isFormComplete() ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: colors.chestnut }}
          >
            Plan Data Strategy
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Data Strategy Section Component
const DataStrategySection = ({ onComplete, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    dataSources: '',
    dataQuality: '',
    dataGovernance: '',
    dataStorage: '',
    privacyCompliance: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = () => {
    return formData.dataSources && formData.dataQuality && formData.dataGovernance && 
           formData.dataStorage && formData.privacyCompliance;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-lg" style={{ backgroundColor: colors.pearl }}>
        <div className="w-full h-64 rounded-lg mb-6 flex items-center justify-center" style={{ backgroundColor: colors.khaki }}>
          <Database className="w-16 h-16" style={{ color: colors.bone }} />
          <span className="ml-4 text-lg" style={{ color: colors.bone }}>Data Strategy Foundation Image Placeholder</span>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Establish Your Data Foundation
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.charcoal }}>
          Data is the fuel that powers AI. Build a solid data strategy to ensure successful AI implementation.
        </p>
      </div>

      {/* Data Assessment */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Data Assessment
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Current Data Sources *
            </label>
            <textarea
              value={formData.dataSources}
              onChange={(e) => handleInputChange('dataSources', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="List all your current data sources..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Data Quality Assessment *
            </label>
            <textarea
              value={formData.dataQuality}
              onChange={(e) => handleInputChange('dataQuality', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Evaluate completeness, accuracy, consistency..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Data Governance Framework *
            </label>
            <textarea
              value={formData.dataGovernance}
              onChange={(e) => handleInputChange('dataGovernance', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Define data ownership, access controls..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Data Storage Solutions *
            </label>
            <textarea
              value={formData.dataStorage}
              onChange={(e) => handleInputChange('dataStorage', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What storage solutions will you use?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Privacy & Compliance Requirements *
            </label>
            <textarea
              value={formData.privacyCompliance}
              onChange={(e) => handleInputChange('privacyCompliance', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What regulations apply (GDPR, CCPA, etc.)?"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-2">
          {isFormComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5" style={{ color: colors.chestnut }} />
          )}
          <span className="text-sm" style={{ color: colors.charcoal }}>
            {isFormComplete() ? 'Section Complete' : 'Complete required fields to continue'}
          </span>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            Back to Team
          </button>
          
          <button
            onClick={() => {
              if (isFormComplete()) {
                onComplete();
                onNext();
              }
            }}
            disabled={!isFormComplete()}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isFormComplete() ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: colors.chestnut }}
          >
            Plan Implementation
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Implementation Section Component
const ImplementationSection = ({ onComplete, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    objectives: '',
    scalingStrategy: '',
    pilotProjects: [
      { useCase: '', timeline: '', metrics: '' }
    ]
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePilotChange = (index, field, value) => {
    const newPilots = [...formData.pilotProjects];
    newPilots[index] = { ...newPilots[index], [field]: value };
    setFormData(prev => ({ ...prev, pilotProjects: newPilots }));
  };

  const isFormComplete = () => {
    const hasValidPilot = formData.pilotProjects.some(pilot => 
      pilot.useCase && pilot.timeline && pilot.metrics
    );
    return formData.objectives && hasValidPilot && formData.scalingStrategy;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-lg" style={{ backgroundColor: colors.pearl }}>
        <div className="w-full h-64 rounded-lg mb-6 flex items-center justify-center" style={{ backgroundColor: colors.khaki }}>
          <Settings className="w-16 h-16" style={{ color: colors.bone }} />
          <span className="ml-4 text-lg" style={{ color: colors.bone }}>AI Implementation Strategy Image Placeholder</span>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          AI Implementation Strategy
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.charcoal }}>
          Transform your AI vision into reality with a structured, phased approach to implementation.
        </p>
      </div>

      {/* Implementation Form */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Implementation Planning
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Implementation Objectives *
            </label>
            <textarea
              value={formData.objectives}
              onChange={(e) => handleInputChange('objectives', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="What do you want to achieve through AI implementation?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Pilot Project Details *
            </label>
            <div className="space-y-4">
              <textarea
                value={formData.pilotProjects[0].useCase}
                onChange={(e) => handlePilotChange(0, 'useCase', e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{ borderColor: colors.khaki }}
                placeholder="Describe your first pilot project use case..."
              />
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.pilotProjects[0].timeline}
                  onChange={(e) => handlePilotChange(0, 'timeline', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                  style={{ borderColor: colors.khaki }}
                  placeholder="Timeline (e.g., 3-6 months)"
                />
                <input
                  type="text"
                  value={formData.pilotProjects[0].metrics}
                  onChange={(e) => handlePilotChange(0, 'metrics', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
                  style={{ borderColor: colors.khaki }}
                  placeholder="Success metrics"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Scaling Strategy *
            </label>
            <textarea
              value={formData.scalingStrategy}
              onChange={(e) => handleInputChange('scalingStrategy', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="How will you scale successful pilots?"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-2">
          {isFormComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5" style={{ color: colors.chestnut }} />
          )}
          <span className="text-sm" style={{ color: colors.charcoal }}>
            {isFormComplete() ? 'Section Complete' : 'Complete required fields to continue'}
          </span>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            Back to Data Strategy
          </button>
          
          <button
            onClick={() => {
              if (isFormComplete()) {
                onComplete();
                onNext();
              }
            }}
            disabled={!isFormComplete()}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isFormComplete() ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: colors.chestnut }}
          >
            Setup Monitoring
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Monitoring Section Component
const MonitoringSection = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    monitoringPlan: '',
    evaluationFramework: '',
    continuousImprovement: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormComplete = () => {
    return formData.monitoringPlan && formData.evaluationFramework && 
           formData.continuousImprovement;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-lg" style={{ backgroundColor: colors.pearl }}>
        <div className="w-full h-64 rounded-lg mb-6 flex items-center justify-center" style={{ backgroundColor: colors.khaki }}>
          <CheckCircle className="w-16 h-16" style={{ color: colors.bone }} />
          <span className="ml-4 text-lg" style={{ color: colors.bone }}>AI Monitoring & Improvement Image Placeholder</span>
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Monitoring & Continuous Improvement
        </h2>
        <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.charcoal }}>
          Establish robust monitoring and evaluation systems to ensure your AI initiatives deliver lasting value.
        </p>
      </div>

      {/* Monitoring Form */}
      <div className="bg-white p-8 rounded-lg shadow-lg border" style={{ borderColor: colors.pearl }}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Monitoring & Evaluation Framework
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Monitoring Implementation Plan *
            </label>
            <textarea
              value={formData.monitoringPlan}
              onChange={(e) => handleInputChange('monitoringPlan', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="How will you implement real-time monitoring? What tools and systems will you use?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Performance Evaluation Framework *
            </label>
            <textarea
              value={formData.evaluationFramework}
              onChange={(e) => handleInputChange('evaluationFramework', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="Develop frameworks that encompass quantitative and qualitative measures..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Continuous Improvement Strategy *
            </label>
            <textarea
              value={formData.continuousImprovement}
              onChange={(e) => handleInputChange('continuousImprovement', e.target.value)}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-2"
              style={{ borderColor: colors.khaki }}
              placeholder="How will you keep AI initiatives aligned with changing business needs?"
            />
          </div>
        </div>
      </div>

      {/* Completion Section */}
      <div className="bg-gradient-to-r p-8 rounded-lg text-center" style={{ 
        background: `linear-gradient(135deg, ${colors.chestnut}, ${colors.khaki})` 
      }}>
        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.bone }} />
        <h3 className="text-2xl font-bold mb-4" style={{ color: colors.bone, fontFamily: 'Playfair Display' }}>
          Congratulations! 🎉
        </h3>
        <p className="text-lg mb-6" style={{ color: colors.bone }}>
          You've completed your comprehensive AI Strategy Starter Kit. You now have a complete roadmap for implementing AI in your organization.
        </p>
        <div className="space-y-2 text-sm" style={{ color: colors.bone }}>
          <p>✓ Strategy Foundation Defined</p>
          <p>✓ AI Opportunities Identified</p>
          <p>✓ Dream Team Planned</p>
          <p>✓ Data Strategy Established</p>
          <p>✓ Implementation Roadmap Created</p>
          <p>✓ Monitoring Framework Designed</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8">
        <div className="flex items-center space-x-2">
          {isFormComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5" style={{ color: colors.chestnut }} />
          )}
          <span className="text-sm" style={{ color: colors.charcoal }}>
            {isFormComplete() ? 'All Sections Complete!' : 'Complete required fields to finish'}
          </span>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            Back to Implementation
          </button>
          
          <button
            className="px-6 py-3 border rounded-lg font-medium"
            style={{ borderColor: colors.khaki, color: colors.khaki }}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download Complete Strategy
          </button>
          
          <button
            onClick={() => {
              if (isFormComplete()) {
                onComplete();
                // Could trigger a completion celebration or redirect
              }
            }}
            disabled={!isFormComplete()}
            className={`px-6 py-3 rounded-lg font-medium text-white ${
              isFormComplete() ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: colors.chestnut }}
          >
            Complete AI Strategy Kit
            <CheckCircle className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIStrategyKit;
        