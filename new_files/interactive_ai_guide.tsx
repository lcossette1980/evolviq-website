import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, Lock, AlertCircle, Lightbulb, Users, Target, Clock, DollarSign } from 'lucide-react';

const InteractiveAIGuide = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [phaseData, setPhaseData] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const phases = [
    {
      id: 0,
      title: "Readiness Assessment",
      subtitle: "Foundation Building",
      duration: "2-4 weeks",
      investment: "Low",
      personnel: "Leadership + 1-2 tech-savvy staff",
      description: "Determine if your organization is ready for AI implementation"
    },
    {
      id: 1,
      title: "Strategy & Vision",
      subtitle: "Alignment",
      duration: "3-4 weeks", 
      investment: "Low-Medium",
      personnel: "Leadership team",
      description: "Define AI vision, goals, and governance principles"
    },
    {
      id: 2,
      title: "Capability Assessment",
      subtitle: "Gap Analysis",
      duration: "2-3 weeks",
      investment: "Low", 
      personnel: "Operations lead + IT contact",
      description: "Assess current capabilities and identify improvement areas"
    },
    {
      id: 3,
      title: "Use Case Prioritization",
      subtitle: "Business Cases",
      duration: "2-3 weeks",
      investment: "Low",
      personnel: "Department heads", 
      description: "Identify and prioritize AI implementation opportunities"
    },
    {
      id: 4,
      title: "Pilot Implementation",
      subtitle: "Testing & Learning",
      duration: "4-8 weeks",
      investment: "Medium",
      personnel: "Project lead + end users",
      description: "Execute pilot projects and measure results"
    },
    {
      id: 5,
      title: "Governance & Risk",
      subtitle: "Management",
      duration: "Ongoing",
      investment: "Low", 
      personnel: "Leadership + compliance lead",
      description: "Establish policies and risk management processes"
    },
    {
      id: 6,
      title: "Scale & Improve",
      subtitle: "Continuous Growth",
      duration: "Ongoing",
      investment: "Medium",
      personnel: "All staff",
      description: "Scale successful initiatives and drive continuous improvement"
    }
  ];

  const isPhaseUnlocked = (phaseId) => {
    if (phaseId === 0) return true;
    return completedPhases.includes(phaseId - 1);
  };

  const completePhase = (phaseId) => {
    if (!completedPhases.includes(phaseId)) {
      setCompletedPhases([...completedPhases, phaseId]);
    }
  };

  const TabNavigation = () => (
    <div 
      className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}
      style={{backgroundColor: '#2A2A2A'}}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{borderColor: '#A59E8C'}}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white float-right mb-4"
        >
          <ChevronRight 
            size={20} 
            className={`transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
        {!sidebarCollapsed && (
          <>
            <h1 
              className="text-xl font-bold text-white mb-2" 
              style={{fontFamily: 'Playfair Display, serif'}}
            >
              AI Implementation Guide
            </h1>
            <p 
              className="text-sm" 
              style={{fontFamily: 'Lato, sans-serif', color: '#A59E8C'}}
            >
              For Small Organizations
            </p>
          </>
        )}
      </div>

      {/* Phase Navigation */}
      <div className="p-4 space-y-2">
        {phases.map((phase) => {
          const isActive = currentPhase === phase.id;
          const isCompleted = completedPhases.includes(phase.id);
          const isLocked = !isPhaseUnlocked(phase.id);
          
          return (
            <div
              key={phase.id}
              className={`rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'text-white' 
                  : isCompleted 
                    ? 'text-white hover:opacity-80' 
                    : isLocked 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? '#A44A3F' : isCompleted ? '#A59E8C' : 'transparent'
              }}
              onClick={() => !isLocked && setCurrentPhase(phase.id)}
            >
              <div className="p-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-white text-gray-800' : 
                      isLocked ? 'bg-gray-600 text-gray-400' : 'bg-gray-700 text-white'
                    }`}
                  >
                    {isCompleted ? <Check size={12} /> : 
                     isLocked ? <Lock size={12} /> : phase.id + 1}
                  </div>
                  
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-bold text-sm truncate" 
                        style={{fontFamily: 'Playfair Display, serif'}}
                      >
                        {phase.title}
                      </h3>
                      <p 
                        className="text-xs opacity-75 truncate" 
                        style={{fontFamily: 'Lato, sans-serif'}}
                      >
                        {phase.subtitle}
                      </p>
                    </div>
                  )}
                </div>
                
                {!sidebarCollapsed && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs opacity-75">
                    <div className="flex items-center space-x-1">
                      <Clock size={10} />
                      <span>{phase.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign size={10} />
                      <span>{phase.investment}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ScaleItem = ({ label, value, onChange, descriptions }) => (
    <div className="space-y-3">
      <label 
        className="block font-medium" 
        style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
      >
        {label}
      </label>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((scale) => (
          <label key={scale} className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input
              type="radio"
              name={label}
              value={scale}
              checked={value === scale}
              onChange={() => onChange(scale)}
              className="mt-1"
              style={{accentColor: '#A44A3F'}}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className="font-medium"
                  style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
                >
                  {scale}
                </span>
                <span 
                  className="text-sm font-medium"
                  style={{color: scale <= 2 ? '#dc2626' : scale <= 3 ? '#ea580c' : '#059669'}}
                >
                  {scale === 1 ? 'None/Minimal' : 
                   scale === 2 ? 'Basic' : 
                   scale === 3 ? 'Intermediate' : 
                   scale === 4 ? 'Advanced' : 'Enterprise Grade'}
                </span>
              </div>
              <p 
                className="text-sm mt-1"
                style={{fontFamily: 'Lato, sans-serif', color: '#A59E8C'}}
              >
                {descriptions[scale - 1]}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const ReadinessAssessment = () => {
    const [assessments, setAssessments] = useState({
      digitalSystems: 0,
      dataManagement: 0,
      techCapability: 0,
      processMaturity: 0,
      changeReadiness: 0
    });

    const handleAssessmentChange = (key, value) => {
      const newAssessments = { ...assessments, [key]: value };
      setAssessments(newAssessments);
      setPhaseData(prev => ({ ...prev, readinessAssessments: newAssessments }));
    };

    const assessmentItems = [
      {
        key: 'digitalSystems',
        label: 'Digital Systems & Infrastructure',
        descriptions: [
          'Paper-based processes, no digital systems',
          'Basic email and simple software (Word, Excel)',
          'Some cloud services, basic CRM or accounting software',
          'Integrated systems, cloud-based operations, good connectivity',
          'Enterprise-grade systems, APIs, advanced integrations'
        ]
      },
      {
        key: 'dataManagement',
        label: 'Data Collection & Management',
        descriptions: [
          'No systematic data collection, paper records only',
          'Some digital data, mostly in spreadsheets',
          'Organized digital data, basic reporting capabilities',
          'Structured databases, regular reporting, data quality processes',
          'Advanced analytics, data governance, real-time dashboards'
        ]
      },
      {
        key: 'techCapability',
        label: 'Technical Capability & Support',
        descriptions: [
          'No technical staff, outsource all IT needs',
          'Basic computer skills, external IT support as needed',
          'Some tech-savvy staff, can handle routine IT tasks',
          'Dedicated IT person/team, good technical capabilities',
          'Advanced technical team, development capabilities, innovation focus'
        ]
      },
      {
        key: 'processMaturity',
        label: 'Process Documentation & Standardization',
        descriptions: [
          'Ad-hoc processes, undocumented workflows',
          'Some written procedures, inconsistent execution',
          'Most processes documented, generally followed',
          'Well-documented processes, regular reviews and updates',
          'Optimized processes, continuous improvement, automation'
        ]
      },
      {
        key: 'changeReadiness',
        label: 'Organizational Change Readiness',
        descriptions: [
          'Resistant to change, prefer status quo',
          'Open to change but need significant support',
          'Moderate change tolerance, some early adopters',
          'Embrace beneficial changes, good change management',
          'Innovation-driven culture, rapid adoption capabilities'
        ]
      }
    ];

    const totalScore = Object.values(assessments).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(assessments).length;
    const completedAssessments = Object.values(assessments).filter(score => score > 0).length;
    const isComplete = completedAssessments === assessmentItems.length;

    const getReadinessLevel = () => {
      if (averageScore >= 4) return { level: 'High Readiness', color: '#059669', message: 'Your organization is well-positioned for AI implementation.' };
      if (averageScore >= 3) return { level: 'Moderate Readiness', color: '#ea580c', message: 'You have a good foundation but may need some preparation.' };
      if (averageScore >= 2) return { level: 'Basic Readiness', color: '#dc2626', message: 'Consider building foundational capabilities before proceeding.' };
      return { level: 'Foundation Building Needed', color: '#dc2626', message: 'Focus on fundamental digital transformation first.' };
    };

    const readiness = getReadinessLevel();

    return (
      <div className="space-y-6">
        <div 
          className="rounded-lg p-6"
          style={{backgroundColor: '#F5F2EA'}}
        >
          <h3 
            className="text-xl font-bold mb-4" 
            style={{fontFamily: 'Playfair Display, serif', color: '#2A2A2A'}}
          >
            Organizational Readiness Assessment
          </h3>
          <p 
            className="mb-6" 
            style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
          >
            Rate your organization on each dimension below to understand your AI implementation readiness.
          </p>
          
          <div className="space-y-8">
            {assessmentItems.map((item) => (
              <ScaleItem
                key={item.key}
                label={item.label}
                value={assessments[item.key]}
                onChange={(value) => handleAssessmentChange(item.key, value)}
                descriptions={item.descriptions}
              />
            ))}
          </div>
        </div>

        {isComplete && (
          <div 
            className="rounded-lg p-6 border-2"
            style={{
              backgroundColor: averageScore >= 3 ? '#f0fdf4' : '#fef3c7',
              borderColor: readiness.color
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{backgroundColor: readiness.color}}
              >
                {averageScore.toFixed(1)}
              </div>
              <div>
                <h3 
                  className="text-xl font-bold" 
                  style={{fontFamily: 'Playfair Display, serif', color: readiness.color}}
                >
                  {readiness.level}
                </h3>
                <p 
                  className="text-sm"
                  style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
                >
                  Average Score: {averageScore.toFixed(1)}/5.0
                </p>
              </div>
            </div>
            
            <p 
              className="mb-4"
              style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
            >
              {readiness.message}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 
                  className="font-bold mb-2"
                  style={{fontFamily: 'Playfair Display, serif', color: '#2A2A2A'}}
                >
                  Strengths
                </h4>
                <ul className="space-y-1" style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}>
                  {assessmentItems
                    .filter(item => assessments[item.key] >= 4)
                    .map(item => (
                      <li key={item.key} className="text-sm">• {item.label}</li>
                    ))}
                  {assessmentItems.filter(item => assessments[item.key] >= 4).length === 0 && (
                    <li className="text-sm text-gray-500">Complete assessment to see strengths</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 
                  className="font-bold mb-2"
                  style={{fontFamily: 'Playfair Display, serif', color: '#2A2A2A'}}
                >
                  Areas for Improvement
                </h4>
                <ul className="space-y-1" style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}>
                  {assessmentItems
                    .filter(item => assessments[item.key] <= 2 && assessments[item.key] > 0)
                    .map(item => (
                      <li key={item.key} className="text-sm">• {item.label}</li>
                    ))}
                  {assessmentItems.filter(item => assessments[item.key] <= 2 && assessments[item.key] > 0).length === 0 && (
                    <li className="text-sm text-gray-500">Complete assessment to see improvement areas</li>
                  )}
                </ul>
              </div>
            </div>

            <button
              onClick={() => completePhase(0)}
              className="text-white hover:opacity-90 px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                fontFamily: 'Lato, sans-serif',
                backgroundColor: '#A44A3F'
              }}
            >
              Complete Assessment & Continue
            </button>
          </div>
        )}

        {averageScore > 0 && averageScore < 3 && (
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 mt-1" size={20} />
              <div>
                <h4 
                  className="font-bold text-blue-900 mb-2" 
                  style={{fontFamily: 'Playfair Display, serif'}}
                >
                  Foundation Building Recommendations
                </h4>
                <ul 
                  className="space-y-2 text-blue-800" 
                  style={{fontFamily: 'Lato, sans-serif'}}
                >
                  <li>• Start with basic cloud services (Google Workspace, Microsoft 365)</li>
                  <li>• Implement a simple CRM or project management system</li>
                  <li>• Begin digitizing key processes and data</li>
                  <li>• Identify and train technology champions</li>
                  <li>• Document current workflows before optimization</li>
                  <li>• Consider a digital transformation consultant</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const StrategyVision = () => {
    const [vision, setVision] = useState({
      problem: '',
      success: '',
      tolerance: 'conservative'
    });

    const [valueHypothesis, setValueHypothesis] = useState({
      type: 'cost',
      description: '',
      metric: '',
      value: ''
    });

    useEffect(() => {
      setPhaseData(prev => ({ ...prev, vision, valueHypothesis }));
    }, [vision, valueHypothesis]);

    const isComplete = vision.problem && vision.success && valueHypothesis.description && valueHypothesis.metric;

    return (
      <div className="space-y-6">
        <div 
          className="rounded-lg p-6"
          style={{backgroundColor: '#F5F2EA'}}
        >
          <h3 
            className="text-xl font-bold mb-4" 
            style={{fontFamily: 'Playfair Display, serif', color: '#2A2A2A'}}
          >
            Define Your AI Vision
          </h3>
          
          <div className="space-y-4">
            <div>
              <label 
                className="block font-medium mb-2" 
                style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
              >
                What specific problem are we solving?
              </label>
              <textarea
                value={vision.problem}
                onChange={(e) => setVision(prev => ({ ...prev, problem: e.target.value }))}
                placeholder="Be specific - 'reduce manual data entry by 80%' not 'become more efficient'"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  borderColor: '#A59E8C'
                }}
                rows={3}
              />
            </div>

            <div>
              <label 
                className="block font-medium mb-2" 
                style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
              >
                What does success look like?
              </label>
              <textarea
                value={vision.success}
                onChange={(e) => setVision(prev => ({ ...prev, success: e.target.value }))}
                placeholder="Measurable outcomes - 'save 10 hours/week' or 'increase response rate by 25%'"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  borderColor: '#A59E8C'
                }}
                rows={3}
              />
            </div>

            <div>
              <label 
                className="block font-medium mb-2" 
                style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
              >
                What's our tolerance for experimentation?
              </label>
              <select
                value={vision.tolerance}
                onChange={(e) => setVision(prev => ({ ...prev, tolerance: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  borderColor: '#A59E8C'
                }}
              >
                <option value="conservative">Conservative - Proven solutions only</option>
                <option value="moderate">Moderate - Some experimentation acceptable</option>
                <option value="aggressive">Aggressive - Open to cutting-edge solutions</option>
              </select>
            </div>
          </div>
        </div>

        <div 
          className="rounded-lg p-6"
          style={{backgroundColor: '#D7CEB2'}}
        >
          <h3 
            className="text-xl font-bold mb-4" 
            style={{fontFamily: 'Playfair Display, serif', color: '#2A2A2A'}}
          >
            Value Hypothesis
          </h3>
          
          <div className="space-y-4">
            <div>
              <label 
                className="block font-medium mb-2" 
                style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
              >
                Primary Value Type
              </label>
              <select
                value={valueHypothesis.type}
                onChange={(e) => setValueHypothesis(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  borderColor: '#A59E8C'
                }}
              >
                <option value="cost">Cost Reduction</option>
                <option value="service">Service Improvement</option>
                <option value="growth">Growth Enablement</option>
              </select>
            </div>

            <div>
              <label 
                className="block font-medium mb-2" 
                style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
              >
                How will AI help?
              </label>
              <input
                type="text"
                value={valueHypothesis.description}
                onChange={(e) => setValueHypothesis(prev => ({ ...prev, description: e.target.value }))}
                placeholder="AI will help us automate invoice processing..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  borderColor: '#A59E8C'
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  className="block font-medium mb-2" 
                  style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
                >
                  Measurable Outcome
                </label>
                <input
                  type="text"
                  value={valueHypothesis.metric}
                  onChange={(e) => setValueHypothesis(prev => ({ ...prev, metric: e.target.value }))}
                  placeholder="reduce processing time by 15 hours/week"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    borderColor: '#A59E8C'
                  }}
                />
              </div>
              <div>
                <label 
                  className="block font-medium mb-2" 
                  style={{fontFamily: 'Lato, sans-serif', color: '#2A2A2A'}}
                >
                  Estimated Annual Value
                </label>
                <input
                  type="text"
                  value={valueHypothesis.value}
                  onChange={(e) => setValueHypothesis(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="$25,000 annually"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    borderColor: '#A59E8C'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="text-blue-600 mt-1" size={20} />
            <div>
              <h4 
                className="font-bold text-blue-900 mb-2" 
                style={{fontFamily: 'Playfair Display, serif'}}
              >
                Vision Statement Tips
              </h4>
              <ul 
                className="space-y-2 text-blue-800" 
                style={{fontFamily: 'Lato, sans-serif'}}
              >
                <li>• Be specific about the problem and quantify the impact</li>
                <li>• Make success measurable (hours saved, % improvement, etc.)</li>
                <li>• Consider your organization's risk tolerance and change capacity</li>
                <li>• Focus on high-impact, manageable improvements first</li>
                <li>• Align with broader organizational goals and values</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => isComplete && completePhase(1)}
            disabled={!isComplete}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isComplete 
                ? 'text-white hover:opacity-90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={{
              fontFamily: 'Lato, sans-serif',
              backgroundColor: isComplete ? '#A44A3F' : undefined
            }}
          >
            Complete Phase 1
          </button>
        </div>
      </div>
    );
  };

  const renderPhaseContent = () => {
    switch(currentPhase) {
      case 0:
        return <ReadinessAssessment />;
      case 1:
        return <StrategyVision />;
      default:
        return (
          <div className="text-center py-12">
            <h3 
              className="text-xl font-bold mb-4" 
              style={{fontFamily: 'Playfair Display, serif', color: '#2A2A2A'}}
            >
              Phase {currentPhase + 1} Coming Soon
            </h3>
            <p 
              style={{fontFamily: 'Lato, sans-serif', color: '#A59E8C'}}
            >
              This phase is currently under development. Complete the previous phases to unlock.
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{backgroundColor: '#F5F2EA'}}
    >
      {/* Side Navigation */}
      <TabNavigation />

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        {/* Header */}
        <div 
          className="text-white py-8"
          style={{backgroundColor: '#2A2A2A'}}
        >
          <div className="max-w-4xl mx-auto px-6">
            <h1 
              className="text-4xl font-bold mb-2" 
              style={{fontFamily: 'Playfair Display, serif'}}
            >
              Phase {currentPhase}: {phases[currentPhase].title}
            </h1>
            <p 
              className="text-xl" 
              style={{fontFamily: 'Lato, sans-serif', color: '#A59E8C'}}
            >
              {phases[currentPhase].description}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {renderPhaseContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveAIGuide;