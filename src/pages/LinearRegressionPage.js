import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import regressionAPI from '../services/regressionAPI';
import DataUpload from '../components/regression/DataUpload';
import DataValidation from '../components/regression/DataValidation';
import DataPreprocessing from '../components/regression/DataPreprocessing';
import ModelTraining from '../components/regression/ModelTraining';
import ResultsVisualization from '../components/regression/ResultsVisualization';
import PredictionInterface from '../components/regression/PredictionInterface';
import SessionManager from '../components/regression/SessionManager';

const LinearRegressionPage = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [preprocessingResults, setPreprocessingResults] = useState(null);
  const [trainingResults, setTrainingResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, name: 'Upload Data', component: 'upload' },
    { id: 2, name: 'Validate Data', component: 'validate' },
    { id: 3, name: 'Preprocess', component: 'preprocess' },
    { id: 4, name: 'Train Models', component: 'train' },
    { id: 5, name: 'Results', component: 'results' },
    { id: 6, name: 'Predict', component: 'predict' }
  ];

  useEffect(() => {
    createNewSession();
  }, []);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      // Create simple session ID without Firebase for now
      const newSessionId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);
      setCurrentStep(1);
      resetState();
    } catch (error) {
      setError('Failed to create session');
      console.error('Session creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setValidationResults(null);
    setPreprocessingResults(null);
    setTrainingResults(null);
    setError(null);
  };

  const handleDataUpload = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Skip Firebase upload for now - validate directly with API
      const validation = await regressionAPI.validateData(sessionId, file);
      setValidationResults(validation);
      
      if (validation.is_valid) {
        setCurrentStep(2);
      }
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataValidation = (targetColumn) => {
    setValidationResults(prev => ({
      ...prev,
      selectedTarget: targetColumn
    }));
    setCurrentStep(3);
  };

  const handlePreprocessing = async (config) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Preprocessing config:', config);
      console.log('Target column:', validationResults.selectedTarget);
      
      const result = await regressionAPI.preprocessData(sessionId, {
        config: config,
        target_column: validationResults.selectedTarget
      });
      
      setPreprocessingResults(result);
      setCurrentStep(4);
    } catch (error) {
      setError(`Preprocessing failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTraining = async (config) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Training config:', config);
      console.log('Target column:', validationResults.selectedTarget);
      
      const result = await regressionAPI.trainModels(sessionId, {
        config: config,
        target_column: validationResults.selectedTarget
      });
      
      setTrainingResults(result);
      setCurrentStep(5);
    } catch (error) {
      setError(`Training failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    // Only allow navigation to completed steps or next step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const renderStepContent = () => {
    const step = steps.find(s => s.id === currentStep);
    
    switch (step.component) {
      case 'upload':
        return (
          <DataUpload
            onUpload={handleDataUpload}
            isLoading={isLoading}
            error={error}
          />
        );
      
      case 'validate':
        return (
          <DataValidation
            validationResults={validationResults}
            onValidate={handleDataValidation}
            isLoading={isLoading}
          />
        );
      
      case 'preprocess':
        return (
          <DataPreprocessing
            validationResults={validationResults}
            onPreprocess={handlePreprocessing}
            isLoading={isLoading}
          />
        );
      
      case 'train':
        return (
          <ModelTraining
            preprocessingResults={preprocessingResults}
            onTrain={handleTraining}
            isLoading={isLoading}
          />
        );
      
      case 'results':
        return (
          <ResultsVisualization
            trainingResults={trainingResults}
            sessionId={sessionId}
            onContinue={() => setCurrentStep(6)}
          />
        );
      
      case 'predict':
        return (
          <PredictionInterface
            sessionId={sessionId}
            featureColumns={preprocessingResults?.feature_columns || []}
            trainingResults={trainingResults}
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
              Linear Regression Analysis
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the interactive regression analysis tool.
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
    <div className="min-h-screen bg-bone py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">
            Interactive Linear Regression Analysis
          </h1>
          <p className="text-lg text-charcoal/70 max-w-3xl mx-auto">
            Upload your dataset, preprocess the data, train multiple regression models, 
            and make predictions with our comprehensive analysis toolkit.
          </p>
        </div>

        {/* Session Manager */}
        <div className="mb-8">
          <SessionManager
            sessionId={sessionId}
            onNewSession={createNewSession}
            isLoading={isLoading}
          />
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step.id === currentStep
                      ? 'bg-chestnut border-chestnut text-white'
                      : step.id < currentStep
                      ? 'bg-green-500 border-green-500 text-white cursor-pointer hover:bg-green-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                  disabled={step.id > currentStep}
                >
                  {step.id < currentStep ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-charcoal' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionPage;