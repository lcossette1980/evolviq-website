import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, CheckCircle, AlertTriangle, Users, Target, Shield, BookOpen, Download, Save } from 'lucide-react';

const AIReadinessAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Organizational Readiness Plan
    useCase1: '',
    useCase2: '',
    challenges: {
      nonDataRoles: '',
      overwhelmed: '',
      fearOfChange: '',
      other: ''
    },
    training: {
      skillsNeeded: '',
      timeline: '',
      plan: ''
    },
    communication: {
      projectUpdates: '',
      employeeEngagement: '',
      teamPresentations: ''
    },
    longTermSuccess: {
      monitoring: '',
      feedback: '',
      continuousImprovement: ''
    },
    
    // AI Challenges
    ethicalChallenges: {
      risk: 'high',
      prevention: ''
    },
    socialChallenges: {
      risk: 'medium',
      prevention: ''
    },
    technicalChallenges: {
      risk: 'medium',
      prevention: ''
    },
    otherChallenges: {
      risk: 'low',
      prevention: ''
    },
    
    // Upskilling
    technologies: [
      { name: 'Machine Learning', skills: '', experts: '' },
      { name: 'Predictive Analytics', skills: '', experts: '' },
      { name: 'Sentiment Analysis', skills: '', experts: '' },
      { name: 'Research and Development', skills: '', experts: '' }
    ],
    currentSkills: '',
    roadblocks: '',
    
    // Ethics
    biasAndFairness: '',
    transparency: '',
    ethicsCommunication: '',
    dataPrivacy: ''
  });

  const [expandedSections, setExpandedSections] = useState({});

  const steps = [
    { 
      id: 'readiness', 
      title: 'Organizational Readiness Plan', 
      icon: Target,
      description: 'Define scope, challenges, and implementation strategy'
    },
    { 
      id: 'challenges', 
      title: 'AI Challenges Assessment', 
      icon: AlertTriangle,
      description: 'Identify and mitigate potential risks and obstacles'
    },
    { 
      id: 'upskilling', 
      title: 'Upskilling Strategy', 
      icon: Users,
      description: 'Plan workforce development and skill requirements'
    },
    { 
      id: 'ethics', 
      title: 'AI Ethics Framework', 
      icon: Shield,
      description: 'Establish responsible AI practices and guidelines'
    },
    { 
      id: 'summary', 
      title: 'Assessment Summary', 
      icon: BookOpen,
      description: 'Review your complete AI readiness plan'
    }
  ];

  // Scroll to top when component mounts or step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateFormData = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  // Helper function for smooth step navigation
  const navigateToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Helper component for textarea inputs to handle keyboard events properly
  const TextareaField = ({ value, onChange, placeholder, rows = 4, className = "" }) => {
    const handleKeyDown = (e) => {
      // Prevent spacebar from scrolling the page when focused on textarea
      if (e.key === ' ') {
        e.stopPropagation();
      }
      // Prevent arrow keys from interfering with step navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.stopPropagation();
      }
    };

    const handleFocus = (e) => {
      // Ensure the textarea is visible and prevent scroll jumping
      e.target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'nearest' 
      });
    };

    return (
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={`w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F] transition-all duration-200 ${className}`}
        rows={rows}
      />
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const RiskSelector = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#2A2A2A] mb-2">{label}</label>
      <div className="flex gap-4">
        {['high', 'medium', 'low'].map(risk => (
          <label key={risk} className="flex items-center cursor-pointer">
            <input
              type="radio"
              value={risk}
              checked={value === risk}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2 text-[#A44A3F]"
            />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              risk === 'high' ? 'bg-red-100 text-red-800' :
              risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center ${
              isActive ? 'text-[#A44A3F]' : isCompleted ? 'text-[#A59E8C]' : 'text-[#A59E8C]'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                isActive ? 'bg-[#A44A3F] border-[#A44A3F] text-[#F5F2EA]' :
                isCompleted ? 'bg-[#A59E8C] border-[#A59E8C] text-[#F5F2EA]' :
                'border-[#D7CEB2] text-[#A59E8C] bg-[#F5F2EA]'
              }`}>
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span className="text-xs font-medium text-center max-w-20">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                index < currentStep ? 'bg-[#A59E8C]' : 'bg-[#D7CEB2]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const ReadinessStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
          Organizational Readiness Plan
        </h2>
        <p className="text-[#A59E8C] max-w-2xl mx-auto">
          Define your AI scope, identify challenges, and create a comprehensive implementation strategy for your organization.
        </p>
      </div>

      {/* Hero Image Placeholder */}
      <div className="bg-[#D7CEB2] rounded-lg p-8 text-center border-2 border-dashed border-[#A59E8C]">
        <Target size={48} className="mx-auto text-[#2A2A2A] mb-4" />
        <p className="text-[#2A2A2A] font-medium">Strategic Planning Visualization</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Define Scope */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            1. Define Scope
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Primary AI Use Case
              </label>
              <TextareaField
                value={formData.useCase1}
                onChange={(e) => updateFormData('useCase1', e.target.value)}
                placeholder="e.g., Predictive Analytics for Workforce Optimization - Using AI to analyze employee performance, engagement, and retention data..."
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Secondary AI Use Case (Optional)
              </label>
              <TextareaField
                value={formData.useCase2}
                onChange={(e) => updateFormData('useCase2', e.target.value)}
                placeholder="e.g., AI-Driven Customer Insights - Leveraging AI to analyze customer interactions, feedback, and transaction data..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            2. Identify Challenges
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Resistance from Non-Data Roles
              </label>
              <TextareaField
                value={formData.challenges.nonDataRoles}
                onChange={(e) => updateFormData('challenges.nonDataRoles', e.target.value)}
                placeholder="How might employees without 'data' in their job title react to AI initiatives?"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Overwhelm from Other Projects
              </label>
              <TextareaField
                value={formData.challenges.overwhelmed}
                onChange={(e) => updateFormData('challenges.overwhelmed', e.target.value)}
                placeholder="How will you address team capacity and competing priorities?"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Fear of Change
              </label>
              <TextareaField
                value={formData.challenges.fearOfChange}
                onChange={(e) => updateFormData('challenges.fearOfChange', e.target.value)}
                placeholder="What concerns might employees have about AI impacting their roles?"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Training Plan */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            3. Training Strategy
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Skills Employees Need
              </label>
              <textarea
                value={formData.training.skillsNeeded}
                onChange={(e) => updateFormData('training.skillsNeeded', e.target.value)}
                placeholder="List the fundamental skills needed for AI adoption in your organization..."
                className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Training Timeline
              </label>
              <input
                type="text"
                value={formData.training.timeline}
                onChange={(e) => updateFormData('training.timeline', e.target.value)}
                placeholder="e.g., 6-month phased approach starting Q2 2025"
                className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              />
            </div>
          </div>
        </div>

        {/* Communication Plan */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            4. Communication Strategy
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Project Updates Method
              </label>
              <input
                type="text"
                value={formData.communication.projectUpdates}
                onChange={(e) => updateFormData('communication.projectUpdates', e.target.value)}
                placeholder="e.g., Monthly all-hands meetings, quarterly newsletters"
                className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                Employee Engagement Approach
              </label>
              <input
                type="text"
                value={formData.communication.employeeEngagement}
                onChange={(e) => updateFormData('communication.employeeEngagement', e.target.value)}
                placeholder="e.g., Lunch-and-learn sessions, success story sharing"
                className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Long-term Success */}
      <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
        <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
          5. Long-term Success Framework
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Monitoring Approach
            </label>
            <textarea
              value={formData.longTermSuccess.monitoring}
              onChange={(e) => updateFormData('longTermSuccess.monitoring', e.target.value)}
              placeholder="How will you track progress and measure success?"
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Feedback Collection
            </label>
            <textarea
              value={formData.longTermSuccess.feedback}
              onChange={(e) => updateFormData('longTermSuccess.feedback', e.target.value)}
              placeholder="How will you gather employee and stakeholder feedback?"
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Continuous Improvement
            </label>
            <textarea
              value={formData.longTermSuccess.continuousImprovement}
              onChange={(e) => updateFormData('longTermSuccess.continuousImprovement', e.target.value)}
              placeholder="How will you iterate and improve your AI strategy?"
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const ChallengesStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
          AI Challenges Assessment
        </h2>
        <p className="text-[#A59E8C] max-w-2xl mx-auto">
          Identify potential obstacles and develop mitigation strategies for successful AI implementation.
        </p>
      </div>

      {/* Challenges Overview Image */}
      <div className="bg-[#D7CEB2] rounded-lg p-8 text-center border-2 border-dashed border-[#A59E8C]">
        <AlertTriangle size={48} className="mx-auto text-[#2A2A2A] mb-4" />
        <p className="text-[#2A2A2A] font-medium">Risk Assessment Matrix Visualization</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Ethical Challenges */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Ethical Challenges
          </h3>
          <RiskSelector
            value={formData.ethicalChallenges.risk}
            onChange={(value) => updateFormData('ethicalChallenges.risk', value)}
            label="Risk Level"
          />
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Prevention Strategy
            </label>
            <textarea
              value={formData.ethicalChallenges.prevention}
              onChange={(e) => updateFormData('ethicalChallenges.prevention', e.target.value)}
              placeholder="How will you prevent bias in algorithms and ensure transparency in decision-making?"
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="4"
            />
          </div>
        </div>

        {/* Social Challenges */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Social Challenges
          </h3>
          <RiskSelector
            value={formData.socialChallenges.risk}
            onChange={(value) => updateFormData('socialChallenges.risk', value)}
            label="Risk Level"
          />
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Prevention Strategy
            </label>
            <textarea
              value={formData.socialChallenges.prevention}
              onChange={(e) => updateFormData('socialChallenges.prevention', e.target.value)}
              placeholder="How will you address public perception and trust in AI systems, especially concerns about employment and privacy?"
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="4"
            />
          </div>
        </div>

        {/* Technical Challenges */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Technical Challenges
          </h3>
          <RiskSelector
            value={formData.technicalChallenges.risk}
            onChange={(value) => updateFormData('technicalChallenges.risk', value)}
            label="Risk Level"
          />
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Prevention Strategy
            </label>
            <textarea
              value={formData.technicalChallenges.prevention}
              onChange={(e) => updateFormData('technicalChallenges.prevention', e.target.value)}
              placeholder="How will you ensure data quality, system scalability, and address potential bias in training data?"
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="4"
            />
          </div>
        </div>

        {/* Other Challenges */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Other Challenges
          </h3>
          <RiskSelector
            value={formData.otherChallenges.risk}
            onChange={(value) => updateFormData('otherChallenges.risk', value)}
            label="Risk Level"
          />
          <div>
            <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
              Prevention Strategy
            </label>
            <textarea
              value={formData.otherChallenges.prevention}
              onChange={(e) => updateFormData('otherChallenges.prevention', e.target.value)}
              placeholder="Address organizational resistance, talent acquisition, or regulatory compliance issues..."
              className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
              rows="4"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const UpskillingStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
          Upskilling Strategy
        </h2>
        <p className="text-[#A59E8C] max-w-2xl mx-auto">
          Plan your workforce development strategy and identify the skills and experts needed for AI success.
        </p>
      </div>

      {/* Upskilling Image */}
      <div className="bg-[#D7CEB2] rounded-lg p-8 text-center border-2 border-dashed border-[#A59E8C]">
        <Users size={48} className="mx-auto text-[#2A2A2A] mb-4" />
        <p className="text-[#2A2A2A] font-medium">Skills Development Roadmap</p>
      </div>

      {/* Technologies and Skills Matrix */}
      <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
        <h3 className="text-xl font-bold text-[#2A2A2A] mb-6" style={{fontFamily: 'Playfair Display'}}>
          AI Technologies & Required Skills
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#D7CEB2]">
                <th className="text-left p-3 font-semibold text-[#2A2A2A]">AI Technology</th>
                <th className="text-left p-3 font-semibold text-[#2A2A2A]">Skills Needed</th>
                <th className="text-left p-3 font-semibold text-[#2A2A2A]">Experts Needed</th>
              </tr>
            </thead>
            <tbody>
              {formData.technologies.map((tech, index) => (
                <tr key={index} className="border-b border-[#A59E8C]">
                  <td className="p-3 font-medium text-[#2A2A2A]">{tech.name}</td>
                  <td className="p-3">
                    <textarea
                      value={tech.skills}
                      onChange={(e) => {
                        const newTechnologies = [...formData.technologies];
                        newTechnologies[index].skills = e.target.value;
                        updateFormData('technologies', newTechnologies);
                      }}
                      placeholder={
                        tech.name === 'Machine Learning' ? 'Proficiency in Python, R, TensorFlow, data manipulation' :
                        tech.name === 'Predictive Analytics' ? 'Statistical analysis, data visualization, modeling' :
                        tech.name === 'Sentiment Analysis' ? 'Natural Language Processing (NLP), text mining, Python' :
                        'Innovation in AI/ML, prototyping, experimentation'
                      }
                      className="w-full p-2 border border-[#D7CEB2] rounded focus:outline-none focus:ring-1 focus:ring-[#A44A3F] text-sm"
                      rows="2"
                    />
                  </td>
                  <td className="p-3">
                    <textarea
                      value={tech.experts}
                      onChange={(e) => {
                        const newTechnologies = [...formData.technologies];
                        newTechnologies[index].experts = e.target.value;
                        updateFormData('technologies', newTechnologies);
                      }}
                      placeholder={
                        tech.name === 'Machine Learning' ? 'Machine Learning Engineers, Data Scientists, AI Specialist' :
                        tech.name === 'Predictive Analytics' ? 'Data Analysts, Predictive Modelers, BI SMEs' :
                        tech.name === 'Sentiment Analysis' ? 'NLP Engineers, Data Scientists, Computational Linguists' :
                        'AI Researchers, R&D Engineers, Innovation Leads'
                      }
                      className="w-full p-2 border border-[#D7CEB2] rounded focus:outline-none focus:ring-1 focus:ring-[#A44A3F] text-sm"
                      rows="2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Current Skills */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Current Skills Available
          </h3>
          <textarea
            value={formData.currentSkills}
            onChange={(e) => updateFormData('currentSkills', e.target.value)}
            placeholder="List existing skills in your organization that align with AI needs (e.g., data analytics, coding in Python/SQL, business intelligence experience...)"
            className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
            rows="6"
          />
        </div>

        {/* Roadblocks */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Potential Roadblocks
          </h3>
          <textarea
            value={formData.roadblocks}
            onChange={(e) => updateFormData('roadblocks', e.target.value)}
            placeholder="Describe 2-3 challenges you may face in acquiring AI skills (e.g., skill gap and training time, hiring competition, cultural resistance to AI-focused roles...)"
            className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
            rows="6"
          />
        </div>
      </div>
    </div>
  );

  const EthicsStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
          AI Ethics Framework
        </h2>
        <p className="text-[#A59E8C] max-w-2xl mx-auto">
          Establish responsible AI practices and ethical guidelines for your organization's AI initiatives.
        </p>
      </div>

      {/* Ethics Image */}
      <div className="bg-[#D7CEB2] rounded-lg p-8 text-center border-2 border-dashed border-[#A59E8C]">
        <Shield size={48} className="mx-auto text-[#2A2A2A] mb-4" />
        <p className="text-[#2A2A2A] font-medium">Ethical AI Framework Diagram</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Bias and Fairness */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Bias and Fairness of AI Systems
          </h3>
          <textarea
            value={formData.biasAndFairness}
            onChange={(e) => updateFormData('biasAndFairness', e.target.value)}
            placeholder="Describe your approach to ensuring fair and unbiased AI systems. How will you monitor for bias and ensure diverse perspectives are included in training data?"
            className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
            rows="5"
          />
        </div>

        {/* Transparency & Explainability */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Transparency & Explainability
          </h3>
          <textarea
            value={formData.transparency}
            onChange={(e) => updateFormData('transparency', e.target.value)}
            placeholder="How will you ensure AI systems are understandable to both technical and non-technical stakeholders? What processes will you implement for explaining AI decisions?"
            className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
            rows="5"
          />
        </div>

        {/* Communications of AI Ethics */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Communications of AI Ethics to Workforce
          </h3>
          <textarea
            value={formData.ethicsCommunication}
            onChange={(e) => updateFormData('ethicsCommunication', e.target.value)}
            placeholder="How will you communicate AI ethics to your workforce? What training sessions, discussions, or resources will you provide to instill an ethical mindset?"
            className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
            rows="5"
          />
        </div>

        {/* Data Privacy and Security */}
        <div className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2]">
          <h3 className="text-xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Ensuring Data Privacy and Security
          </h3>
          <textarea
            value={formData.dataPrivacy}
            onChange={(e) => updateFormData('dataPrivacy', e.target.value)}
            placeholder="Describe your approach to data privacy and security in AI systems. What measures will you implement to protect personal and sensitive information?"
            className="w-full p-3 border border-[#D7CEB2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A44A3F]"
            rows="5"
          />
        </div>
      </div>
    </div>
  );

  const SummaryStep = () => {
    const completionScore = () => {
      let completed = 0;
      let total = 0;

      // Count filled fields
      if (formData.useCase1) completed++;
      total++;
      if (formData.challenges.nonDataRoles) completed++;
      total++;
      if (formData.training.skillsNeeded) completed++;
      total++;
      if (formData.ethicalChallenges.prevention) completed++;
      total++;
      if (formData.currentSkills) completed++;
      total++;
      if (formData.biasAndFairness) completed++;
      total++;

      return Math.round((completed / total) * 100);
    };

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            Assessment Summary
          </h2>
          <p className="text-[#A59E8C] max-w-2xl mx-auto">
            Review your complete AI readiness plan and download your customized strategy document.
          </p>
        </div>

        {/* Completion Score */}
        <div className="bg-gradient-to-r from-[#A44A3F] to-[#A59E8C] rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2" style={{fontFamily: 'Playfair Display'}}>
            Assessment Completion
          </h3>
          <div className="text-4xl font-bold mb-2">{completionScore()}%</div>
          <p className="text-white/90">of key areas completed</p>
        </div>

        {/* Summary Sections */}
        <div className="space-y-6">
          {[
            { title: 'Organizational Readiness', completed: !!formData.useCase1 },
            { title: 'Challenge Assessment', completed: !!formData.ethicalChallenges.prevention },
            { title: 'Upskilling Strategy', completed: !!formData.currentSkills },
            { title: 'Ethics Framework', completed: !!formData.biasAndFairness }
          ].map((section, index) => (
            <div key={index} className="bg-[#F5F2EA] rounded-lg p-6 shadow-sm border border-[#D7CEB2] flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-4 ${
                  section.completed ? 'bg-[#A44A3F]' : 'bg-[#D7CEB2]'
                }`} />
                <span className="font-semibold text-[#2A2A2A]">{section.title}</span>
              </div>
              <button
                onClick={() => navigateToStep(index)}
                className="text-[#A44A3F] hover:text-[#2A2A2A] transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button className="flex items-center gap-2 bg-[#A44A3F] text-[#F5F2EA] px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-colors">
            <Download size={20} />
            Download Full Report
          </button>
          <button className="flex items-center gap-2 border border-[#A44A3F] text-[#A44A3F] px-6 py-3 rounded-lg hover:bg-[#A44A3F] hover:text-[#F5F2EA] transition-colors">
            <Save size={20} />
            Save Progress
          </button>
        </div>
      </div>
    );
  };

  const NavigationButtons = () => (
    <div className="flex justify-between mt-12">
      <button
        onClick={() => navigateToStep(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
          currentStep === 0
            ? 'bg-[#D7CEB2] text-[#A59E8C] cursor-not-allowed'
            : 'bg-[#D7CEB2] text-[#2A2A2A] hover:bg-[#A59E8C] hover:text-[#F5F2EA]'
        }`}
      >
        <ChevronDown className="rotate-90" size={20} />
        Previous
      </button>

      <button
        onClick={() => navigateToStep(Math.min(steps.length - 1, currentStep + 1))}
        disabled={currentStep === steps.length - 1}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
          currentStep === steps.length - 1
            ? 'bg-[#D7CEB2] text-[#A59E8C] cursor-not-allowed'
            : 'bg-[#A44A3F] text-[#F5F2EA] hover:bg-[#2A2A2A]'
        }`}
      >
        Next
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return <ReadinessStep />;
      case 1: return <ChallengesStep />;
      case 2: return <UpskillingStep />;
      case 3: return <EthicsStep />;
      case 4: return <SummaryStep />;
      default: return <ReadinessStep />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA]" style={{fontFamily: 'Lato'}}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2A2A2A] mb-4" style={{fontFamily: 'Playfair Display'}}>
            AI Readiness & Ethics Assessment Pack
          </h1>
          <p className="text-xl text-[#A59E8C] max-w-3xl mx-auto">
            A comprehensive assessment tool to help small businesses, non-profits, and service organizations prepare for successful AI adoption.
          </p>
        </div>

        {/* How to Use This Assessment */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6" style={{fontFamily: 'Playfair Display'}}>
            How to Complete This Assessment
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#F5F2EA] p-6 rounded-lg">
              <h3 className="font-semibold text-[#2A2A2A] mb-3">📋 What You'll Do</h3>
              <ul className="text-[#A59E8C] space-y-2 text-sm">
                <li>• Answer questions about your organization's current state</li>
                <li>• Identify potential challenges and opportunities</li>
                <li>• Develop strategies for workforce development</li>
                <li>• Create an ethics framework for AI implementation</li>
                <li>• Receive a comprehensive readiness summary</li>
              </ul>
            </div>
            <div className="bg-[#A44A3F]/10 p-6 rounded-lg">
              <h3 className="font-semibold text-[#2A2A2A] mb-3">⏱️ Time Investment</h3>
              <ul className="text-[#A59E8C] space-y-2 text-sm">
                <li>• Estimated time: 45-60 minutes</li>
                <li>• Can be completed in multiple sessions</li>
                <li>• Your progress is automatically saved</li>
                <li>• Review and update answers anytime</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-[#A44A3F] text-white p-6 rounded-lg">
            <h3 className="font-semibold mb-3">🎯 Assessment Journey</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-white/80">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-[#A59E8C]/10 rounded-lg">
            <h3 className="font-semibold text-[#2A2A2A] mb-2">💡 Tips for Success</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-[#A59E8C]">
              <div>
                <p className="mb-2">• <strong>Be honest:</strong> Accurate answers lead to better recommendations</p>
                <p>• <strong>Think broadly:</strong> Consider your entire organization, not just one department</p>
              </div>
              <div>
                <p className="mb-2">• <strong>Take your time:</strong> Thoughtful responses are more valuable than quick ones</p>
                <p>• <strong>Ask for input:</strong> Involve key stakeholders in your responses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Content */}
        <div className="bg-[#F5F2EA] rounded-lg">
          {renderCurrentStep()}
          {currentStep < 4 && <NavigationButtons />}
        </div>
      </div>
    </div>
  );
};

export default AIReadinessAssessment;