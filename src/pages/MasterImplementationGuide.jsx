import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="bg-white border rounded-lg p-6">
    <h2 className="text-xl font-semibold text-charcoal mb-3">{title}</h2>
    <div className="text-charcoal/80 space-y-3">
      {children}
    </div>
  </div>
);

const MasterImplementationGuide = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bone pt-24">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Master AI Project Implementation Guide</h1>
            <p className="text-charcoal/70 mt-1">A single, coherent plan from strategy to operations</p>
          </div>
          <button
            className="px-4 py-2 bg-chestnut text-white rounded"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </button>
        </div>

        <Section title="1. Strategy Foundations">
          <p>Define AI vision, outcome targets, and governance principles. Identify high‑leverage business problems and success metrics.</p>
          <ul className="list-disc ml-6">
            <li>Vision and goals; value hypotheses</li>
            <li>Operating model; decision rights; guardrails</li>
            <li>Roadmap outline and investment framing</li>
          </ul>
        </Section>

        <Section title="2. Readiness & Capabilities">
          <p>Assess organization across strategy, data, tech, talent, and governance. Close foundational gaps prior to pilots.</p>
          <ul className="list-disc ml-6">
            <li>Capability baseline; maturity targets</li>
            <li>Data quality/access; security posture</li>
            <li>Skills plan; change management</li>
          </ul>
        </Section>

        <Section title="3. Use Cases & ROI">
          <p>Prioritize 2–3 pilot use cases via value/feasibility matrix. Create lightweight business cases and success metrics.</p>
          <ul className="list-disc ml-6">
            <li>Prioritization framework (impact × effort × risk)</li>
            <li>ROI model; success criteria; milestone gates</li>
            <li>Data availability checks; stakeholders</li>
          </ul>
        </Section>

        <Section title="4. Implementation & MLOps">
          <p>Stand up the delivery pipeline (secure data, model lifecycle, deployment). Build, evaluate, and iterate pilots.</p>
          <ul className="list-disc ml-6">
            <li>Secure data pipelines; observability; lineage</li>
            <li>Model development; evaluation; CI/CD</li>
            <li>Rollout planning; change enablement</li>
          </ul>
        </Section>

        <Section title="5. Governance, Risk, & Compliance">
          <p>Establish policies and controls for ethics, privacy, and safety. Document processes and decision audits.</p>
          <ul className="list-disc ml-6">
            <li>Policy set (security, privacy, model risk)</li>
            <li>Review boards; exception handling</li>
            <li>Monitoring; incident response</li>
          </ul>
        </Section>

        <Section title="6. Scale & Continuous Improvement">
          <p>Graduate pilots to production; scale successful patterns; refine roadmap based on outcomes and feedback.</p>
          <ul className="list-disc ml-6">
            <li>Value tracking; retrospectives; backlog</li>
            <li>Template/tooling reuse; platform maturation</li>
            <li>Continuous training and literacy programs</li>
          </ul>
        </Section>
      </div>
    </div>
  );
};

export default MasterImplementationGuide;

