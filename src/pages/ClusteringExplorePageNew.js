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
    { id: 1, title: 'Upload', description: 'Upload dataset' },
    { id: 2, title: 'Validate', description: 'Validate data quality' },
    { id: 3, title: 'Configure', description: 'Configure clustering' },
    { id: 4, title: 'Analyze', description: 'Run analysis' },
    { id: 5, title: 'Results', description: 'View results' },
    { id: 6, title: 'Export', description: 'Export & finish' }
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
        createRequestConfig('POST', formData)
      );

      if (response.ok) {
        const result = await response.json();
        setUploadedFile(file);
        setValidationResults(result);
        setCurrentStep(2);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
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
      setError('Using demo data due to API error');
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
        `${buildUrl(API_CONFIG.ENDPOINTS.CLUSTERING.TRAIN)}?session_id=${sessionId}`,
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
      setError('Using demo data due to API error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultsNext = () => {
    setCurrentStep(6);
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

  const renderStepContent = () => {
    if (isLoading) {
      return <LoadingState message="Processing your request..." />;
    }

    switch (currentStep) {
      case 1:
        return (
          <DataUploadStep
            onUpload={handleUpload}
            acceptedFormats={['.csv', '.xlsx', '.xls', '.json']}
            title="Upload Clustering Dataset"
            description="Upload your dataset for unsupervised clustering analysis"
            requiresTargetColumn={false}
            isLoading={isLoading}
          />
        );

      case 2:
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

      case 3:
        return (
          <ClusterConfigurationStep
            validationResults={validationResults}
            onConfigure={handleConfiguration}
            isLoading={isLoading}
          />
        );

      case 4:
        return (
          <ClusterAnalysisStep
            config={clusterConfig}
            validationResults={validationResults}
            onAnalyze={handleAnalysis}
            isLoading={isLoading}
          />
        );

      case 5:
        return (
          <ResultsVisualization
            analysisResults={analysisResults}
            validationResults={validationResults}
            onNext={handleResultsNext}
          />
        );

      case 6:
        return (
          <ExportStep
            analysisResults={analysisResults}
            validationResults={validationResults}
            onReturnToDashboard={handleReturnToDashboard}
            onStartNew={handleStartNew}
          />
        );

      default:
        return null;
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

  return (
    <div className="min-h-screen bg-bone pt-20">
      {/* Header */}
      <div className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold mb-4">
            Clustering Explorer
          </h1>
          <p className="text-lg text-pearl">
            Discover hidden patterns in your data with comprehensive unsupervised clustering analysis
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Navigation */}
        <div className="mb-8">
          <StepNavigation 
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            completedSteps={currentStep - 1}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default ClusteringExplorePageNew;