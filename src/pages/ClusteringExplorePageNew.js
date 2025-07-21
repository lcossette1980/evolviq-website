import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

// Shared Components
import DataUploadStep from '../components/shared/DataUploadStep';
import LoadingState from '../components/shared/LoadingState';
import StepNavigation from '../components/shared/StepNavigation';

// Clustering-specific Components
import ClusterConfigurationStep from '../components/clustering/ClusterConfigurationStep';
import ClusterAnalysisStep from '../components/clustering/ClusterAnalysisStep';
import ResultsVisualization from '../components/clustering/ResultsVisualization';
import ExportStep from '../components/clustering/ExportStep';

const ClusteringExplorePageNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  
  // Data state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [clusterConfig, setClusterConfig] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { 
      id: 1, 
      name: 'Upload Data', 
      description: 'Upload your dataset for clustering',
      component: 'upload' 
    },
    { 
      id: 2, 
      name: 'Validate Data', 
      description: 'Review data structure and features',
      component: 'validate' 
    },
    { 
      id: 3, 
      name: 'Configure Analysis', 
      description: 'Set clustering algorithms and parameters',
      component: 'configure' 
    },
    { 
      id: 4, 
      name: 'Run Analysis', 
      description: 'Perform clustering and optimization',
      component: 'analyze' 
    },
    { 
      id: 5, 
      name: 'View Results', 
      description: 'Explore clusters and insights',
      component: 'results' 
    }
  ];

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch(buildUrl('/api/regression/session'), 
          createRequestConfig('POST', {
            name: 'Clustering Analysis Session',
            description: 'Unsupervised clustering analysis and optimization'
          })
        );
        
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.session_id);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    if (user && !sessionId) {
      createSession();
    }
  }, [user, sessionId]);

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleUpload = async (file) => {
    if (!sessionId) {
      setError('No session available. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${buildUrl(API_CONFIG.ENDPOINTS.CLUSTERING.VALIDATE)}?session_id=${sessionId}`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUploadedFile(file);
        setValidationResults(result);
        setCurrentStep(2);
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const responseText = await response.text();
          console.log('Raw error response:', responseText);
          
          if (responseText) {
            try {
              const errorData = JSON.parse(responseText);
              console.log('Parsed error data:', errorData);
              if (typeof errorData === 'string') {
                errorMessage = errorData;
              } else if (errorData && typeof errorData === 'object') {
                errorMessage = errorData.detail || errorData.message || errorData.error || responseText;
              }
            } catch (jsonError) {
              errorMessage = responseText;
            }
          }
        } catch (parseError) {
          console.log('Could not read error response:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide fallback validation for demo
      const fallbackValidation = {
        summary: {
          shape: [400, 8],
          columns: ['feature1', 'feature2', 'feature3', 'feature4', 'feature5', 'feature6', 'feature7', 'feature8'],
          memory_usage: '12.5 KB',
          missing_values: {}
        },
        is_valid: true
      };
      
      setUploadedFile(file);
      setValidationResults(fallbackValidation);
      setCurrentStep(2);
      setError(`API Error: ${error.message || 'Upload failed'}. Using demo data.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = () => {
    // Validation step is automatically completed after upload
    setCurrentStep(3);
  };

  const handleConfiguration = (config) => {
    setClusterConfig(config);
    setCurrentStep(4);
  };

  const handleAnalysis = async () => {
    if (!sessionId) {
      setError('No session available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${buildUrl(API_CONFIG.ENDPOINTS.CLUSTERING.PERFORM_CLUSTERING)}?session_id=${sessionId}`,
        createRequestConfig('POST', {
          algorithms: clusterConfig?.algorithms || ['kmeans', 'hierarchical', 'dbscan'],
          max_clusters: clusterConfig?.maxClusters || 8,
          min_clusters: clusterConfig?.minClusters || 2,
          scaling_method: clusterConfig?.scalingMethod || 'standard'
        })
      );

      if (response.ok) {
        const result = await response.json();
        if (result?.clustering_results?.length > 0) {
          setAnalysisResults(result);
          setCurrentStep(5);
        } else {
          throw new Error('Invalid clustering response');
        }
      } else {
        throw new Error(`Clustering failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Clustering error:', error);
      
      // Provide fallback data for demo
      const fallbackResults = {
        optimization_data: [
          { k: 2, elbow: 1567, silhouette: 0.642, calinski: 158.2, davies: 0.821 },
          { k: 3, elbow: 956, silhouette: 0.731, calinski: 234.7, davies: 0.643 },
          { k: 4, elbow: 743, silhouette: 0.687, calinski: 201.3, davies: 0.754 },
          { k: 5, elbow: 612, silhouette: 0.625, calinski: 178.9, davies: 0.892 },
          { k: 6, elbow: 523, silhouette: 0.578, calinski: 156.4, davies: 0.967 }
        ],
        clustering_results: [
          { algorithm: 'K-Means', silhouette: 0.731, calinski: 234.7, davies: 0.643, n_clusters: 3, n_noise: 0 },
          { algorithm: 'Hierarchical', silhouette: 0.702, calinski: 198.6, davies: 0.723, n_clusters: 3, n_noise: 0 },
          { algorithm: 'DBSCAN', silhouette: 0.645, calinski: 167.8, davies: 0.834, n_clusters: 4, n_noise: 12 },
          { algorithm: 'Gaussian Mixture', silhouette: 0.718, calinski: 221.4, davies: 0.667, n_clusters: 3, n_noise: 0 }
        ].filter(result => 
          clusterConfig?.algorithms?.length === 0 || 
          clusterConfig.algorithms.some(selected => 
            result.algorithm.toLowerCase().includes(selected.replace('_', ' ').replace('gmm', 'gaussian'))
          )
        ),
        visualization_data: [
          { x: 2.1, y: 1.5, cluster: 0, size: 45 },
          { x: -1.2, y: 2.3, cluster: 1, size: 38 },
          { x: 1.8, y: -1.1, cluster: 2, size: 42 },
          { x: 2.5, y: 1.8, cluster: 0, size: 45 },
          { x: -1.5, y: 2.1, cluster: 1, size: 38 },
          { x: 1.5, y: -0.8, cluster: 2, size: 42 }
        ]
      };
      
      setAnalysisResults(fallbackResults);
      setCurrentStep(5);
      setError(`API Error: ${error.message || 'Analysis failed'}. Using demo data.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultsNext = () => {
    navigate('/dashboard');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  const handleStartNew = () => {
    // Reset all state
    setCurrentStep(1);
    setUploadedFile(null);
    setValidationResults(null);
    setClusterConfig(null);
    setAnalysisResults(null);
    setError(null);
  };

  const handleStepClick = (stepId) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const renderStepContent = () => {
    const step = steps.find(s => s.id === currentStep);

    if (isLoading) {
      return (
        <LoadingState 
          message="Processing your data..."
          submessage="This may take a few moments"
        />
      );
    }

    switch (step.component) {
      case 'upload':
        return (
          <DataUploadStep
            onUpload={handleUpload}
            acceptedFormats={['.csv', '.xlsx', '.xls', '.json']}
            title="Upload Clustering Dataset"
            description="Upload your dataset for unsupervised clustering analysis"
            requiresTargetColumn={false}
            isLoading={isLoading}
            error={error}
          />
        );

      case 'validate':
        return (
          <DataUploadStep
            onUpload={() => {}}
            uploadedFile={uploadedFile}
            validationResults={validationResults}
            onNext={handleValidation}
            showValidationResults={true}
            title="Data Validation Complete"
            description="Your dataset has been validated and is ready for clustering analysis"
            isLoading={false}
          />
        );

      case 'configure':
        return (
          <ClusterConfigurationStep
            validationResults={validationResults}
            onConfigure={handleConfiguration}
            isLoading={isLoading}
          />
        );

      case 'analyze':
        return (
          <ClusterAnalysisStep
            config={clusterConfig}
            validationResults={validationResults}
            onAnalyze={handleAnalysis}
            isLoading={isLoading}
          />
        );

      case 'results':
        return (
          <ResultsVisualization
            analysisResults={analysisResults}
            validationResults={validationResults}
            onNext={handleResultsNext}
          />
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bone py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-4">
              Clustering Explorer
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the clustering tool.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionId && !error) {
    return (
      <LoadingState 
        message="Initializing Clustering session..."
        submessage="Setting up your clustering analysis environment"
      />
    );
  }

  return (
    <div className="min-h-screen bg-bone">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <StepNavigation
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusteringExplorePageNew;