import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Clock, AlertCircle, Save, ArrowLeft, Download, Calculator, PieChart } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { colors } from '../utils/colors';

const number = (v) => isNaN(parseFloat(v)) ? 0 : parseFloat(v);

const ProjectRoiCalculator = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getToolData, saveToolData, currentProject } = useProject();
  
  const [activeScenario, setActiveScenario] = useState('realistic');
  const [inputs, setInputs] = useState({
    // Baseline Metrics
    taskTime: 2.5,
    monthlyVolume: 500,
    errorRate: 15,
    employeeCount: 8,
    hourlyRate: 75,
    customerSat: 7.2,
    customerValue: 2500,
    
    // Implementation Costs
    devHours: 200,
    trainingHours: 80,
    infraCost: 5000,
    opportunityCost: 10000,
    maintenanceHours: 20,
    
    // Expected Improvements
    timeReduction: 25,
    errorReduction: 40,
    qualityImprovement: 15,
    capacityIncrease: 20
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getToolData(projectId, 'roiCalculator');
      if (data?.inputs) {
        setInputs(prev => ({ ...prev, ...data.inputs }));
      }
      setLoaded(true);
    };
    load();
  }, [projectId, getToolData]);

  const loadScenario = (scenario) => {
    setActiveScenario(scenario);
    const scenarios = {
      conservative: {
        timeReduction: 15,
        errorReduction: 25,
        qualityImprovement: 8,
        capacityIncrease: 10
      },
      realistic: {
        timeReduction: 25,
        errorReduction: 40,
        qualityImprovement: 15,
        capacityIncrease: 20
      },
      optimistic: {
        timeReduction: 40,
        errorReduction: 60,
        qualityImprovement: 25,
        capacityIncrease: 35
      }
    };
    
    const values = scenarios[scenario];
    setInputs(prev => ({ ...prev, ...values }));
  };

  const results = useMemo(() => {
    // Get input values
    const taskTime = number(inputs.taskTime);
    const monthlyVolume = number(inputs.monthlyVolume);
    const errorRate = number(inputs.errorRate);
    const employeeCount = number(inputs.employeeCount);
    const hourlyRate = number(inputs.hourlyRate);
    const customerSat = number(inputs.customerSat);
    const customerValue = number(inputs.customerValue);
    
    const devHours = number(inputs.devHours);
    const trainingHours = number(inputs.trainingHours);
    const infraCost = number(inputs.infraCost);
    const opportunityCost = number(inputs.opportunityCost);
    const maintenanceHours = number(inputs.maintenanceHours);
    
    const timeReduction = number(inputs.timeReduction);
    const errorReduction = number(inputs.errorReduction);
    const qualityImprovement = number(inputs.qualityImprovement);
    const capacityIncrease = number(inputs.capacityIncrease);
    
    // Calculate benefits
    const monthlyTimeSaved = (taskTime * monthlyVolume * timeReduction) / 100;
    const monthlyLaborSavings = monthlyTimeSaved * hourlyRate;
    const annualLaborSavings = monthlyLaborSavings * 12;
    
    const errorHoursSavedMonthly = (monthlyVolume * errorRate * taskTime * errorReduction) / 10000;
    const errorCostSavingsMonthly = errorHoursSavedMonthly * hourlyRate;
    const annualErrorSavings = errorCostSavingsMonthly * 12;
    
    // Simplified customer retention calculation
    const totalCustomers = 1000; // Assumed customer base
    const currentChurnRate = 3; // Assumed monthly churn rate
    const churnReduction = currentChurnRate * (qualityImprovement / 100) * 0.3;
    const customersRetainedMonthly = totalCustomers * churnReduction / 100;
    const monthlyRetentionValue = customersRetainedMonthly * customerValue;
    const annualRetentionValue = monthlyRetentionValue * 12;
    
    const additionalMonthlyCapacity = monthlyVolume * capacityIncrease / 100;
    const revenuePerTask = customerValue / 10; // Simplified assumption
    const monthlyCapacityRevenue = additionalMonthlyCapacity * revenuePerTask;
    const annualCapacityRevenue = monthlyCapacityRevenue * 12;
    
    // Calculate costs
    const oneTimeImplementationCost = (devHours + trainingHours) * hourlyRate + infraCost + opportunityCost;
    const annualMaintenanceCost = maintenanceHours * 12 * hourlyRate;
    
    // Calculate ROI
    const totalAnnualBenefits = annualLaborSavings + annualErrorSavings + annualRetentionValue + annualCapacityRevenue;
    const totalAnnualCosts = oneTimeImplementationCost + annualMaintenanceCost;
    const netBenefit = totalAnnualBenefits - totalAnnualCosts;
    const roi = totalAnnualCosts > 0 ? (netBenefit / totalAnnualCosts) * 100 : 0;
    const paybackPeriod = oneTimeImplementationCost > 0 ? oneTimeImplementationCost / (totalAnnualBenefits / 12) : 0;

    return { 
      roi,
      paybackPeriod,
      netBenefit,
      totalAnnualCosts,
      annualLaborSavings,
      annualErrorSavings,
      annualRetentionValue,
      annualCapacityRevenue,
      totalAnnualBenefits
    };
  }, [inputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setShowBreakdown(true);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await saveToolData(projectId, 'roiCalculator', {
        inputs,
        results,
        updatedAt: new Date().toISOString()
      });
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    window.print();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Calculator className="w-16 h-16 mx-auto mb-4 text-khaki" />
          <p className="text-charcoal">Loading ROI Calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone">
      {/* Header */}
      <div className="bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-pearl hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="font-serif text-3xl font-bold mb-2">AI Implementation ROI Calculator</h1>
          <p className="text-pearl">
            Calculate the return on investment for your AI initiatives
          </p>
          {currentProject && (
            <p className="text-khaki mt-2">Project: {currentProject.name}</p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-pearl/30 rounded-lg p-6 border-l-4 border-chestnut">
          <h3 className="font-serif text-xl font-bold mb-4 text-charcoal">📋 How to Use This Calculator</h3>
          <ol className="list-decimal list-inside space-y-2 text-charcoal">
            <li><strong>Start with Baseline Metrics:</strong> Enter your current performance data (task times, volumes, costs)</li>
            <li><strong>Add Implementation Costs:</strong> Include development time, training, and infrastructure costs</li>
            <li><strong>Set Improvement Expectations:</strong> Enter realistic percentage improvements you expect from AI</li>
            <li><strong>Try Different Scenarios:</strong> Use the scenario buttons to see conservative, realistic, and optimistic projections</li>
            <li><strong>Review Results:</strong> Analyze ROI, payback period, and detailed cost/benefit breakdown</li>
          </ol>
          <p className="mt-4 text-charcoal/80">
            <strong>💡 Pro Tip:</strong> Start conservative with your improvement estimates. It's better to under-promise and over-deliver!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Baseline Metrics Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-serif text-xl font-bold mb-6 text-charcoal border-b-3 border-chestnut pb-2">
                📊 Baseline Metrics
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Average Task Completion Time (hours)
                    <span className="ml-2 text-khaki cursor-help" title="How long does it currently take to complete one typical task?">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.taskTime}
                    onChange={(e) => handleInputChange('taskTime', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Monthly Task Volume
                    <span className="ml-2 text-khaki cursor-help" title="How many tasks does your team complete per month?">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyVolume}
                    onChange={(e) => handleInputChange('monthlyVolume', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Current Error/Rework Rate (%)
                    <span className="ml-2 text-khaki cursor-help" title="What percentage of tasks require rework or correction?">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.errorRate}
                    onChange={(e) => handleInputChange('errorRate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Affected Employees (FTEs)
                    <span className="ml-2 text-khaki cursor-help" title="How many full-time employees will use this AI solution?">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Loaded Hourly Rate ($)
                    <span className="ml-2 text-khaki cursor-help" title="Total cost per hour including salary, benefits, overhead">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Current Customer Satisfaction (1-10)
                    <span className="ml-2 text-khaki cursor-help" title="Current CSAT or NPS score">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={inputs.customerSat}
                    onChange={(e) => handleInputChange('customerSat', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Average Monthly Customer Value ($)
                    <span className="ml-2 text-khaki cursor-help" title="Average monthly revenue per customer">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.customerValue}
                    onChange={(e) => handleInputChange('customerValue', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>
              </div>
            </div>

            {/* Implementation Costs Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-serif text-xl font-bold mb-6 text-charcoal border-b-3 border-chestnut pb-2">
                💰 Implementation Costs
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Development Hours
                    <span className="ml-2 text-khaki cursor-help" title="Internal time to build and deploy the solution">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.devHours}
                    onChange={(e) => handleInputChange('devHours', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Training Hours (Total)
                    <span className="ml-2 text-khaki cursor-help" title="Time to train all affected employees">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.trainingHours}
                    onChange={(e) => handleInputChange('trainingHours', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Infrastructure Cost ($)
                    <span className="ml-2 text-khaki cursor-help" title="Hardware, software, licensing costs">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.infraCost}
                    onChange={(e) => handleInputChange('infraCost', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Opportunity Cost ($)
                    <span className="ml-2 text-khaki cursor-help" title="Revenue lost during implementation/transition">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.opportunityCost}
                    onChange={(e) => handleInputChange('opportunityCost', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Monthly Maintenance Hours
                    <span className="ml-2 text-khaki cursor-help" title="Ongoing monthly maintenance and updates">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    value={inputs.maintenanceHours}
                    onChange={(e) => handleInputChange('maintenanceHours', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>
              </div>
            </div>

            {/* Expected Improvements Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="font-serif text-xl font-bold mb-6 text-charcoal border-b-3 border-chestnut pb-2">
                🚀 Expected Improvements
              </h2>
              
              {/* Scenario Buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => loadScenario('conservative')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeScenario === 'conservative' 
                      ? 'bg-chestnut text-white' 
                      : 'bg-pearl text-charcoal hover:bg-khaki/30'
                  }`}
                >
                  Conservative
                </button>
                <button
                  onClick={() => loadScenario('realistic')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeScenario === 'realistic' 
                      ? 'bg-chestnut text-white' 
                      : 'bg-pearl text-charcoal hover:bg-khaki/30'
                  }`}
                >
                  Realistic
                </button>
                <button
                  onClick={() => loadScenario('optimistic')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeScenario === 'optimistic' 
                      ? 'bg-chestnut text-white' 
                      : 'bg-pearl text-charcoal hover:bg-khaki/30'
                  }`}
                >
                  Optimistic
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Time Savings (%)
                    <span className="ml-2 text-khaki cursor-help" title="Expected reduction in task completion time">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.timeReduction}
                    onChange={(e) => handleInputChange('timeReduction', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Error Reduction (%)
                    <span className="ml-2 text-khaki cursor-help" title="Expected reduction in errors/rework">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.errorReduction}
                    onChange={(e) => handleInputChange('errorReduction', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Quality Improvement (%)
                    <span className="ml-2 text-khaki cursor-help" title="Expected improvement in customer satisfaction">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.qualityImprovement}
                    onChange={(e) => handleInputChange('qualityImprovement', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Capacity Increase (%)
                    <span className="ml-2 text-khaki cursor-help" title="Additional throughput with same resources">ℹ️</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.capacityIncrease}
                    onChange={(e) => handleInputChange('capacityIncrease', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pearl rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>
              </div>
              
              <button
                onClick={() => setShowBreakdown(true)}
                className="w-full mt-6 px-6 py-3 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors font-semibold"
              >
                Calculate ROI
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-pearl/30 rounded-xl p-6">
              <h2 className="font-serif text-xl font-bold mb-6 text-charcoal border-b-3 border-chestnut pb-2">
                📈 Results
              </h2>
              
              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-chestnut shadow">
                  <div className="text-2xl font-bold text-charcoal">
                    {results.roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-charcoal/70">Year 1 ROI</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-chestnut shadow">
                  <div className={`text-2xl font-bold ${
                    results.paybackPeriod < 12 ? 'text-green-600' : 
                    results.paybackPeriod < 24 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {results.paybackPeriod.toFixed(1)} months
                  </div>
                  <div className="text-sm text-charcoal/70">Payback Period</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-chestnut shadow">
                  <div className={`text-2xl font-bold ${
                    results.netBenefit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${results.netBenefit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-sm text-charcoal/70">Year 1 Net Benefit</div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-chestnut shadow">
                  <div className="text-2xl font-bold text-charcoal">
                    ${results.totalAnnualCosts.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </div>
                  <div className="text-sm text-charcoal/70">Total Implementation Cost</div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {showBreakdown && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="font-serif text-xl font-bold mb-6 text-charcoal">
                  💡 Detailed Breakdown
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-pearl">
                    <span className="text-charcoal/70">Annual Labor Savings:</span>
                    <span className="font-semibold text-charcoal">
                      ${results.annualLaborSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-pearl">
                    <span className="text-charcoal/70">Annual Error Reduction Savings:</span>
                    <span className="font-semibold text-charcoal">
                      ${results.annualErrorSavings.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-pearl">
                    <span className="text-charcoal/70">Annual Retention Value:</span>
                    <span className="font-semibold text-charcoal">
                      ${results.annualRetentionValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-pearl">
                    <span className="text-charcoal/70">Annual Capacity Revenue:</span>
                    <span className="font-semibold text-charcoal">
                      ${results.annualCapacityRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-chestnut font-bold">
                    <span>Total Annual Benefits:</span>
                    <span className="text-charcoal">
                      ${results.totalAnnualBenefits.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Calculator'}
              </button>
              <button
                onClick={generatePDF}
                className="flex-1 px-6 py-3 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectRoiCalculator;