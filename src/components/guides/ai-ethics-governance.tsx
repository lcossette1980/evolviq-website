import React from 'react';
import { Shield, Users, Eye, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
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

const AIEthicsGovernance = () => {
  const guideId = 'AIEthicsGovernance';
  const initialFormData = {
    // Ethics Framework
    ethicsPolicy: '',
    biasAndFairness: '',
    transparency: '',
    accountability: '',
    dataPrivacy: '',
    humanOversight: '',
    
    // Governance Structure
    governanceModel: '',
    stakeholders: [],
    reviewProcess: '',
    complianceFramework: '',
    incidentResponse: '',
    
    // Risk Management
    riskAssessment: [],
    mitigationStrategies: [],
    monitoringPlan: '',
    auditSchedule: '',
    
    // Training and Communication
    trainingProgram: '',
    communicationPlan: '',
    reportingMechanism: '',
    feedbackLoop: ''
  };
  
  const initialExpandedSections = ['overview', 'ethics-framework', 'governance-structure'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'ethics', label: 'Ethics Framework', icon: Eye },
    { id: 'governance', label: 'Governance Structure', icon: Users },
    { id: 'risk-management', label: 'Risk Management', icon: AlertTriangle },
    { id: 'implementation', label: 'Implementation Plan', icon: FileText }
  ];

  const renderOverview = ({ 
    completedSections, 
    markSectionComplete 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="AI Ethics & Governance Framework"
        description="Establish responsible AI practices, governance structures, and ethical guidelines for your organization."
        isCompleted={completedSections.has('overview')}
        onToggleComplete={() => markSectionComplete('overview')}
      >
        <ProgressIndicator completed={completedSections.size} total={5} />
        <InfoBox type="info" title="🛡️ Why AI Ethics & Governance Matters">
          <ul className="text-sm space-y-1">
            <li>• <strong>Risk Mitigation:</strong> Prevent bias, discrimination, and harmful outcomes</li>
            <li>• <strong>Regulatory Compliance:</strong> Meet evolving AI regulations and standards</li>
            <li>• <strong>Trust Building:</strong> Establish transparency and accountability</li>
            <li>• <strong>Sustainable Innovation:</strong> Enable responsible AI development at scale</li>
          </ul>
        </InfoBox>
      </SectionHeader>

      <GridLayout cols={2} gap={6}>
        <Card>
          <ImagePlaceholder text="[AI Ethics Visualization]" className="w-full h-48 mb-4" />
          <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Playfair Display' }}>
            Responsible AI Foundation
          </h3>
          <p className="text-gray-600">
            Build ethical AI systems that align with your organization's values and societal expectations 
            while maintaining competitive advantage and innovation capabilities.
          </p>
        </Card>

        <div className="space-y-4">
          <InfoBox type="success" title="Framework Components">
            <ul className="space-y-1 text-sm">
              <li>• Comprehensive ethics policy</li>
              <li>• Governance and oversight structure</li>
              <li>• Risk assessment and mitigation</li>
              <li>• Monitoring and audit processes</li>
              <li>• Training and awareness programs</li>
            </ul>
          </InfoBox>

          <InfoBox type="warning" title="Implementation Timeline">
            <p className="text-sm">
              Plan for 4-6 weeks to develop your initial framework, with ongoing refinement 
              as you implement AI solutions and gather experience.
            </p>
          </InfoBox>
        </div>
      </GridLayout>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Principles</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { principle: 'Fairness', desc: 'Prevent bias and ensure equitable outcomes', icon: '⚖️' },
            { principle: 'Transparency', desc: 'Provide clear explanations of AI decisions', icon: '🔍' },
            { principle: 'Accountability', desc: 'Establish clear responsibility and oversight', icon: '📋' },
            { principle: 'Privacy', desc: 'Protect personal data and respect rights', icon: '🔒' }
          ].map((item, index) => (
            <div key={index} className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-medium mb-1">{item.principle}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEthics = ({ 
    formData, 
    updateFormData, 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Ethics Framework Development"
        description="Define ethical principles, policies, and guidelines for responsible AI implementation."
        isCompleted={completedSections.has('ethics')}
        onToggleComplete={() => markSectionComplete('ethics')}
      />

      <CollapsibleSection 
        title="Core Ethics Policy" 
        defaultOpen={true} 
        sectionId="ethics-policy"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <FormField
          label="Organizational AI Ethics Policy"
          type="textarea"
          value={formData.ethicsPolicy}
          onChange={(value) => updateFormData('ethicsPolicy', value)}
          placeholder="Define your organization's overarching AI ethics policy. Include core values, principles, and commitments to responsible AI use..."
          rows={6}
          required
        />

        <InfoBox type="info" title="Policy Framework Template">
          <div className="text-sm space-y-2">
            <p><strong>1. Purpose & Scope:</strong> Define why this policy exists and what it covers</p>
            <p><strong>2. Core Principles:</strong> List your fundamental ethical commitments</p>
            <p><strong>3. Prohibited Uses:</strong> Clearly state what AI applications are not allowed</p>
            <p><strong>4. Compliance Requirements:</strong> Detail how adherence will be ensured</p>
          </div>
        </InfoBox>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Bias and Fairness" 
        sectionId="bias-fairness"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <FormField
          label="Bias Prevention and Fairness Measures"
          type="textarea"
          value={formData.biasAndFairness}
          onChange={(value) => updateFormData('biasAndFairness', value)}
          placeholder="Describe specific measures to identify, prevent, and mitigate bias in AI systems. Include data collection practices, testing procedures, and fairness metrics..."
          rows={4}
        />

        <InfoBox type="warning" title="Common Bias Sources">
          <ul className="text-sm space-y-1">
            <li>• <strong>Training Data:</strong> Historical biases in datasets</li>
            <li>• <strong>Algorithm Design:</strong> Inherent model limitations</li>
            <li>• <strong>Feature Selection:</strong> Proxy variables that correlate with protected attributes</li>
            <li>• <strong>Deployment Context:</strong> Different performance across user groups</li>
          </ul>
        </InfoBox>
      </CollapsibleSection>

      <GridLayout cols={2} gap={6}>
        <CollapsibleSection 
          title="Transparency and Explainability" 
          sectionId="transparency"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="AI Transparency Standards"
            type="textarea"
            value={formData.transparency}
            onChange={(value) => updateFormData('transparency', value)}
            placeholder="Define requirements for AI system transparency, including when and how to explain AI decisions to users and stakeholders..."
            rows={4}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Accountability Framework" 
          sectionId="accountability"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Accountability and Responsibility"
            type="textarea"
            value={formData.accountability}
            onChange={(value) => updateFormData('accountability', value)}
            placeholder="Establish clear lines of responsibility for AI system outcomes, including roles, decision-making authority, and escalation procedures..."
            rows={4}
          />
        </CollapsibleSection>
      </GridLayout>

      <GridLayout cols={2} gap={6}>
        <CollapsibleSection 
          title="Data Privacy and Security" 
          sectionId="data-privacy"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Data Privacy Protection"
            type="textarea"
            value={formData.dataPrivacy}
            onChange={(value) => updateFormData('dataPrivacy', value)}
            placeholder="Detail data privacy protections, including consent management, data minimization, purpose limitation, and user rights..."
            rows={4}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Human Oversight Requirements" 
          sectionId="human-oversight"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Human-in-the-Loop Controls"
            type="textarea"
            value={formData.humanOversight}
            onChange={(value) => updateFormData('humanOversight', value)}
            placeholder="Define when and how human oversight is required, including review processes, intervention capabilities, and decision checkpoints..."
            rows={4}
          />
        </CollapsibleSection>
      </GridLayout>
    </div>
  );

  const renderGovernance = ({ 
    formData, 
    setFormData, 
    updateFormData, 
    addArrayItem, 
    removeArrayItem, 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Governance Structure"
        description="Establish organizational structures, roles, and processes for AI governance and oversight."
        isCompleted={completedSections.has('governance')}
        onToggleComplete={() => markSectionComplete('governance')}
      />

      <CollapsibleSection 
        title="Governance Model" 
        defaultOpen={true} 
        sectionId="governance-model"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <FormField
          label="AI Governance Structure"
          type="textarea"
          value={formData.governanceModel}
          onChange={(value) => updateFormData('governanceModel', value)}
          placeholder="Describe your AI governance structure, including committees, reporting relationships, decision-making processes, and integration with existing governance..."
          rows={5}
          required
        />

        <InfoBox type="info" title="Recommended Governance Bodies">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">AI Ethics Committee</h4>
              <ul className="space-y-1">
                <li>• Review high-risk AI applications</li>
                <li>• Provide ethical guidance</li>
                <li>• Investigate complaints</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Risk Board</h4>
              <ul className="space-y-1">
                <li>• Oversee risk management</li>
                <li>• Approve AI system deployments</li>
                <li>• Monitor compliance</li>
              </ul>
            </div>
          </div>
        </InfoBox>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Key Stakeholders" 
        sectionId="stakeholders"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Identify key stakeholders who will participate in AI governance and their roles.
          </p>
          
          <ArrayInput
            items={formData.stakeholders || []}
            onAdd={() => addArrayItem('stakeholders', { name: '', role: '', responsibilities: '' })}
            onRemove={(index) => removeArrayItem('stakeholders', index)}
            onUpdate={(index, field, value) => {
              const newStakeholders = [...(formData.stakeholders || [])];
              newStakeholders[index] = { ...newStakeholders[index], [field]: value };
              setFormData(prev => ({ ...prev, stakeholders: newStakeholders }));
            }}
            renderItem={(item, index, onUpdate) => (
              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  label="Name/Title"
                  value={item.name}
                  onChange={(value) => onUpdate('name', value)}
                  placeholder="e.g., Chief Data Officer"
                />
                <FormField
                  label="Role"
                  value={item.role}
                  onChange={(value) => onUpdate('role', value)}
                  placeholder="e.g., Committee Chair"
                />
                <FormField
                  label="Key Responsibilities"
                  value={item.responsibilities}
                  onChange={(value) => onUpdate('responsibilities', value)}
                  placeholder="e.g., Final approval authority"
                />
              </div>
            )}
            addButtonText="Add Stakeholder"
          />
        </div>
      </CollapsibleSection>

      <GridLayout cols={2} gap={6}>
        <CollapsibleSection 
          title="Review Process" 
          sectionId="review-process"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="AI System Review Process"
            type="textarea"
            value={formData.reviewProcess}
            onChange={(value) => updateFormData('reviewProcess', value)}
            placeholder="Define the process for reviewing AI systems before deployment, including stages, criteria, approvals, and documentation requirements..."
            rows={4}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Compliance Framework" 
          sectionId="compliance-framework"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Compliance Monitoring"
            type="textarea"
            value={formData.complianceFramework}
            onChange={(value) => updateFormData('complianceFramework', value)}
            placeholder="Describe how compliance with AI ethics and governance policies will be monitored, measured, and enforced..."
            rows={4}
          />
        </CollapsibleSection>
      </GridLayout>

      <CollapsibleSection 
        title="Incident Response" 
        sectionId="incident-response"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <FormField
          label="AI Incident Response Plan"
          type="textarea"
          value={formData.incidentResponse}
          onChange={(value) => updateFormData('incidentResponse', value)}
          placeholder="Define procedures for responding to AI-related incidents, including identification, escalation, investigation, remediation, and communication..."
          rows={4}
        />

        <InfoBox type="error" title="Types of AI Incidents">
          <ul className="text-sm space-y-1">
            <li>• <strong>Bias/Discrimination:</strong> Unfair treatment of individuals or groups</li>
            <li>• <strong>Privacy Breaches:</strong> Unauthorized access or exposure of personal data</li>
            <li>• <strong>Security Vulnerabilities:</strong> System compromises or attacks</li>
            <li>• <strong>Performance Failures:</strong> Significant accuracy degradation or system outages</li>
            <li>• <strong>Misuse:</strong> Use of AI systems outside approved parameters</li>
          </ul>
        </InfoBox>
      </CollapsibleSection>
    </div>
  );

  const renderRiskManagement = ({ 
    formData, 
    setFormData, 
    updateFormData, 
    addArrayItem, 
    removeArrayItem, 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Risk Management Framework"
        description="Identify, assess, and mitigate risks associated with AI system development and deployment."
        isCompleted={completedSections.has('risk-management')}
        onToggleComplete={() => markSectionComplete('risk-management')}
      />

      <CollapsibleSection 
        title="Risk Assessment" 
        defaultOpen={true} 
        sectionId="risk-assessment"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Identify and assess potential risks across your AI implementations.
          </p>
          
          <ArrayInput
            items={formData.riskAssessment || []}
            onAdd={() => addArrayItem('riskAssessment', { category: '', description: '', likelihood: 'medium', impact: 'medium', severity: 'medium' })}
            onRemove={(index) => removeArrayItem('riskAssessment', index)}
            onUpdate={(index, field, value) => {
              const newRisks = [...(formData.riskAssessment || [])];
              newRisks[index] = { ...newRisks[index], [field]: value };
              setFormData(prev => ({ ...prev, riskAssessment: newRisks }));
            }}
            renderItem={(item, index, onUpdate) => (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    label="Risk Category"
                    value={item.category}
                    onChange={(value) => onUpdate('category', value)}
                    placeholder="e.g., Algorithmic Bias, Data Privacy"
                  />
                  <FormField
                    label="Risk Description"
                    value={item.description}
                    onChange={(value) => onUpdate('description', value)}
                    placeholder="Detailed description of the risk"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Likelihood</label>
                    <select
                      value={item.likelihood}
                      onChange={(e) => onUpdate('likelihood', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Impact</label>
                    <select
                      value={item.impact}
                      onChange={(e) => onUpdate('impact', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Overall Severity</label>
                    <select
                      value={item.severity}
                      onChange={(e) => onUpdate('severity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            addButtonText="Add Risk"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Mitigation Strategies" 
        sectionId="mitigation-strategies"
        expandedSections={expandedSections}
        toggleSection={toggleSection}
      >
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Define specific strategies to mitigate identified risks.
          </p>
          
          <ArrayInput
            items={formData.mitigationStrategies || []}
            onAdd={() => addArrayItem('mitigationStrategies', { risk: '', strategy: '', timeline: '', owner: '' })}
            onRemove={(index) => removeArrayItem('mitigationStrategies', index)}
            onUpdate={(index, field, value) => {
              const newStrategies = [...(formData.mitigationStrategies || [])];
              newStrategies[index] = { ...newStrategies[index], [field]: value };
              setFormData(prev => ({ ...prev, mitigationStrategies: newStrategies }));
            }}
            renderItem={(item, index, onUpdate) => (
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="Associated Risk"
                  value={item.risk}
                  onChange={(value) => onUpdate('risk', value)}
                  placeholder="Which risk does this strategy address?"
                />
                <FormField
                  label="Mitigation Strategy"
                  type="textarea"
                  value={item.strategy}
                  onChange={(value) => onUpdate('strategy', value)}
                  placeholder="Describe the specific mitigation approach..."
                  rows={2}
                />
                <FormField
                  label="Implementation Timeline"
                  value={item.timeline}
                  onChange={(value) => onUpdate('timeline', value)}
                  placeholder="e.g., 30 days, Before deployment"
                />
                <FormField
                  label="Responsible Owner"
                  value={item.owner}
                  onChange={(value) => onUpdate('owner', value)}
                  placeholder="Who will implement this strategy?"
                />
              </div>
            )}
            addButtonText="Add Mitigation Strategy"
          />
        </div>
      </CollapsibleSection>

      <GridLayout cols={2} gap={6}>
        <CollapsibleSection 
          title="Monitoring Plan" 
          sectionId="monitoring-plan"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Ongoing Risk Monitoring"
            type="textarea"
            value={formData.monitoringPlan}
            onChange={(value) => updateFormData('monitoringPlan', value)}
            placeholder="Describe how you will continuously monitor for emerging risks and track the effectiveness of mitigation strategies..."
            rows={4}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Audit Schedule" 
          sectionId="audit-schedule"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Regular Risk Audits"
            type="textarea"
            value={formData.auditSchedule}
            onChange={(value) => updateFormData('auditSchedule', value)}
            placeholder="Define the schedule and scope for regular risk assessments and compliance audits..."
            rows={4}
          />
        </CollapsibleSection>
      </GridLayout>
    </div>
  );

  const renderImplementation = ({ 
    formData, 
    updateFormData, 
    completedSections, 
    markSectionComplete, 
    expandedSections, 
    toggleSection 
  }) => (
    <div className="space-y-6">
      <SectionHeader
        title="Implementation Plan"
        description="Develop a comprehensive plan for implementing your AI ethics and governance framework."
        isCompleted={completedSections.has('implementation')}
        onToggleComplete={() => markSectionComplete('implementation')}
      />

      <GridLayout cols={2} gap={6}>
        <CollapsibleSection 
          title="Training Program" 
          defaultOpen={true} 
          sectionId="training-program"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Ethics and Governance Training"
            type="textarea"
            value={formData.trainingProgram}
            onChange={(value) => updateFormData('trainingProgram', value)}
            placeholder="Describe your training program for employees on AI ethics and governance, including target audiences, content, delivery methods, and frequency..."
            rows={5}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Communication Plan" 
          sectionId="communication-plan"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Stakeholder Communication"
            type="textarea"
            value={formData.communicationPlan}
            onChange={(value) => updateFormData('communicationPlan', value)}
            placeholder="Define how you will communicate AI ethics policies and governance decisions to various stakeholders..."
            rows={5}
          />
        </CollapsibleSection>
      </GridLayout>

      <GridLayout cols={2} gap={6}>
        <CollapsibleSection 
          title="Reporting Mechanism" 
          sectionId="reporting-mechanism"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Ethics Violation Reporting"
            type="textarea"
            value={formData.reportingMechanism}
            onChange={(value) => updateFormData('reportingMechanism', value)}
            placeholder="Establish channels for reporting ethics violations or concerns, including anonymous options, investigation procedures, and protection for whistleblowers..."
            rows={4}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="Continuous Improvement" 
          sectionId="feedback-loop"
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        >
          <FormField
            label="Feedback and Improvement Loop"
            type="textarea"
            value={formData.feedbackLoop}
            onChange={(value) => updateFormData('feedbackLoop', value)}
            placeholder="Describe how you will collect feedback on your ethics and governance framework and use it for continuous improvement..."
            rows={4}
          />
        </CollapsibleSection>
      </GridLayout>

      <InfoBox type="success" title="🎯 Implementation Roadmap">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">30</span>
            </div>
            <h4 className="font-medium mb-2">First 30 Days</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Finalize ethics policy</li>
              <li>• Establish governance structure</li>
              <li>• Conduct initial risk assessment</li>
              <li>• Begin stakeholder training</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">90</span>
            </div>
            <h4 className="font-medium mb-2">First 90 Days</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Implement review processes</li>
              <li>• Deploy monitoring systems</li>
              <li>• Complete organization training</li>
              <li>• Establish reporting channels</li>
            </ul>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">1Y</span>
            </div>
            <h4 className="font-medium mb-2">First Year</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Conduct first annual audit</li>
              <li>• Refine based on experience</li>
              <li>• Expand to new AI applications</li>
              <li>• Measure effectiveness</li>
            </ul>
          </div>
        </div>
      </InfoBox>

      <InfoBox type="info" title="🔄 Success Metrics">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Quantitative Measures</h4>
            <ul className="text-sm space-y-1">
              <li>• Number of AI systems reviewed</li>
              <li>• Training completion rates</li>
              <li>• Incident response times</li>
              <li>• Audit compliance scores</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Qualitative Indicators</h4>
            <ul className="text-sm space-y-1">
              <li>• Stakeholder satisfaction</li>
              <li>• Cultural adoption of ethics</li>
              <li>• Quality of risk assessments</li>
              <li>• Effectiveness of governance</li>
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
      case 'ethics':
        return renderEthics(helpers);
      case 'governance':
        return renderGovernance(helpers);
      case 'risk-management':
        return renderRiskManagement(helpers);
      case 'implementation':
        return renderImplementation(helpers);
      default:
        return renderOverview(helpers);
    }
  };

  return (
    <GuideTemplate
      guideId={guideId}
      title="AI Ethics & Governance"
      description="Build responsible AI practices and governance frameworks"
      tabs={tabs}
      renderContent={renderContent}
      initialFormData={initialFormData}
      initialExpandedSections={initialExpandedSections}
    />
  );
};

export default AIEthicsGovernance;