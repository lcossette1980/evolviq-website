import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Lock, AlertCircle, Lightbulb, Users, Target, Clock, DollarSign, ArrowLeft, Save, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { colors } from '../utils/colors';

const ProjectInteractiveGuide = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject, saveToolData, getToolData } = useProject();
  
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [phaseData, setPhaseData] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const phases = [
    {
      id: 0,
      title: "Readiness Assessment",
      subtitle: "Foundation Building",
      duration: "2-4 weeks",
      investment: "Low",
      personnel: "Leadership + 1-2 tech-savvy staff",
      description: "Determine if your organization is ready for AI implementation",
      icon: AlertCircle,
      color: colors.khaki
    },
    {
      id: 1,
      title: "Strategy & Vision",
      subtitle: "Alignment",
      duration: "3-4 weeks", 
      investment: "Low-Medium",
      personnel: "Leadership team",
      description: "Define AI vision, goals, and governance principles",
      icon: Target,
      color: colors.chestnut
    },
    {
      id: 2,
      title: "Capability Assessment",
      subtitle: "Gap Analysis",
      duration: "2-3 weeks",
      investment: "Low", 
      personnel: "Operations lead + IT contact",
      description: "Assess current capabilities and identify improvement areas",
      icon: Users,
      color: colors.khaki
    },
    {
      id: 3,
      title: "Use Case Prioritization",
      subtitle: "Business Cases",
      duration: "2-3 weeks",
      investment: "Low",
      personnel: "Department heads", 
      description: "Identify and prioritize AI implementation opportunities",
      icon: Lightbulb,
      color: colors.chestnut
    },
    {
      id: 4,
      title: "Pilot Implementation",
      subtitle: "Testing & Learning",
      duration: "4-8 weeks",
      investment: "Medium",
      personnel: "Project lead + end users",
      description: "Execute pilot projects and measure results",
      icon: Target,
      color: colors.khaki
    },
    {
      id: 5,
      title: "Governance & Risk",
      subtitle: "Management",
      duration: "Ongoing",
      investment: "Low", 
      personnel: "Leadership + compliance lead",
      description: "Establish policies and risk management processes",
      icon: AlertCircle,
      color: colors.chestnut
    },
    {
      id: 6,
      title: "Scale & Improve",
      subtitle: "Continuous Growth",
      duration: "Ongoing",
      investment: "Medium",
      personnel: "All staff",
      description: "Scale successful initiatives and drive continuous improvement",
      icon: Target,
      color: colors.khaki
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getToolData(projectId, 'interactiveGuide');
        if (data) {
          setCompletedPhases(data.completed || []);
          setPhaseData(data.phases || {});
          setCurrentPhase(data.currentPhase || 0);
        }
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [projectId, getToolData]);

  const isPhaseUnlocked = (phaseId) => {
    if (phaseId === 0) return true;
    return completedPhases.includes(phaseId - 1);
  };

  const completePhase = (phaseId) => {
    if (!completedPhases.includes(phaseId)) {
      const newCompleted = [...completedPhases, phaseId];
      setCompletedPhases(newCompleted);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      await saveToolData(projectId, 'interactiveGuide', {
        completed: completedPhases,
        currentPhase,
        phases: phaseData,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  // Likert Scale Component
  const ScaleItem = ({ label, value, onChange, descriptions }) => (
    <div className="space-y-3">
      <label className="block font-medium text-charcoal">
        {label}
      </label>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((scale) => (
          <label key={scale} className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-bone transition-colors">
            <input
              type="radio"
              name={label}
              value={scale}
              checked={value === scale}
              onChange={() => onChange(scale)}
              className="mt-1"
              style={{accentColor: colors.chestnut}}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-charcoal">
                  {scale}
                </span>
                <span className={`text-sm font-medium ${
                  scale <= 2 ? 'text-red-600' : 
                  scale <= 3 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {scale === 1 ? 'None/Minimal' : 
                   scale === 2 ? 'Basic' : 
                   scale === 3 ? 'Intermediate' : 
                   scale === 4 ? 'Advanced' : 
                   'Enterprise Grade'}
                </span>
              </div>
              <p className="text-sm mt-1 text-charcoal/70">
                {descriptions[scale - 1]}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  // Readiness Assessment Component
  const ReadinessAssessment = () => {
    const [assessments, setAssessments] = useState(
      phaseData.readinessAssessments || {
        digitalSystems: 0,
        dataManagement: 0,
        techCapability: 0,
        processMaturity: 0,
        changeReadiness: 0
      }
    );

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
        <div className="bg-pearl/20 rounded-lg p-6">
          <h3 className="font-serif text-xl font-bold mb-4 text-charcoal">
            Organizational Readiness Assessment
          </h3>
          <p className="mb-6 text-charcoal/80">
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
                <h3 className="font-serif text-xl font-bold" style={{color: readiness.color}}>
                  {readiness.level}
                </h3>
                <p className="text-sm text-charcoal/70">
                  Average Score: {averageScore.toFixed(1)}/5.0
                </p>
              </div>
            </div>
            
            <p className="mb-4 text-charcoal">
              {readiness.message}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-bold mb-2 text-charcoal">Strengths</h4>
                <ul className="space-y-1 text-charcoal/80">
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
                <h4 className="font-bold mb-2 text-charcoal">Areas for Improvement</h4>
                <ul className="space-y-1 text-charcoal/80">
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
              className="px-6 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors font-medium"
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
                <h4 className="font-serif font-bold text-blue-900 mb-2">
                  Foundation Building Recommendations
                </h4>
                <ul className="space-y-2 text-blue-800">
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

  // Strategy & Vision Component
  const StrategyVision = () => {
    const [vision, setVision] = useState(
      phaseData.vision || {
        problem: '',
        success: '',
        tolerance: 'conservative'
      }
    );

    const [valueHypothesis, setValueHypothesis] = useState(
      phaseData.valueHypothesis || {
        type: 'cost',
        description: '',
        metric: '',
        value: ''
      }
    );

    useEffect(() => {
      setPhaseData(prev => ({ ...prev, vision, valueHypothesis }));
    }, [vision, valueHypothesis]);

    const isComplete = vision.problem && vision.success && valueHypothesis.description && valueHypothesis.metric;

    return (
      <div className="space-y-6">
        <div className="bg-pearl/20 rounded-lg p-6">
          <h3 className="font-serif text-xl font-bold mb-4 text-charcoal">
            Define Your AI Vision
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-charcoal">
                What specific problem are we solving?
              </label>
              <textarea
                value={vision.problem}
                onChange={(e) => setVision(prev => ({ ...prev, problem: e.target.value }))}
                placeholder="Be specific - 'reduce manual data entry by 80%' not 'become more efficient'"
                className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                rows={3}
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-charcoal">
                What does success look like?
              </label>
              <textarea
                value={vision.success}
                onChange={(e) => setVision(prev => ({ ...prev, success: e.target.value }))}
                placeholder="Measurable outcomes - 'save 10 hours/week' or 'increase response rate by 25%'"
                className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                rows={3}
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-charcoal">
                What's our tolerance for experimentation?
              </label>
              <select
                value={vision.tolerance}
                onChange={(e) => setVision(prev => ({ ...prev, tolerance: e.target.value }))}
                className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
              >
                <option value="conservative">Conservative - Proven solutions only</option>
                <option value="moderate">Moderate - Some experimentation acceptable</option>
                <option value="aggressive">Aggressive - Open to cutting-edge solutions</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-khaki/20 rounded-lg p-6">
          <h3 className="font-serif text-xl font-bold mb-4 text-charcoal">
            Value Hypothesis
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2 text-charcoal">
                Primary Value Type
              </label>
              <select
                value={valueHypothesis.type}
                onChange={(e) => setValueHypothesis(prev => ({ ...prev, type: e.target.value }))}
                className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
              >
                <option value="cost">Cost Reduction</option>
                <option value="service">Service Improvement</option>
                <option value="growth">Growth Enablement</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2 text-charcoal">
                How will AI help?
              </label>
              <input
                type="text"
                value={valueHypothesis.description}
                onChange={(e) => setValueHypothesis(prev => ({ ...prev, description: e.target.value }))}
                placeholder="AI will help us automate invoice processing..."
                className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-charcoal">
                  Measurable Outcome
                </label>
                <input
                  type="text"
                  value={valueHypothesis.metric}
                  onChange={(e) => setValueHypothesis(prev => ({ ...prev, metric: e.target.value }))}
                  placeholder="reduce processing time by 15 hours/week"
                  className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-charcoal">
                  Estimated Annual Value
                </label>
                <input
                  type="text"
                  value={valueHypothesis.value}
                  onChange={(e) => setValueHypothesis(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="$25,000 annually"
                  className="w-full p-3 border-2 border-khaki/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="text-blue-600 mt-1" size={20} />
            <div>
              <h4 className="font-serif font-bold text-blue-900 mb-2">
                Vision Statement Tips
              </h4>
              <ul className="space-y-2 text-blue-800">
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
                ? 'bg-chestnut text-white hover:bg-chestnut/90' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Complete Phase 1
          </button>
        </div>
      </div>
    );
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-khaki" />
            <p className="text-charcoal">Loading guide...</p>
          </div>
        </div>
      </div>
    );
  }

  const TabNavigation = () => (
    <div 
      className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      } bg-charcoal shadow-xl`}
    >
      {/* Header */}
      <div className="p-6 border-b border-khaki/30">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white float-right mb-4 hover:text-pearl transition-colors"
        >
          <ChevronRight className={`transform transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>
        {!sidebarCollapsed && (
          <>
            <h2 className="font-serif text-xl font-bold text-white mb-2">
              AI Implementation Guide
            </h2>
            <p className="text-sm text-pearl">
              For Small Organizations
            </p>
          </>
        )}
      </div>

      {/* Phase List */}
      <div className="overflow-y-auto" style={{height: 'calc(100% - 100px)'}}>
        {phases.map((phase) => {
          const isUnlocked = isPhaseUnlocked(phase.id);
          const isCompleted = completedPhases.includes(phase.id);
          const isCurrent = currentPhase === phase.id;
          
          return (
            <div
              key={phase.id}
              onClick={() => isUnlocked && setCurrentPhase(phase.id)}
              className={`p-4 border-b border-khaki/20 cursor-pointer transition-all hover:bg-white/10 ${
                isCurrent ? 'bg-white/20' : ''
              } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-khaki flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : isUnlocked ? (
                    <div className="w-8 h-8 rounded-full border-2 border-pearl flex items-center justify-center">
                      <span className="text-white font-semibold">{phase.id + 1}</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-charcoal/50 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-pearl/50" />
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">{phase.title}</h3>
                    <p className="text-xs mt-1 text-pearl/80">{phase.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-pearl/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {phase.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {phase.investment}
                      </span>
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

  const renderPhaseContent = () => {
    const phase = phases[currentPhase];
    const isUnlocked = isPhaseUnlocked(currentPhase);
    const Icon = phase.icon;

    if (!isUnlocked) {
      return (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-khaki" />
            <h2 className="font-serif text-2xl font-bold mb-2 text-charcoal">Phase Locked</h2>
            <p className="text-charcoal/70">Complete the previous phase to unlock this section.</p>
          </div>
        </div>
      );
    }

    switch(currentPhase) {
      case 0:
        return <ReadinessAssessment />;
      case 1:
        return <StrategyVision />;
      default:
        return (
          <div className="text-center py-12">
            <h3 className="font-serif text-xl font-bold mb-4 text-charcoal">
              Phase {currentPhase + 1} Coming Soon
            </h3>
            <p className="text-charcoal/70">
              This phase is currently under development. Complete the previous phases to unlock.
            </p>
          </div>
        );
    }
  };

  const PhaseContent = () => {
    const phase = phases[currentPhase];
    const Icon = phase.icon;

    return (
      <div className={`ml-${sidebarCollapsed ? '16' : '80'} transition-all duration-300 min-h-screen bg-bone`}>
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => navigate(`/dashboard`)}
            className="flex items-center gap-2 text-charcoal hover:text-chestnut transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-sans">Back to Dashboard</span>
          </button>
          <button
            onClick={saveProgress}
            disabled={saving}
            className="px-6 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
        </div>

        {/* Phase Header */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-xl" style={{backgroundColor: phase.color + '20'}}>
                  <Icon className="w-8 h-8" style={{color: phase.color}} />
                </div>
                <div className="flex-1">
                  <h1 className="font-serif text-3xl font-bold mb-2 text-charcoal">
                    Phase {currentPhase + 1}: {phase.title}
                  </h1>
                  <p className="text-lg text-charcoal/70 mb-4">{phase.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-khaki" />
                      <div>
                        <p className="text-xs text-charcoal/60">Duration</p>
                        <p className="font-semibold text-charcoal">{phase.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-khaki" />
                      <div>
                        <p className="text-xs text-charcoal/60">Investment</p>
                        <p className="font-semibold text-charcoal">{phase.investment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-khaki" />
                      <div>
                        <p className="text-xs text-charcoal/60">Personnel</p>
                        <p className="font-semibold text-charcoal">{phase.personnel}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Content */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {renderPhaseContent()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TabNavigation />
      <PhaseContent />
    </>
  );
};

export default ProjectInteractiveGuide;