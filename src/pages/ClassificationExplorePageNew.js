import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

// Shared Components
import DataUploadStep from '../components/shared/DataUploadStep';
import LoadingState from '../components/shared/LoadingState';
import StepNavigation from '../components/shared/StepNavigation';

// Classification-specific Components
import ModelSelectionStep from '../components/classification/ModelSelectionStep';
import ModelTrainingStep from '../components/classification/ModelTrainingStep';
import ResultsVisualization from '../components/classification/ResultsVisualization';
import ExportStep from '../components/classification/ExportStep';

const ClassificationExplorePageNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  
  // Data state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [trainingResults, setTrainingResults] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, title: 'Upload', description: 'Upload dataset' },
    { id: 2, title: 'Validate', description: 'Validate data quality' },
    { id: 3, title: 'Configure', description: 'Select models' },
    { id: 4, title: 'Train', description: 'Train models' },
    { id: 5, title: 'Results', description: 'View results' },
    { id: 6, title: 'Export', description: 'Export & finish' }
  ];

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch(buildUrl('/api/regression/session'), 
          createRequestConfig('POST', {
            name: 'Classification Analysis Session',
            description: 'Classification model training and evaluation'
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

  const handleUpload = async (file, targetColumn) => {
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
        `${buildUrl(API_CONFIG.ENDPOINTS.CLASSIFICATION.VALIDATE)}?session_id=${sessionId}&target_column=${encodeURIComponent(targetColumn)}`,
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
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = () => {
    // Validation step is automatically completed after upload
    setCurrentStep(3);
  };

  const handleModelSelection = (models) => {
    setSelectedModels(models);
    setCurrentStep(4);
  };

  const handleTraining = async () => {
    if (!sessionId) {
      setError('No session available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${buildUrl(API_CONFIG.ENDPOINTS.CLASSIFICATION.TRAIN)}?session_id=${sessionId}`,
        createRequestConfig('POST', {
          models_to_include: selectedModels
        })
      );

      if (response.ok) {
        const result = await response.json();
        if (result?.comparison_data?.length > 0) {
          setTrainingResults(result);
          setCurrentStep(5);
        } else {
          throw new Error('Invalid training response');
        }
      } else {
        throw new Error(`Training failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Training error:', error);
      
      // Provide fallback data for demo
      const fallbackResults = {
        comparison_data: [
          { name: 'Random Forest', accuracy: 0.94, precision: 0.94, recall: 0.92, f1_score: 0.93, training_time: 1.2 },
          { name: 'Gradient Boosting', accuracy: 0.92, precision: 0.93, recall: 0.89, f1_score: 0.91, training_time: 2.1 },
          { name: 'Logistic Regression', accuracy: 0.89, precision: 0.90, recall: 0.86, f1_score: 0.88, training_time: 0.3 },
          { name: 'SVM (RBF)', accuracy: 0.91, precision: 0.92, recall: 0.88, f1_score: 0.90, training_time: 3.5 }
        ].filter(model => 
          selectedModels.length === 0 || 
          selectedModels.some(selected => 
            model.name.toLowerCase().includes(selected.replace('_', ' '))
          )
        ),
        best_model: 'Random Forest',
        feature_importance: [
          { feature: 'Feature 1', importance: 0.24 },
          { feature: 'Feature 2', importance: 0.18 },
          { feature: 'Feature 3', importance: 0.15 },
          { feature: 'Feature 4', importance: 0.12 },
          { feature: 'Feature 5', importance: 0.10 }
        ],
        confusion_matrix: {
          'Class A': { 'Class A': 85, 'Class B': 7 },
          'Class B': { 'Class A': 5, 'Class B': 103 }
        }
      };
      
      setTrainingResults(fallbackResults);
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
    setSelectedModels([]);
    setTrainingResults(null);
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
            title="Upload Classification Dataset"
            description="Upload your dataset for classification analysis"
            requiresTargetColumn={true}
            targetColumnLabel="Target Column (what you want to predict)"
            targetColumnPlaceholder="e.g., 'class', 'category', 'label'"
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
            description="Your dataset has been validated and is ready for model training"
            isLoading={false}
          />
        );

      case 3:
        return (
          <ModelSelectionStep
            validationResults={validationResults}
            onSelectModels={handleModelSelection}
            isLoading={isLoading}
          />
        );

      case 4:
        return (
          <ModelTrainingStep
            selectedModels={selectedModels}
            validationResults={validationResults}
            onTrain={handleTraining}
            isLoading={isLoading}
          />
        );

      case 5:
        return (
          <ResultsVisualization
            trainingResults={trainingResults}
            validationResults={validationResults}
            onNext={handleResultsNext}
          />
        );

      case 6:
        return (
          <ExportStep
            trainingResults={trainingResults}
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
              Classification Explorer
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the classification tool.
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
            Classification Explorer
          </h1>
          <p className="text-lg text-pearl">
            Train and compare multiple classification algorithms with comprehensive evaluation
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

export default ClassificationExplorePageNew;