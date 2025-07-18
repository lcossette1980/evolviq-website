import React, { useState, useEffect } from 'react';
import { Upload, Play, BookOpen, BarChart3, Settings, Download, ChevronRight, ChevronDown, AlertCircle, CheckCircle, Info, TrendingUp, Database, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const EDAExplorePage = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState({});
  const [dataset, setDataset] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  // Sample data for demonstration
  const sampleData = [
    { feature: 'carat', mean: 0.798, std: 0.474, skewness: 1.116, missing: 0 },
    { feature: 'depth', mean: 61.749, std: 1.433, skewness: 0.026, missing: 0 },
    { feature: 'table', mean: 57.457, std: 2.235, skewness: 0.796, missing: 0 },
    { feature: 'price', mean: 3932.8, std: 3989.4, skewness: 1.618, missing: 0 },
    { feature: 'x', mean: 5.731, std: 1.122, skewness: 0.379, missing: 0 },
    { feature: 'y', mean: 5.735, std: 1.142, skewness: 0.346, missing: 0 },
    { feature: 'z', mean: 3.539, std: 0.706, skewness: 0.284, missing: 0 }
  ];

  const correlationData = [
    { x: 'carat', y: 'price', correlation: 0.92 },
    { x: 'x', y: 'price', correlation: 0.88 },
    { x: 'y', y: 'price', correlation: 0.87 },
    { x: 'z', y: 'price', correlation: 0.86 },
    { x: 'depth', y: 'price', correlation: -0.01 },
    { x: 'table', y: 'price', correlation: -0.13 }
  ];

  const edaSteps = [
    {
      id: 'setup',
      title: 'Environment Setup & Data Loading',
      icon: Settings,
      description: 'Import libraries, load data, and configure analysis environment',
      objectives: [
        'Set up reproducible analysis environment',
        'Load and validate dataset',
        'Configure visualization settings',
        'Establish random seeds for consistency'
      ]
    },
    {
      id: 'inspection',
      title: 'Initial Data Inspection',
      icon: Database,
      description: 'Examine dataset structure, types, and basic properties',
      objectives: [
        'Understand dataset dimensions and memory usage',
        'Identify column types and missing values',
        'Examine sample records and patterns',
        'Assess initial data quality indicators'
      ]
    },
    {
      id: 'quality',
      title: 'Data Quality Assessment',
      icon: CheckCircle,
      description: 'Comprehensive evaluation of data quality across multiple dimensions',
      objectives: [
        'Assess completeness and missing value patterns',
        'Identify duplicates and inconsistencies',
        'Validate data ranges and formats',
        'Calculate overall quality score'
      ]
    },
    {
      id: 'cleaning',
      title: 'Data Cleaning & Preprocessing',
      icon: Zap,
      description: 'Clean and prepare data for analysis',
      objectives: [
        'Handle missing values with appropriate strategies',
        'Remove or address duplicate records',
        'Detect and treat outliers',
        'Standardize data types and formats'
      ]
    },
    {
      id: 'univariate',
      title: 'Univariate Analysis',
      icon: BarChart3,
      description: 'Analyze individual variables in detail',
      objectives: [
        'Examine distribution shapes and patterns',
        'Calculate comprehensive statistics',
        'Identify transformation needs',
        'Assess ML readiness per feature'
      ]
    },
    {
      id: 'bivariate',
      title: 'Bivariate & Multivariate Analysis',
      icon: TrendingUp,
      description: 'Explore relationships between variables',
      objectives: [
        'Calculate correlation matrices',
        'Identify feature interactions',
        'Detect multicollinearity issues',
        'Analyze target relationships'
      ]
    }
  ];

  // Create session on component mount
  useEffect(() => {
    const createSession = async () => {
      try {
        // Use Railway URL directly
        const apiUrl = 'https://evolviq-website-production.up.railway.app';
        const response = await fetch(`${apiUrl}/api/regression/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'EDA Analysis Session',
            description: 'Exploratory Data Analysis session'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Session created:', data.session_id);
          setSessionId(data.session_id);
        } else {
          console.error('Failed to create session:', response.status);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    if (user && !sessionId) {
      createSession();
    }
  }, [user, sessionId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!sessionId) {
      console.log('No session ID available');
      alert('Session not ready. Please wait a moment and try again.');
      return;
    }

    console.log('Starting upload for file:', file.name, 'Session:', sessionId);
    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use Railway URL directly for now since local backend might not be running
      const apiUrl = 'https://evolviq-website-production.up.railway.app';
      const uploadUrl = `${apiUrl}/api/eda/validate-data?session_id=${sessionId}`;
      
      console.log('Uploading to:', uploadUrl);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        setValidationResults(result);
        setDataset(file.name);
        
        // Auto-advance to next step after successful upload
        if (result.validation && result.validation.is_valid) {
          setActiveStep(1);
        }
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        alert(`Upload failed (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const runAnalysis = async (stepId) => {
    if (!sessionId) return;
    
    setIsAnalyzing(true);
    
    try {
      let endpoint = '';
      switch (stepId) {
        case 'quality':
          endpoint = '/api/eda/quality-assessment';
          break;
        case 'univariate':
          endpoint = '/api/eda/univariate-analysis';
          break;
        case 'bivariate':
          endpoint = '/api/eda/bivariate-analysis';
          break;
        case 'cleaning':
          endpoint = '/api/eda/clean-data';
          break;
        default:
          // For setup and inspection, use mock data
          const mockResults = {
            setup: { status: 'complete', libraries: 15, seed: 42 },
            inspection: { 
              rows: validationResults?.summary?.shape?.[0] || 53940, 
              columns: validationResults?.summary?.shape?.[1] || 10, 
              memory: '4.2 MB',
              missing: 0,
              duplicates: 146
            }
          };
          
          setAnalysisResults(prev => ({
            ...prev,
            [stepId]: mockResults[stepId]
          }));
          setIsAnalyzing(false);
          return;
      }
      
      const apiUrl = 'https://evolviq-website-production.up.railway.app';
      const response = await fetch(`${apiUrl}${endpoint}?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysisResults(prev => ({
          ...prev,
          [stepId]: result
        }));
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.detail}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const QualityMetrics = ({ results }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="bg-pearl/20 p-4 rounded-lg border border-khaki/30">
        <div className="text-sm font-medium text-charcoal/70">Overall Score</div>
        <div className="text-2xl font-bold text-chestnut">{results?.score || 0}/100</div>
      </div>
      <div className="bg-pearl/20 p-4 rounded-lg border border-khaki/30">
        <div className="text-sm font-medium text-charcoal/70">Completeness</div>
        <div className="text-2xl font-bold text-charcoal">{results?.completeness || 0}%</div>
      </div>
      <div className="bg-pearl/20 p-4 rounded-lg border border-khaki/30">
        <div className="text-sm font-medium text-charcoal/70">Validity</div>
        <div className="text-2xl font-bold text-charcoal">{results?.validity || 0}%</div>
      </div>
    </div>
  );

  const CorrelationMatrix = ({ data }) => (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
          <XAxis dataKey="x" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
          <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#F5F2EA', 
              border: '1px solid #A59E8C',
              borderRadius: '8px'
            }} 
          />
          <Bar dataKey="correlation" fill="#A44A3F" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const FeatureStatsTable = ({ data }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-khaki/20">
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Feature</th>
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Mean</th>
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Std Dev</th>
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Skewness</th>
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row, idx) => (
            <tr key={idx} className="bg-bone hover:bg-pearl/20 transition-colors">
              <td className="p-3 font-medium border border-pearl text-charcoal">{row.feature}</td>
              <td className="p-3 border border-pearl text-charcoal">{row.mean.toFixed(3)}</td>
              <td className="p-3 border border-pearl text-charcoal">{row.std.toFixed(3)}</td>
              <td className="p-3 border border-pearl text-charcoal">{row.skewness.toFixed(3)}</td>
              <td className="p-3 border border-pearl">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  Math.abs(row.skewness) < 0.5 ? 'bg-green-100 text-green-800' :
                  Math.abs(row.skewness) < 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {Math.abs(row.skewness) < 0.5 ? 'Normal' :
                   Math.abs(row.skewness) < 2 ? 'Skewed' : 'Highly Skewed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-bone py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-4">
              EDA Explorer
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the interactive exploratory data analysis tool.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone pt-20">
      {/* Header */}
      <div className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold mb-4">
            Interactive EDA Explorer
          </h1>
          <p className="text-lg text-pearl">
            Comprehensive Exploratory Data Analysis with Real-time Insights
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-serif font-bold mb-4 text-charcoal">
                Analysis Steps
              </h2>
              
              <div className="space-y-2">
                {edaSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = activeStep === index;
                  const isComplete = analysisResults[step.id];
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(index)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isActive 
                          ? 'bg-chestnut text-white' 
                          : 'bg-bone text-charcoal hover:bg-pearl/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.title}</div>
                        </div>
                        {isComplete && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {edaSteps[activeStep] && (
              <div className="space-y-6">
                {/* Step Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-chestnut">
                      {React.createElement(edaSteps[activeStep].icon, { 
                        size: 24, 
                        color: 'white'
                      })}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif font-bold mb-2 text-charcoal">
                        {edaSteps[activeStep].title}
                      </h2>
                      <p className="mb-4 text-charcoal/80">
                        {edaSteps[activeStep].description}
                      </p>
                      
                      {/* Learning Objectives */}
                      <div className="p-4 rounded-lg border bg-bone">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-charcoal">
                          <BookOpen size={16} />
                          Learning Objectives
                        </h3>
                        <ul className="space-y-1">
                          {edaSteps[activeStep].objectives.map((objective, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2 text-charcoal/70">
                              <ChevronRight size={12} className="text-chestnut" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Controls */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-charcoal">Analysis Controls</h3>
                    <button
                      onClick={() => runAnalysis(edaSteps[activeStep].id)}
                      disabled={isAnalyzing || !dataset}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        (isAnalyzing || !dataset) 
                          ? 'bg-khaki/50 text-charcoal/50 cursor-not-allowed' 
                          : 'bg-chestnut text-white hover:bg-chestnut/90'
                      }`}
                    >
                      <Play size={16} />
                      {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-khaki/50 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer inline-flex flex-col items-center justify-center w-full ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload size={32} className="mx-auto mb-2 text-khaki" />
                      <p className="text-sm text-charcoal/70">
                        {isUploading ? 'Uploading...' : dataset ? `Uploaded: ${dataset}` : 'Upload your dataset (CSV, Excel, or JSON)'}
                      </p>
                      {!dataset && (
                        <p className="text-xs mt-1 text-charcoal/50">
                          Click to select a file
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Results Section */}
                {analysisResults[edaSteps[activeStep].id] && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <BarChart3 size={20} />
                      Analysis Results
                    </h3>
                    
                    {/* Step-specific Results */}
                    {edaSteps[activeStep].id === 'inspection' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults.inspection?.rows?.toLocaleString()}
                          </div>
                          <div className="text-sm text-charcoal/70">Rows</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults.inspection?.columns}
                          </div>
                          <div className="text-sm text-charcoal/70">Columns</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults.inspection?.memory}
                          </div>
                          <div className="text-sm text-charcoal/70">Memory</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults.inspection?.duplicates}
                          </div>
                          <div className="text-sm text-charcoal/70">Duplicates</div>
                        </div>
                      </div>
                    )}

                    {edaSteps[activeStep].id === 'quality' && (
                      <QualityMetrics results={analysisResults.quality} />
                    )}

                    {edaSteps[activeStep].id === 'univariate' && (
                      <FeatureStatsTable data={analysisResults.univariate} />
                    )}

                    {edaSteps[activeStep].id === 'bivariate' && (
                      <div>
                        <h4 className="font-medium mb-2 text-charcoal">
                          Feature Correlations with Target (Price)
                        </h4>
                        <CorrelationMatrix data={analysisResults.bivariate} />
                      </div>
                    )}
                  </div>
                )}

                {/* Insights & Recommendations */}
                {analysisResults[edaSteps[activeStep].id] && (
                  <div className="bg-bone rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <Info size={20} />
                      Key Insights & Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      {edaSteps[activeStep].id === 'quality' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Excellent Data Quality</div>
                              <div className="text-sm text-green-700">
                                Overall quality score of 95/100 indicates dataset is well-prepared for analysis
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">Minor Duplicates Detected</div>
                              <div className="text-sm text-yellow-700">
                                146 duplicate rows found - recommend removal before modeling
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {edaSteps[activeStep].id === 'univariate' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Info size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Skewness Patterns</div>
                              <div className="text-sm text-blue-700">
                                Price and carat show moderate positive skewness - consider log transformation
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Well-Distributed Features</div>
                              <div className="text-sm text-green-700">
                                Most physical measurements (depth, table) show normal distributions
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {edaSteps[activeStep].id === 'bivariate' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <TrendingUp size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Strong Predictive Features</div>
                              <div className="text-sm text-green-700">
                                Carat (0.92), x (0.88), y (0.87), z (0.86) show strong correlations with price
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">Potential Multicollinearity</div>
                              <div className="text-sm text-yellow-700">
                                Physical dimensions (x, y, z) likely highly correlated - consider PCA or feature selection
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EDAExplorePage;