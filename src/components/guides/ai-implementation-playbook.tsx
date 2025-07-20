import React from 'react';
import { Target, Users, Cog, TrendingUp, Book, FileText, Circle, Trash2, Plus } from 'lucide-react';
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
  Checklist 
} from './StandardComponents';

const AIImplementationPlaybook = () => {
  const guideId = 'AIImplementationPlaybook';
  const initialFormData = {
    // Project Planning Data
    ideationResults: [],
    selectedIdea: '',
    projectDescription: '',
    approach: '',
    resources: '',
    successMeasurement: '',
    
    // Leadership Assessment Data
    communications: '',
    virtualAssistants: '',
    workforceManagement: '',
    onboardingTraining: '',
    decisionMaking: '',
    
    // Framework Implementation Data
    stakeholders: [],
    aiLeadership: {},
    portfolio: {
      useCases: [],
      pilots: [],
      testDeployments: [],
      rollouts: []
    }
  };
  
  const initialExpandedSections = ['overview', 'ideation-results', 'phase-1', 'head-of-ai', '30-day-plan'];


  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'assessment', label: 'AI Readiness', icon: Target },
    { id: 'planning', label: 'Project Planning', icon: FileText },
    { id: 'framework', label: 'Implementation Framework', icon: Cog },
    { id: 'leadership', label: 'Leading with AI', icon: Users },
    { id: 'roadmap', label: 'Action Roadmap', icon: TrendingUp }
  ];


  const renderOverview = ({ 
    completedSections, 
    markSectionComplete 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="AI Implementation Playbook"
        description="A comprehensive guide to implementing AI in your organization with confidence and strategic focus."
        isCompleted={completedSections.has('overview')}
        onToggleComplete={() => markSectionComplete('overview')}
      >
        <ProgressIndicator completed={completedSections.size} total={6} />
        <InfoBox type="info" title="🎯 How to Use This Guide">
          <div className="text-sm space-y-1">
            <p>• <strong>Work through each section sequentially</strong> - they build upon each other</p>
            <p>• <strong>Fill out all forms completely</strong> - your responses are automatically saved</p>
            <p>• <strong>Mark sections complete</strong> when finished to track your progress</p>
            <p>• <strong>Use the export function</strong> to save your completed plan</p>
          </div>
        </InfoBox>
      </SectionHeader>

      <GridLayout cols={2} gap={6}>
        <Card>
          <ImagePlaceholder text="[AI Strategy Visualization Image]" className="w-full h-48 mb-4" />
          <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Playfair Display' }}>
            Strategic AI Implementation
          </h3>
          <p className="text-gray-600">
            Move beyond basic AI adoption to strategic implementation that drives real business value and competitive advantage.
          </p>
        </Card>

        <div className="space-y-4">
          <InfoBox type="info" title="What You'll Achieve">
            <ul className="space-y-1 text-sm">
              <li>• Clear AI implementation roadmap</li>
              <li>• Risk mitigation strategies</li>
              <li>• Stakeholder engagement framework</li>
              <li>• Measurable success metrics</li>
              <li>• Leadership readiness assessment</li>
            </ul>
          </InfoBox>

          <InfoBox type="warning" title="Time Investment">
            <p className="text-sm">
              Plan for 2-4 hours to complete the full assessment and planning process. 
              Work can be saved and resumed at any time.
            </p>
          </InfoBox>
        </div>
      </GridLayout>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Implementation Phases</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { phase: '1', title: 'Assessment', desc: 'Evaluate AI readiness and current state' },
            { phase: '2', title: 'Planning', desc: 'Define projects and success metrics' },
            { phase: '3', title: 'Pilot', desc: 'Test and validate AI solutions' },
            { phase: '4', title: 'Scale', desc: 'Roll out across organization' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2"
                style={{ backgroundColor: '#A44A3F' }}
              >
                {item.phase}
              </div>
              <h4 className="font-medium mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssessment = ({ 
    formData, 
    updateFormData, 
    completedSections, 
    markSectionComplete 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="AI Readiness Assessment"
        description="Evaluate your organization's current AI capabilities and identify opportunities for strategic implementation."
        isCompleted={completedSections.has('assessment')}
        onToggleComplete={() => markSectionComplete('assessment')}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Current AI Usage Evaluation</h3>
          
          <FormField
            label="1. Communications and Collaborations with Remote Teams"
            type="textarea"
            value={formData.communications}
            onChange={(value) => updateFormData('communications', value)}
            placeholder="Describe how your organization currently uses AI tools for communication and collaboration (e.g., Zoom AI features, Slack automation, Teams intelligence)..."
            rows={3}
          />

          <FormField
            label="2. Virtual Assistants"
            type="textarea"
            value={formData.virtualAssistants}
            onChange={(value) => updateFormData('virtualAssistants', value)}
            placeholder="Detail any virtual assistants or chatbots currently in use for customer service or internal support..."
            rows={3}
          />

          <FormField
            label="3. Remote Workforce Management"
            type="textarea"
            value={formData.workforceManagement}
            onChange={(value) => updateFormData('workforceManagement', value)}
            placeholder="Explain AI tools used for managing remote employees, productivity tracking, or performance analytics..."
            rows={3}
          />
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <ImagePlaceholder text="[AI Readiness Dashboard Image]" className="w-full h-32 mb-4" />
            <h4 className="font-semibold mb-2">Assessment Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Be honest about current capabilities</li>
              <li>• Include informal AI usage</li>
              <li>• Note employee resistance or enthusiasm</li>
              <li>• Consider data quality and availability</li>
            </ul>
          </div>

          <FormField
            label="4. Virtual Onboarding and Training"
            type="textarea"
            value={formData.onboardingTraining}
            onChange={(value) => updateFormData('onboardingTraining', value)}
            placeholder="Describe AI-powered training platforms, personalized learning paths, or automated onboarding processes..."
            rows={3}
          />

          <FormField
            label="5. Enhanced Decision Making"
            type="textarea"
            value={formData.decisionMaking}
            onChange={(value) => updateFormData('decisionMaking', value)}
            placeholder="Detail any AI models or analytics tools used to support business decisions, forecasting, or strategic planning..."
            rows={3}
          />
        </div>
      </div>

      <InfoBox type="info" title="Readiness Scoring">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">Basic</div>
            <p className="text-sm">Limited AI usage, mostly consumer tools</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">Intermediate</div>
            <p className="text-sm">Some integrated AI tools, exploring opportunities</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">Advanced</div>
            <p className="text-sm">Strategic AI implementation across multiple areas</p>
          </div>
        </div>
      </InfoBox>
    </div>
  );

  const renderPlanning = ({ 
    formData, 
    setFormData, 
    addArrayItem, 
    removeArrayItem, 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="AI Project Planning"
        description="Develop a comprehensive plan for your first strategic AI implementation project."
        isCompleted={completedSections.has('planning')}
        onToggleComplete={() => markSectionComplete('planning')}
      />

      <CollapsibleSection 
        title="Ideation Results" 
        defaultOpen={true} 
        sectionId="ideation-results"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            List all AI project ideas generated during your brainstorming session. Don't filter yet - capture everything.
          </p>
          
          <ArrayInput
            items={formData.ideationResults || []}
            onAdd={() => addArrayItem('ideationResults', '')}
            onRemove={(index) => removeArrayItem('ideationResults', index)}
            onUpdate={(index, value) => {
              const newIdeas = [...(formData.ideationResults || [])];
              newIdeas[index] = value;
              setFormData(prev => ({ ...prev, ideationResults: newIdeas }));
            }}
            placeholder="AI project idea..."
            addButtonText="Add Idea"
          />
        </div>

        <InfoBox type="warning" title="Sample AI Project Ideas">
          <GridLayout cols={2} gap={2}>
            <ul className="space-y-1 text-sm">
              <li>• AI-powered customer service chatbot</li>
              <li>• Automated content generation for marketing</li>
              <li>• Intelligent document processing</li>
              <li>• Predictive analytics for inventory</li>
            </ul>
            <ul className="space-y-1 text-sm">
              <li>• AI-enhanced recruitment screening</li>
              <li>• Dynamic pricing optimization</li>
              <li>• Automated meeting summaries</li>
              <li>• Personalized customer recommendations</li>
            </ul>
          </GridLayout>
        </InfoBox>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Selected Project Details" 
        sectionId="selected-project"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <FormField
          label="Selected AI Project Idea"
          value={formData.selectedIdea}
          onChange={(value) => setFormData(prev => ({ ...prev, selectedIdea: value }))}
          placeholder="Choose the AI project idea you want to develop further..."
          required
        />

        <FormField
          label="Project Description"
          type="textarea"
          value={formData.projectDescription}
          onChange={(value) => setFormData(prev => ({ ...prev, projectDescription: value }))}
          placeholder="Identify the problem this project solves and how it will solve it. Be specific about the business impact and user benefits..."
          rows={4}
          required
        />

        <FormField
          label="Implementation Approach"
          type="textarea"
          value={formData.approach}
          onChange={(value) => setFormData(prev => ({ ...prev, approach: value }))}
          placeholder="Describe your plan for creating this AI solution. Include technology choices, development phases, and key milestones..."
          rows={4}
        />

        <FormField
          label="Required Resources"
          type="textarea"
          value={formData.resources}
          onChange={(value) => setFormData(prev => ({ ...prev, resources: value }))}
          placeholder="List the resources needed: team members, technology platforms, data sources, budget, external vendors..."
          rows={3}
        />

        <FormField
          label="Success Measurement"
          type="textarea"
          value={formData.successMeasurement}
          onChange={(value) => setFormData(prev => ({ ...prev, successMeasurement: value }))}
          placeholder="Define how you'll measure success: KPIs, metrics, timeframes, and specific targets..."
          rows={3}
        />
      </CollapsibleSection>

      <InfoBox type="success" title="Project Validation Checklist">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Business Impact</h4>
            <ul className="text-sm space-y-1">
              <li>☐ Addresses a real business problem</li>
              <li>☐ Has quantifiable benefits</li>
              <li>☐ Aligns with organizational goals</li>
              <li>☐ Stakeholder buy-in secured</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Technical Feasibility</h4>
            <ul className="text-sm space-y-1">
              <li>☐ Required data is available</li>
              <li>☐ Technology solutions exist</li>
              <li>☐ Team has necessary skills</li>
              <li>☐ Realistic timeline defined</li>
            </ul>
          </div>
        </div>
      </InfoBox>
    </div>
  );

  const renderFramework = ({ 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Implementation Framework"
        description="Follow Dr. Glassman's proven framework for managing company-wide AI programs through systematic phases."
        isCompleted={completedSections.has('framework')}
        onToggleComplete={() => markSectionComplete('framework')}
      />

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#A44A3F' }} />
          <h3 className="font-semibold mb-2">Stakeholders</h3>
          <p className="text-sm text-gray-600">Identify and engage key stakeholders who will support and guide your AI initiatives.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <Target className="w-12 h-12 mx-auto mb-4" style={{ color: '#A44A3F' }} />
          <h3 className="font-semibold mb-2">AI Leadership</h3>
          <p className="text-sm text-gray-600">Establish leadership structure, ethics, risk management, and compliance frameworks.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: '#A44A3F' }} />
          <h3 className="font-semibold mb-2">AI Portfolio</h3>
          <p className="text-sm text-gray-600">Manage pipeline from use cases through pilots to company-wide rollouts.</p>
        </div>
      </div>

      <CollapsibleSection 
        title="Phase 1: Use Case Exploration & Validation" 
        defaultOpen={true} 
        sectionId="phase-1"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <InfoBox type="purple" title="Objectives">
          <ul className="text-sm space-y-1">
            <li>• Identify and document specific AI use cases</li>
            <li>• Develop comprehensive business cases</li>
            <li>• Engage stakeholders for feedback and validation</li>
            <li>• Research technology requirements and feasibility</li>
          </ul>
        </InfoBox>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Key Activities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Opportunity mapping workshops</li>
              <li>• Technology research and evaluation</li>
              <li>• Business case development</li>
              <li>• Stakeholder presentations</li>
              <li>• Priority ranking and selection</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Success Criteria</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clear, measurable use cases defined</li>
              <li>• ROI projections documented</li>
              <li>• Technology solutions identified</li>
              <li>• Stakeholder approval secured</li>
              <li>• Next phase roadmap created</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Phase 2: Pilot Projects (Proof of Concept)" 
        sectionId="phase-2"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <InfoBox type="info" title="Critical Focus Areas">
          <ul className="text-sm space-y-1">
            <li>• Technology validation and testing</li>
            <li>• Learning goals and success metrics</li>
            <li>• Risk assessment and edge case testing</li>
            <li>• User feedback and adoption patterns</li>
          </ul>
        </InfoBox>

        <InfoBox type="warning" title="⚠️ Important Considerations">
          <p className="text-sm">
            Conduct pilots separately from core operations. AI systems are "black boxes" - extensive testing with edge cases is essential. 
            Never skip directly from use case to company-wide rollout.
          </p>
        </InfoBox>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Phase 3: Test Deployments" 
        sectionId="phase-3"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Limited test deployment with integrated evangelists, project management, stakeholders, governance, and formal KPIs.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Governance Requirements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Designated application owner</li>
                <li>• Legal frameworks and policies</li>
                <li>• User training and guidelines</li>
                <li>• Incident response procedures</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">KPI Collection</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated usage tracking</li>
                <li>• User feedback interviews</li>
                <li>• Performance metrics monitoring</li>
                <li>• Adoption rate analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Phase 4: Company-Wide Rollout" 
        sectionId="phase-4"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="space-y-4">
          <InfoBox type="success" title="Change Management Strategy">
            <p className="text-sm mb-2">Use Kotter's 8-Step Change Model for effective implementation:</p>
            <ul className="text-sm space-y-1">
              <li>• Create urgency and vision</li>
              <li>• Build guiding coalition</li>
              <li>• Develop comprehensive communication plans</li>
              <li>• Implement incentive structures</li>
              <li>• Monitor and adjust continuously</li>
            </ul>
          </InfoBox>

          <InfoBox type="error" title="Risk Management">
            <p className="text-sm">
              AI systems may behave differently at scale. Be prepared to pause rollout and reassess if unexpected behavior occurs. 
              Continuous monitoring is essential for maintaining integrity and effectiveness.
            </p>
          </InfoBox>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderLeadership = ({ 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Leading with AI"
        description="Develop the leadership capabilities and organizational structure needed for successful AI implementation."
        isCompleted={completedSections.has('leadership')}
        onToggleComplete={() => markSectionComplete('leadership')}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
              [AI Leadership Team Image]
            </div>
            <h3 className="font-semibold mb-2">AI Leadership Structure</h3>
            <p className="text-sm text-gray-600">
              Establish clear roles and responsibilities for AI governance, from Head of AI to cross-functional stakeholders.
            </p>
          </div>

          <CollapsibleSection 
            title="Head of AI Role" 
            defaultOpen={true} 
            sectionId="head-of-ai"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <div className="space-y-4">
              <InfoBox type="info" title="Key Qualifications">
                <ul className="text-sm space-y-1">
                  <li>• AI/ML expertise, especially generative AI</li>
                  <li>• Cross-industry knowledge applicability</li>
                  <li>• Change management capabilities</li>
                  <li>• Innovation and resource gathering skills</li>
                </ul>
              </InfoBox>

              <InfoBox type="warning" title="⚠️ Hiring Strategy">
                <p className="text-sm">
                  Resist the urge to hire internally or within your industry. Seek AI experts whose knowledge 
                  transcends industry boundaries and advances rapidly.
                </p>
              </InfoBox>
            </div>
          </CollapsibleSection>
        </div>

        <div>
          <CollapsibleSection 
            title="AI Research Component" 
            sectionId="ai-research"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                AI research is vital due to unprecedented speed of technological advancement. Track multiple research areas 
                to identify developments that aid company-specific initiatives.
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Research Focus Areas</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Emerging AI technologies and capabilities</li>
                  <li>• Vendor solution evaluations</li>
                  <li>• Industry-specific AI applications</li>
                  <li>• Risk mitigation strategies</li>
                  <li>• Regulatory and compliance updates</li>
                </ul>
              </div>

              <InfoBox type="warning" title="Research Methods">
                <p className="text-sm">
                  Academic research becomes outdated quickly in AI. Adopt informal research methods and 
                  evaluate vendor solutions with focus on rapid development pace.
                </p>
              </InfoBox>
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="Ethics & Risk Management" 
            sectionId="ethics-risk"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <div className="space-y-4">
              <InfoBox type="error" title="Core Risk Areas">
                <ul className="text-sm space-y-1">
                  <li>• Data privacy and security breaches</li>
                  <li>• Biased or discriminatory outputs</li>
                  <li>• Regulatory compliance violations</li>
                  <li>• Intellectual property concerns</li>
                  <li>• Operational dependencies and failures</li>
                </ul>
              </InfoBox>

              <InfoBox type="success" title="Mitigation Strategies">
                <ul className="text-sm space-y-1">
                  <li>• Comprehensive policy development</li>
                  <li>• Extensive edge case testing</li>
                  <li>• Limited initial use cases</li>
                  <li>• User training and limitations awareness</li>
                  <li>• Software-based safeguards</li>
                </ul>
              </InfoBox>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      <CollapsibleSection 
        title="Stakeholder Engagement Strategy" 
        sectionId="stakeholder-engagement"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-4">Internal Stakeholders</h4>
            <div className="space-y-2">
              {['C-Suite Executive', 'Department Head', 'Technology Lead', 'Project Manager'].map((role, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`${role} name and role`}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <button className="p-1 text-gray-500 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <Plus size={14} />
              <span>Add Stakeholder</span>
            </button>
          </div>

          <div>
            <h4 className="font-medium mb-4">External Stakeholders</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-sm mb-2">Selection Criteria</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• No conflicts of interest</li>
                <li>• Constructive feedback capability</li>
                <li>• Genuine advocacy interest</li>
                <li>• Relevant industry experience</li>
                <li>• Strategic networking value</li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderRoadmap = ({ 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Your AI Implementation Roadmap"
        description="A personalized action plan based on your assessment and planning inputs."
        isCompleted={completedSections.has('roadmap')}
        onToggleComplete={() => markSectionComplete('roadmap')}
      />

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">30</span>
          </div>
          <h3 className="font-semibold mb-1">Next 30 Days</h3>
          <p className="text-sm text-gray-600">Foundation & Assessment</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-green-600">90</span>
          </div>
          <h3 className="font-semibold mb-1">Next 90 Days</h3>
          <p className="text-sm text-gray-600">Pilot Implementation</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-purple-600">6M</span>
          </div>
          <h3 className="font-semibold mb-1">Next 6 Months</h3>
          <p className="text-sm text-gray-600">Scale & Optimize</p>
        </div>
      </div>

      <CollapsibleSection 
        title="30-Day Foundation Plan" 
        defaultOpen={true} 
        sectionId="30-day-plan"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="space-y-4">
          <InfoBox type="info" title="Week 1-2: Organization & Assessment">
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Complete comprehensive AI readiness assessment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Identify and recruit key stakeholders</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Establish AI leadership structure</span>
                </li>
              </ul>
              <ul className="text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Define initial budget and resource allocation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Research industry AI trends and opportunities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Conduct initial stakeholder alignment meeting</span>
                </li>
              </ul>
            </div>
          </InfoBox>

          <InfoBox type="success" title="Week 3-4: Planning & Prioritization">
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Facilitate use case ideation workshops</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Develop business cases for top 3-5 use cases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Technology research and vendor evaluation</span>
                </li>
              </ul>
              <ul className="text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Select first pilot project</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Create detailed project timeline</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Circle size={12} className="mt-1 flex-shrink-0" />
                  <span>Establish success metrics and KPIs</span>
                </li>
              </ul>
            </div>
          </InfoBox>
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="90-Day Pilot Implementation" 
        sectionId="90-day-pilot"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="space-y-4">
          <InfoBox type="purple" title="Month 2: Proof of Concept Development">
            <ul className="text-sm space-y-2">
              <li>• Set up development environment and data sources</li>
              <li>• Build and test initial AI solution</li>
              <li>• Conduct extensive edge case testing</li>
              <li>• Gather initial user feedback and iterate</li>
              <li>• Document learning outcomes and technical findings</li>
            </ul>
          </InfoBox>

          <InfoBox type="warning" title="Month 3: Limited Test Deployment">
            <ul className="text-sm space-y-2">
              <li>• Deploy to small group of power users</li>
              <li>• Implement governance policies and training</li>
              <li>• Monitor usage patterns and performance metrics</li>
              <li>• Conduct regular feedback sessions</li>
              <li>• Prepare for scale decision and next phase planning</li>
            </ul>
          </InfoBox>
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="6-Month Scale & Optimize Plan" 
        sectionId="6-month-scale"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InfoBox type="info" title="Months 4-5: Scaling Preparation">
              <ul className="text-sm space-y-1">
                <li>• Develop change management strategy</li>
                <li>• Create comprehensive training programs</li>
                <li>• Establish support and maintenance processes</li>
                <li>• Plan communication and incentive campaigns</li>
              </ul>
            </InfoBox>

            <InfoBox type="success" title="Month 6: Company-Wide Rollout">
              <ul className="text-sm space-y-1">
                <li>• Execute phased rollout plan</li>
                <li>• Monitor adoption and performance closely</li>
                <li>• Address issues and resistance quickly</li>
                <li>• Measure and report on ROI achievement</li>
              </ul>
            </InfoBox>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold mb-4">Success Milestones</h4>
            <div className="space-y-3">
              {[
                { milestone: 'Stakeholder alignment achieved', target: '30 days' },
                { milestone: 'First pilot successfully tested', target: '90 days' },
                { milestone: 'User adoption rate >70%', target: '120 days' },
                { milestone: 'Measurable ROI demonstrated', target: '150 days' },
                { milestone: 'Second AI project initiated', target: '180 days' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-sm">{item.milestone}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded">
                    {item.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <InfoBox type="success" title="🎯 Your Next Actions">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">This Week</h4>
            <ul className="text-sm space-y-1">
              <li>• Schedule stakeholder alignment meeting</li>
              <li>• Begin Head of AI recruitment process</li>
              <li>• Document current AI tool inventory</li>
              <li>• Set up project tracking system</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">This Month</h4>
            <ul className="text-sm space-y-1">
              <li>• Complete full readiness assessment</li>
              <li>• Finalize first pilot project selection</li>
              <li>• Establish AI governance framework</li>
              <li>• Begin vendor evaluation process</li>
            </ul>
          </div>
        </div>
      </InfoBox>
    </div>
  );


  const renderContent = (activeTab, helpers) => {
    switch(activeTab) {
      case 'overview':
        return renderOverview(helpers);
      case 'assessment':
        return renderAssessment(helpers);
      case 'planning':
        return renderPlanning(helpers);
      case 'framework':
        return renderFramework(helpers);
      case 'leadership':
        return renderLeadership(helpers);
      case 'roadmap':
        return renderRoadmap(helpers);
      default:
        return renderOverview(helpers);
    }
  };

  return (
    <GuideTemplate
      guideId={guideId}
      title="AI Implementation Playbook"
      description="Your comprehensive guide to implementing AI with confidence"
      tabs={tabs}
      renderContent={renderContent}
      initialFormData={initialFormData}
      initialExpandedSections={initialExpandedSections}
    />
  );
};

export default AIImplementationPlaybook;