import React from 'react';
import { Calculator, Target, TrendingUp, FileText, BarChart3, Lightbulb, DollarSign, Clock, Shield, Zap, Users, Settings, Building, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import GuideTemplate from './GuideTemplate';
import { 
  SectionHeader, 
  FormField, 
  CollapsibleSection, 
  ProgressIndicator, 
  InfoBox, 
  ImagePlaceholder, 
  ArrayInput, 
  GridLayout, 
  Card, 
  Button 
} from './StandardComponents';

const AIUseCaseROIToolkit = () => {
  const guideId = 'AIUseCaseROIToolkit';
  const initialFormData = {
    useCases: [
      { area: '', useCase: '', benefits: '', roiPotential: 'Medium' }
    ],
    roiAnalysis: {
      initiative: '',
      investment: '',
      benefits: '',
      additionalBenefits: ''
    },
    detailedTemplate: {
      strategicGoal: '',
      objective: '',
      measures: '',
      owner: '',
      aiApproach: '',
      ethicalIssues: '',
      technology: '',
      skills: '',
      implementation: '',
      changeManagement: '',
      notes: ''
    }
  };
  
  const initialExpandedSections = ['overview', 'use-cases', 'roi-analysis'];

  const toggleCard = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const updateFormData = (section, field, value, index = null) => {
    setFormData(prev => {
      if (section === 'useCases' && index !== null) {
        const newUseCases = [...prev.useCases];
        newUseCases[index] = { ...newUseCases[index], [field]: value };
        return { ...prev, useCases: newUseCases };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  };

  const addUseCase = () => {
    setFormData(prev => ({
      ...prev,
      useCases: [...prev.useCases, { area: '', useCase: '', benefits: '', roiPotential: 'Medium' }]
    }));
  };

  const removeUseCase = (index) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.filter((_, i) => i !== index)
    }));
  };

  const calculateROI = () => {
    const investment = parseFloat(formData.roiAnalysis.investment) || 0;
    const benefits = parseFloat(formData.roiAnalysis.benefits) || 0;
    
    if (investment === 0) return { roi: 0, ratio: 0 };
    
    const roi = ((benefits - investment) / investment) * 100;
    const ratio = benefits / investment;
    
    return { roi: roi.toFixed(1), ratio: ratio.toFixed(2) };
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: Lightbulb },
    { id: 'identify', title: 'Identify Use Cases', icon: Target },
    { id: 'template', title: 'Detailed Template', icon: FileText },
    { id: 'roi-calculator', title: 'ROI Calculator', icon: Calculator },
    { id: 'framework', title: 'ROI Framework', icon: BarChart3 },
    { id: 'examples', title: 'Real Examples', icon: Building }
  ];

  const roiCategories = [
    { id: 'cost', title: 'Cost Impact', icon: DollarSign, color: colors.chestnut, description: 'Direct and indirect cost savings or increases' },
    { id: 'revenue', title: 'Revenue Impact', icon: TrendingUp, color: colors.khaki, description: 'New revenue streams or customer value increases' },
    { id: 'quality', title: 'Quality Impact', icon: CheckCircle, color: colors.chestnut, description: 'Product or service quality improvements' },
    { id: 'technology', title: 'Technology Impact', icon: Settings, color: colors.khaki, description: 'Infrastructure and system improvements' },
    { id: 'speed', title: 'Speed to Value', icon: Clock, color: colors.chestnut, description: 'Time-to-market and delivery acceleration' },
    { id: 'security', title: 'Security Impact', icon: Shield, color: colors.khaki, description: 'Risk reduction and compliance improvements' },
    { id: 'process', title: 'Process Impact', icon: Zap, color: colors.chestnut, description: 'Operational efficiency and workflow optimization' },
    { id: 'differentiator', title: 'Business Differentiator', icon: Users, color: colors.khaki, description: 'Competitive advantage and market positioning' }
  ];

  const exampleUseCases = [
    {
      title: 'AI-Powered Customer Support Chatbot',
      investment: 50000,
      benefits: 130000,
      roi: 160,
      description: 'Retail company implementing 24/7 customer support automation',
      outcomes: [
        '40% reduction in response time',
        '70% of support requests handled automatically',
        'Increased customer satisfaction by 15%',
        '$100,000 annual savings from reduced agent workload'
      ]
    },
    {
      title: 'Predictive Maintenance System',
      investment: 60000,
      benefits: 150000,
      roi: 150,
      description: 'Manufacturing company preventing equipment failures',
      outcomes: [
        '30% reduction in unplanned downtime',
        'Improved Overall Equipment Efficiency (OEE)',
        'Optimized maintenance schedules',
        '$150,000 annual savings from reduced repairs'
      ]
    }
  ];

  // Reusable Components
  const ButtonComponent = ({ onClick, children, variant = 'primary', ...props }) => {
    const baseStyle = {
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      fontSize: '14px',
      transition: 'opacity 0.2s ease'
    };

    const variants = {
      primary: { backgroundColor: colors.chestnut, color: 'white' },
      secondary: { backgroundColor: colors.khaki, color: 'white' }
    };

    return (
      <button
        style={{ ...baseStyle, ...variants[variant] }}
        onClick={onClick}
        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
        {...props}
      >
        {children}
      </button>
    );
  };

  const CardComponent = ({ children, style = {}, ...props }) => (
    <div
      style={{
        backgroundColor: 'white',
        border: `1px solid ${colors.pearl}`,
        borderRadius: '12px',
        padding: '24px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );

  const InputComponent = ({ value, onChange, placeholder, type = 'text', rows }) => {
    const baseStyle = {
      width: '100%',
      padding: '12px',
      border: `1px solid ${colors.pearl}`,
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    };

    const handleKeyDown = (e) => {
      // Prevent spacebar from scrolling the page when focused on input
      if (e.key === ' ' && e.target.tagName.toLowerCase() === 'input') {
        e.stopPropagation();
      }
    };

    if (rows) {
      return (
        <textarea
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          style={baseStyle}
          onFocus={(e) => e.target.style.borderColor = colors.chestnut}
          onBlur={(e) => e.target.style.borderColor = colors.pearl}
          onKeyDown={handleKeyDown}
        />
      );
    }

    return (
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        style={baseStyle}
        onFocus={(e) => e.target.style.borderColor = colors.chestnut}
        onBlur={(e) => e.target.style.borderColor = colors.pearl}
        onKeyDown={handleKeyDown}
      />
    );
  };

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.chestnut} 0%, ${colors.khaki} 100%)`,
        color: 'white',
        padding: '32px',
        borderRadius: '12px'
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          AI Use Case & ROI Toolkit
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
          Your complete guide to identifying, evaluating, and prioritizing AI opportunities for maximum business impact.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: Target, title: 'Identify Opportunities', desc: 'Discover high-impact AI use cases for your business' },
            { icon: Calculator, title: 'Calculate ROI', desc: 'Quantify the financial impact and business value' },
            { icon: TrendingUp, title: 'Prioritize Projects', desc: 'Make data-driven decisions on AI investments' }
          ].map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '16px',
              borderRadius: '8px'
            }}>
              <item.icon style={{ width: '32px', height: '32px', marginBottom: '8px' }} />
              <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', opacity: 0.8 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Step Process */}
      <div style={{
        backgroundColor: colors.bone,
        padding: '32px',
        borderRadius: '12px'
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: colors.charcoal
        }}>
          Your 5-Step AI Success Journey
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {[
            { step: 1, title: 'Define Goals', desc: 'Align AI with business objectives' },
            { step: 2, title: 'Explore Solutions', desc: 'Find the right AI technologies' },
            { step: 3, title: 'Data Strategy', desc: 'Ensure quality data foundation' },
            { step: 4, title: 'Implement & Iterate', desc: 'Deploy and continuously improve' },
            { step: 5, title: 'Measure Success', desc: 'Track ROI and celebrate wins' }
          ].map((item, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: colors.chestnut,
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontWeight: 'bold'
              }}>
                {item.step}
              </div>
              <h3 style={{ fontWeight: '600', marginBottom: '8px', color: colors.charcoal }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: colors.khaki }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Use This Toolkit */}
      <CardComponent>
        <h2 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          color: colors.charcoal
        }}>
          How to Use This Toolkit
        </h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{
            backgroundColor: colors.bone,
            padding: '20px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.chestnut}`
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px', color: colors.charcoal }}>
              📋 Step 1: Start with "Identify Use Cases"
            </h3>
            <p style={{ color: colors.khaki, marginBottom: '8px' }}>
              Begin by brainstorming and documenting potential AI applications in your business. Use the structured forms to capture:
            </p>
            <ul style={{ color: colors.khaki, paddingLeft: '20px' }}>
              <li>Business areas where AI could add value</li>
              <li>Specific use cases and their potential benefits</li>
              <li>Initial ROI potential assessment</li>
            </ul>
          </div>
          
          <div style={{
            backgroundColor: colors.bone,
            padding: '20px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.chestnut}`
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px', color: colors.charcoal }}>
              📝 Step 2: Complete the "Detailed Template"
            </h3>
            <p style={{ color: colors.khaki, marginBottom: '8px' }}>
              For your most promising use cases, fill out the comprehensive template covering:
            </p>
            <ul style={{ color: colors.khaki, paddingLeft: '20px' }}>
              <li>Strategic alignment with business goals</li>
              <li>Technical implementation approach</li>
              <li>Required resources and skills</li>
              <li>Risk assessment and mitigation strategies</li>
            </ul>
          </div>
          
          <div style={{
            backgroundColor: colors.bone,
            padding: '20px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.chestnut}`
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px', color: colors.charcoal }}>
              🧮 Step 3: Use the "ROI Calculator"
            </h3>
            <p style={{ color: colors.khaki, marginBottom: '8px' }}>
              Input your investment costs and expected benefits to calculate:
            </p>
            <ul style={{ color: colors.khaki, paddingLeft: '20px' }}>
              <li>Return on Investment (ROI) percentage</li>
              <li>Benefit-to-cost ratio</li>
              <li>Payback period estimates</li>
            </ul>
          </div>
          
          <div style={{
            backgroundColor: colors.bone,
            padding: '20px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.chestnut}`
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px', color: colors.charcoal }}>
              📊 Step 4: Apply the "ROI Framework"
            </h3>
            <p style={{ color: colors.khaki, marginBottom: '8px' }}>
              Use our proven framework to systematically evaluate impacts across:
            </p>
            <ul style={{ color: colors.khaki, paddingLeft: '20px' }}>
              <li>Cost savings and revenue generation</li>
              <li>Quality improvements and risk reduction</li>
              <li>Speed to market and competitive advantage</li>
            </ul>
          </div>
          
          <div style={{
            backgroundColor: colors.bone,
            padding: '20px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.chestnut}`
          }}>
            <h3 style={{ fontWeight: '600', marginBottom: '12px', color: colors.charcoal }}>
              🏢 Step 5: Review "Real Examples"
            </h3>
            <p style={{ color: colors.khaki, marginBottom: '8px' }}>
              Learn from actual case studies to:
            </p>
            <ul style={{ color: colors.khaki, paddingLeft: '20px' }}>
              <li>Understand successful implementation patterns</li>
              <li>Benchmark your ROI calculations</li>
              <li>Identify potential challenges and solutions</li>
            </ul>
          </div>
        </div>
        
        <div style={{
          backgroundColor: colors.chestnut,
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>💡 Pro Tips for Success</h3>
          <ul style={{ paddingLeft: '20px', opacity: 0.9 }}>
            <li>Work through the sections in order - each builds on the previous</li>
            <li>Save frequently - your progress is automatically tracked</li>
            <li>Be realistic with your ROI estimates - conservative projections are better</li>
            <li>Consider both quantitative and qualitative benefits</li>
            <li>Review and update your assessments as you learn more</li>
          </ul>
        </div>
      </CardComponent>

      {/* Get Started */}
      <CardComponent>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '8px' }}>Ready to Begin?</h3>
            <p style={{ color: colors.khaki }}>Start by identifying potential AI use cases in your organization</p>
          </div>
          <ButtonComponent onClick={() => setActiveSection('identify')}>
            Start Identifying Use Cases
          </ButtonComponent>
        </div>
      </CardComponent>
    </div>
  );

  const renderIdentifyUseCases = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{
        backgroundColor: colors.bone,
        padding: '24px',
        borderRadius: '12px'
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: colors.charcoal
        }}>
          Identify Your AI Use Cases
        </h2>
        <p style={{ color: colors.khaki, marginBottom: '24px' }}>
          Think about your organization's key business processes and challenges. List specific areas where AI could improve efficiency, decision-making, or customer experiences.
        </p>
        
        {/* Example Use Cases */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: Users, title: 'Customer Support', roi: 'High ROI', desc: 'AI-powered chatbots for handling common inquiries', benefits: 'Reduces response time, improves satisfaction, 24/7 availability' },
            { icon: BarChart3, title: 'Sales Forecasting', roi: 'Medium ROI', desc: 'Analyze historical data for accurate predictions', benefits: 'Better inventory management, optimized supply chain' },
            { icon: Settings, title: 'Predictive Maintenance', roi: 'High ROI', desc: 'Monitor equipment to predict failures', benefits: 'Reduce downtime, extend equipment lifespan' }
          ].map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.pearl}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <item.icon style={{ width: '20px', height: '20px', color: colors.chestnut, marginRight: '8px' }} />
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.title}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '12px',
                  backgroundColor: colors.chestnut,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {item.roi}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: colors.charcoal, marginBottom: '8px' }}>{item.desc}</p>
              <p style={{ fontSize: '12px', color: colors.khaki }}>{item.benefits}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Form */}
      <CardComponent>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: colors.charcoal }}>Your Use Cases</h3>
        
        {formData.useCases.map((useCase, index) => (
          <div key={index} style={{
            backgroundColor: colors.bone,
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontWeight: '600', color: colors.charcoal }}>Use Case #{index + 1}</h4>
              {formData.useCases.length > 1 && (
                <button
                  onClick={() => removeUseCase(index)}
                  style={{
                    color: colors.chestnut,
                    fontSize: '14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                  Business Area
                </label>
                <InputComponent
                  value={useCase.area}
                  onChange={(e) => updateFormData('useCases', 'area', e.target.value, index)}
                  placeholder="e.g., Customer Service, Operations, Sales"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                  ROI Potential
                </label>
                <select
                  value={useCase.roiPotential}
                  onChange={(e) => updateFormData('useCases', 'roiPotential', e.target.value, index)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.pearl}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                AI Use Case Description
              </label>
              <InputComponent
                value={useCase.useCase}
                onChange={(e) => updateFormData('useCases', 'useCase', e.target.value, index)}
                placeholder="Describe the specific AI solution you're considering..."
                rows={3}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Expected Benefits
              </label>
              <InputComponent
                value={useCase.benefits}
                onChange={(e) => updateFormData('useCases', 'benefits', e.target.value, index)}
                placeholder="What outcomes do you expect? (cost savings, efficiency gains, customer satisfaction, etc.)"
                rows={3}
              />
            </div>
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <ButtonComponent variant="secondary" onClick={addUseCase}>
            Add Another Use Case
          </ButtonComponent>
          <ButtonComponent onClick={() => setActiveSection('template')}>
            Continue to Detailed Template
          </ButtonComponent>
        </div>
      </CardComponent>
    </div>
  );

  const renderROICalculator = () => {
    const roiResults = calculateROI();
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{
          backgroundColor: colors.bone,
          padding: '24px',
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: colors.charcoal
          }}>
            ROI Calculator
          </h2>
          <p style={{ color: colors.khaki }}>
            Calculate the return on investment for your AI initiative to make data-driven decisions about implementation.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Input Form */}
          <CardComponent>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: colors.charcoal }}>Investment Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                  AI Initiative Name
                </label>
                <InputComponent
                  value={formData.roiAnalysis.initiative}
                  onChange={(e) => updateFormData('roiAnalysis', 'initiative', e.target.value)}
                  placeholder="e.g., AI-powered Customer Support Chatbot"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                  Initial Investment ($)
                </label>
                <InputComponent
                  type="number"
                  value={formData.roiAnalysis.investment}
                  onChange={(e) => updateFormData('roiAnalysis', 'investment', e.target.value)}
                  placeholder="Include development, integration, training costs"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                  Annual Benefits ($)
                </label>
                <InputComponent
                  type="number"
                  value={formData.roiAnalysis.benefits}
                  onChange={(e) => updateFormData('roiAnalysis', 'benefits', e.target.value)}
                  placeholder="Cost savings + revenue increases + efficiency gains"
                />
              </div>
            </div>
          </CardComponent>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* ROI Results */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.chestnut} 0%, ${colors.khaki} 100%)`,
              color: 'white',
              padding: '24px',
              borderRadius: '12px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>ROI Results</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{roiResults.roi}%</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Return on Investment</div>
                </div>
                
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${roiResults.ratio}</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Return per $1 Invested</div>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {roiResults.roi > 0 ? (
                  <p>✓ Positive ROI - This initiative shows strong financial returns</p>
                ) : (
                  <p>⚠ Negative ROI - Consider revising the approach or exploring other benefits</p>
                )}
              </div>
            </div>

            {/* ROI Interpretation */}
            <div style={{
              backgroundColor: colors.bone,
              padding: '24px',
              borderRadius: '12px'
            }}>
              <h4 style={{ fontWeight: 'bold', color: colors.charcoal, marginBottom: '12px' }}>ROI Interpretation Guide</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                {[
                  { color: '#10B981', label: '150%+ ROI:', desc: 'Excellent - High priority for implementation' },
                  { color: '#3B82F6', label: '50-150% ROI:', desc: 'Good - Consider for next phase' },
                  { color: '#F59E0B', label: '0-50% ROI:', desc: 'Marginal - Evaluate other benefits' },
                  { color: '#EF4444', label: 'Negative ROI:', desc: 'Reconsider - May have strategic value' }
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: item.color,
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}></div>
                    <span><strong>{item.label}</strong> {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <ButtonComponent variant="secondary" onClick={() => setActiveSection('identify')}>
            ← Back to Use Cases
          </ButtonComponent>
          <ButtonComponent onClick={() => setActiveSection('examples')}>
            See Real Examples →
          </ButtonComponent>
        </div>
      </div>
    );
  };

  const renderExamples = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{
        backgroundColor: colors.bone,
        padding: '24px',
        borderRadius: '12px'
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: colors.charcoal
        }}>
          Real-World AI ROI Examples
        </h2>
        <p style={{ color: colors.khaki }}>
          Learn from successful AI implementations across different industries and use cases.
        </p>
      </div>

      {/* Example Cases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {exampleUseCases.map((example, index) => (
          <CardComponent key={index}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '8px' }}>
                  {example.title}
                </h3>
                <p style={{ color: colors.khaki }}>{example.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.chestnut }}>{example.roi}%</div>
                <div style={{ fontSize: '14px', color: colors.khaki }}>ROI</div>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: colors.bone,
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '14px', color: colors.khaki, marginBottom: '4px' }}>Initial Investment</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.charcoal }}>
                  ${example.investment.toLocaleString()}
                </div>
              </div>
              
              <div style={{
                backgroundColor: colors.bone,
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '14px', color: colors.khaki, marginBottom: '4px' }}>Annual Benefits</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.charcoal }}>
                  ${example.benefits.toLocaleString()}
                </div>
              </div>
              
              <div style={{
                backgroundColor: colors.bone,
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '14px', color: colors.khaki, marginBottom: '4px' }}>Net Annual ROI</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.chestnut }}>
                  ${(example.benefits - example.investment).toLocaleString()}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => toggleCard(`example-${index}`)}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.chestnut,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View Detailed Outcomes
              {expandedCards[`example-${index}`] ? 
                <ChevronDown style={{ width: '16px', height: '16px' }} /> : 
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              }
            </button>
            
            {expandedCards[`example-${index}`] && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: colors.bone,
                borderRadius: '8px'
              }}>
                <h4 style={{ fontWeight: 'bold', color: colors.charcoal, marginBottom: '12px' }}>Key Outcomes:</h4>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {example.outcomes.map((outcome, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <CheckCircle style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: '#10B981', 
                        marginRight: '8px', 
                        marginTop: '2px',
                        flexShrink: 0 
                      }} />
                      <span style={{ fontSize: '14px', color: colors.charcoal }}>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardComponent>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <ButtonComponent variant="secondary" onClick={() => setActiveSection('roi-calculator')}>
          ← Back to Calculator
        </ButtonComponent>
        <ButtonComponent onClick={() => setActiveSection('overview')}>
          Start Over
        </ButtonComponent>
      </div>
    </div>
  );

  const renderDetailedTemplate = () => (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
          Detailed AI Use Case Template
        </h2>
        <p style={{ fontSize: '16px', color: colors.charcoal, lineHeight: '1.6', marginBottom: '24px' }}>
          Use this comprehensive template to thoroughly analyze and document your AI use cases. Complete each section to ensure a well-structured approach to your AI initiative.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        <CardComponent>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
            Strategic Foundation
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Strategic Goal
              </label>
              <InputComponent
                value={formData.detailedTemplate.strategicGoal}
                onChange={(e) => updateFormData('detailedTemplate', 'strategicGoal', e.target.value)}
                placeholder="What overarching business goal does this AI initiative support?"
                rows={2}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Specific Objective
              </label>
              <InputComponent
                value={formData.detailedTemplate.objective}
                onChange={(e) => updateFormData('detailedTemplate', 'objective', e.target.value)}
                placeholder="What specific, measurable outcome do you want to achieve?"
                rows={2}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Success Measures
              </label>
              <InputComponent
                value={formData.detailedTemplate.measures}
                onChange={(e) => updateFormData('detailedTemplate', 'measures', e.target.value)}
                placeholder="How will you measure success? What KPIs will you track?"
                rows={2}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Initiative Owner
              </label>
              <InputComponent
                value={formData.detailedTemplate.owner}
                onChange={(e) => updateFormData('detailedTemplate', 'owner', e.target.value)}
                placeholder="Who is responsible for this initiative?"
              />
            </div>
          </div>
        </CardComponent>

        <CardComponent>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
            Technical Implementation
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                AI Approach
              </label>
              <InputComponent
                value={formData.detailedTemplate.aiApproach}
                onChange={(e) => updateFormData('detailedTemplate', 'aiApproach', e.target.value)}
                placeholder="What AI/ML techniques will you use? (e.g., NLP, computer vision, predictive analytics)"
                rows={3}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Technology Requirements
              </label>
              <InputComponent
                value={formData.detailedTemplate.technology}
                onChange={(e) => updateFormData('detailedTemplate', 'technology', e.target.value)}
                placeholder="What platforms, tools, and infrastructure do you need?"
                rows={3}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Skills & Resources
              </label>
              <InputComponent
                value={formData.detailedTemplate.skills}
                onChange={(e) => updateFormData('detailedTemplate', 'skills', e.target.value)}
                placeholder="What skills, team members, or external resources are needed?"
                rows={3}
              />
            </div>
          </div>
        </CardComponent>

        <CardComponent>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
            Implementation & Risk Management
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Implementation Plan
              </label>
              <InputComponent
                value={formData.detailedTemplate.implementation}
                onChange={(e) => updateFormData('detailedTemplate', 'implementation', e.target.value)}
                placeholder="What are the key phases and milestones for implementation?"
                rows={3}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Ethical Considerations
              </label>
              <InputComponent
                value={formData.detailedTemplate.ethicalIssues}
                onChange={(e) => updateFormData('detailedTemplate', 'ethicalIssues', e.target.value)}
                placeholder="What ethical issues, bias concerns, or compliance requirements need attention?"
                rows={3}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Change Management
              </label>
              <InputComponent
                value={formData.detailedTemplate.changeManagement}
                onChange={(e) => updateFormData('detailedTemplate', 'changeManagement', e.target.value)}
                placeholder="How will you manage the change process and user adoption?"
                rows={3}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '500', color: colors.charcoal, marginBottom: '8px' }}>
                Additional Notes
              </label>
              <InputComponent
                value={formData.detailedTemplate.notes}
                onChange={(e) => updateFormData('detailedTemplate', 'notes', e.target.value)}
                placeholder="Any additional considerations, dependencies, or next steps?"
                rows={3}
              />
            </div>
          </div>
        </CardComponent>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <ButtonComponent variant="secondary" onClick={() => setActiveSection('identify')}>
          ← Back to Use Cases
        </ButtonComponent>
        <ButtonComponent onClick={() => setActiveSection('roi-calculator')}>
          Continue to ROI Calculator →
        </ButtonComponent>
      </div>
    </div>
  );

  const renderROIFramework = () => (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
          ROI Framework & Methodology
        </h2>
        <p style={{ fontSize: '16px', color: colors.charcoal, lineHeight: '1.6', marginBottom: '24px' }}>
          This framework helps you systematically evaluate and compare AI initiatives based on multiple ROI factors beyond just financial returns.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        <CardComponent>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
            ROI Evaluation Categories
          </h3>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {roiCategories.map((category) => (
              <div key={category.id} style={{ 
                border: `1px solid ${colors.pearl}`, 
                borderRadius: '8px', 
                padding: '16px',
                backgroundColor: colors.bone 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <category.icon style={{ width: '20px', height: '20px', color: category.color, marginRight: '8px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.charcoal, margin: 0 }}>
                    {category.title}
                  </h4>
                </div>
                <p style={{ fontSize: '14px', color: colors.charcoal, lineHeight: '1.5', margin: 0 }}>
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </CardComponent>

        <CardComponent>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
            ROI Calculation Methods
          </h3>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '12px' }}>
                1. Traditional Financial ROI
              </h4>
              <div style={{ backgroundColor: colors.bone, padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: colors.charcoal, fontFamily: 'monospace', textAlign: 'center' }}>
                  ROI = (Benefits - Investment) / Investment × 100
                </p>
              </div>
              <p style={{ fontSize: '14px', color: colors.charcoal, lineHeight: '1.5' }}>
                This is the standard financial return calculation. Benefits include cost savings, revenue increases, and efficiency gains. 
                Investment includes technology costs, implementation expenses, and ongoing operational costs.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '12px' }}>
                2. Weighted Multi-Factor ROI
              </h4>
              <div style={{ backgroundColor: colors.bone, padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: colors.charcoal, fontFamily: 'monospace', textAlign: 'center' }}>
                  Total ROI = Σ(Category Score × Weight) / Total Weight
                </p>
              </div>
              <p style={{ fontSize: '14px', color: colors.charcoal, lineHeight: '1.5' }}>
                This method considers multiple ROI categories (cost, revenue, quality, speed, etc.) with different weights 
                based on your organization's priorities. Each category is scored from 1-10.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '12px' }}>
                3. Risk-Adjusted ROI
              </h4>
              <div style={{ backgroundColor: colors.bone, padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: colors.charcoal, fontFamily: 'monospace', textAlign: 'center' }}>
                  Risk-Adjusted ROI = Expected ROI × (1 - Risk Factor)
                </p>
              </div>
              <p style={{ fontSize: '14px', color: colors.charcoal, lineHeight: '1.5' }}>
                This accounts for implementation risks, technology maturity, and organizational readiness. 
                Risk factors range from 0 (no risk) to 1 (maximum risk).
              </p>
            </div>
          </div>
        </CardComponent>

        <CardComponent>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.charcoal, marginBottom: '16px' }}>
            Implementation Timeline & Phases
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { phase: 'Phase 1', title: 'Planning & Assessment', duration: '2-4 weeks', description: 'Define objectives, assess readiness, and create detailed implementation plan' },
              { phase: 'Phase 2', title: 'Pilot Development', duration: '4-8 weeks', description: 'Develop and test AI solution with a small user group' },
              { phase: 'Phase 3', title: 'Limited Deployment', duration: '4-6 weeks', description: 'Deploy to broader user base and collect performance data' },
              { phase: 'Phase 4', title: 'Full Rollout', duration: '2-4 weeks', description: 'Company-wide deployment and ongoing optimization' }
            ].map((phase, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                padding: '16px',
                backgroundColor: colors.bone,
                borderRadius: '8px'
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: colors.chestnut, 
                  color: 'white', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.charcoal, margin: '0 0 4px 0' }}>
                    {phase.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: colors.khaki, fontWeight: '500', margin: '0 0 8px 0' }}>
                    {phase.duration}
                  </p>
                  <p style={{ fontSize: '14px', color: colors.charcoal, lineHeight: '1.5', margin: 0 }}>
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardComponent>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <ButtonComponent variant="secondary" onClick={() => setActiveSection('roi-calculator')}>
          ← Back to ROI Calculator
        </ButtonComponent>
        <ButtonComponent onClick={() => setActiveSection('examples')}>
          Continue to Examples →
        </ButtonComponent>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'identify': return renderIdentifyUseCases();
      case 'template': return renderDetailedTemplate();
      case 'roi-calculator': return renderROICalculator();
      case 'framework': return renderROIFramework();
      case 'examples': return renderExamples();
      default: return renderOverview();
    }
  };

  return (
    <div style={{
      fontFamily: 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: colors.bone,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: colors.charcoal,
        color: 'white',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h1 style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0
          }}>
            AI Use Case & ROI Toolkit
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: colors.pearl }}>
              Progress: {Math.round((sections.findIndex(s => s.id === activeSection) + 1) / sections.length * 100)}%
            </span>
            <div style={{
              width: '128px',
              height: '8px',
              backgroundColor: colors.khaki,
              borderRadius: '4px'
            }}>
              <div style={{
                width: `${(sections.findIndex(s => s.id === activeSection) + 1) / sections.length * 100}%`,
                height: '100%',
                backgroundColor: colors.chestnut,
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex'
      }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: '256px',
          backgroundColor: 'white',
          borderRight: `1px solid ${colors.pearl}`,
          minHeight: 'calc(100vh - 68px)',
          padding: '24px',
          position: 'sticky',
          top: '68px'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: isActive ? colors.chestnut : 'transparent',
                    color: isActive ? 'white' : colors.charcoal,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = colors.bone;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon style={{ 
                    width: '16px', 
                    height: '16px', 
                    marginRight: '12px',
                    color: isActive ? 'white' : colors.chestnut
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{section.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px' }}>
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: colors.charcoal,
        color: 'white',
        padding: '24px',
        marginTop: '48px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: colors.pearl,
            marginBottom: '12px'
          }}>
            Need help with your AI implementation? Our experts are here to guide you through every step.
          </p>
          <button style={{
            backgroundColor: colors.chestnut,
            color: 'white',
            padding: '8px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Schedule a Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIUseCaseROIToolkit;