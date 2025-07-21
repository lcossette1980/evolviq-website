import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

// Shared Components
import StepNavigation from '../components/shared/StepNavigation';
import DataUploadStep from '../components/shared/DataUploadStep';
import LoadingState from '../components/shared/LoadingState';
import StepContainer from '../components/shared/StepContainer';

// EDA Specific Components
import DataValidationStep from '../components/eda/DataValidationStep';
import DataPreprocessingStep from '../components/eda/DataPreprocessingStep';
import AnalysisStep from '../components/eda/AnalysisStep';
import ResultsVisualization from '../components/eda/ResultsVisualization';
import ExportStep from '../components/eda/ExportStep';

const EDAExplorePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step Data
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [preprocessingResults, setPreprocessingResults] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const steps = [
    { 
      id: 1, 
      name: 'Upload Data', 
      description: 'Upload your dataset for analysis',
      component: 'upload' 
    },
    { 
      id: 2, 
      name: 'Validate Data', 
      description: 'Review data structure and quality',
      component: 'validate' 
    },
    { 
      id: 3, 
      name: 'Configure Analysis', 
      description: 'Set analysis parameters and cleaning options',
      component: 'configure' 
    },
    { 
      id: 4, 
      name: 'Run Analysis', 
      description: 'Perform comprehensive exploratory data analysis',
      component: 'analyze' 
    },
    { 
      id: 5, 
      name: 'View Results', 
      description: 'Explore insights and visualizations',
      component: 'results' 
    }
  ];

  useEffect(() => {
    createNewSession();
  }, []);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const sessionUrl = buildUrl('/api/regression/session');
      const requestConfig = createRequestConfig('POST', {
        name: 'EDA Analysis Session',
        description: 'Exploratory Data Analysis session'
      });
      
      const response = await fetch(sessionUrl, requestConfig);
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      setError('Failed to create session');
      console.error('Session creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataUpload = async (file) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${buildUrl(API_CONFIG.ENDPOINTS.EDA.VALIDATE)}?session_id=${sessionId}`,
        {
          method: 'POST',
          body: formData,
          timeout: 30000
        }
      );

      if (response.ok) {
        const result = await response.json();
        setValidationResults(result);
        setUploadedFile(file);
        setCurrentStep(2);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataValidation = () => {
    setCurrentStep(3);
  };

  const handlePreprocessing = async (config) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${buildUrl(API_CONFIG.ENDPOINTS.EDA.DATA_CLEANING)}?session_id=${sessionId}`,
        createRequestConfig('POST', config)
      );

      if (response.ok) {
        const result = await response.json();
        setPreprocessingResults(result);
        setCurrentStep(4);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Preprocessing failed');
      }
    } catch (error) {
      setError(`Preprocessing failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting EDA analysis with session:', sessionId);

      // Run all analyses in parallel
      const [qualityResponse, univariateResponse, bivariateResponse] = await Promise.all([
        fetch(`${buildUrl(API_CONFIG.ENDPOINTS.EDA.QUALITY_ASSESSMENT)}?session_id=${sessionId}`, 
          createRequestConfig('POST')),
        fetch(`${buildUrl(API_CONFIG.ENDPOINTS.EDA.UNIVARIATE_ANALYSIS)}?session_id=${sessionId}`, 
          createRequestConfig('POST')),
        fetch(`${buildUrl(API_CONFIG.ENDPOINTS.EDA.BIVARIATE_ANALYSIS)}?session_id=${sessionId}`, 
          createRequestConfig('POST'))
      ]);

      console.log('API Response statuses:', {
        quality: qualityResponse.status,
        univariate: univariateResponse.status, 
        bivariate: bivariateResponse.status
      });

      // Check each response and handle errors individually
      let quality = null;
      let univariate = null;
      let bivariate = null;

      if (qualityResponse.ok) {
        quality = await qualityResponse.json();
      } else {
        console.error('Quality assessment failed:', qualityResponse.status, qualityResponse.statusText);
      }

      if (univariateResponse.ok) {
        univariate = await univariateResponse.json();
      } else {
        console.error('Univariate analysis failed:', univariateResponse.status, univariateResponse.statusText);
      }

      if (bivariateResponse.ok) {
        bivariate = await bivariateResponse.json();
      } else {
        console.error('Bivariate analysis failed:', bivariateResponse.status, bivariateResponse.statusText);
      }

      console.log('Parsed API responses:', { quality, univariate, bivariate });

      setAnalysisResults({
        quality,
        univariate,
        bivariate
      });
      setCurrentStep(5);
    } catch (error) {
      console.error('Analysis error details:', error);
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= steps.length) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
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
            onUpload={handleDataUpload}
            isLoading={isLoading}
            error={error}
            title="Upload Your Dataset"
            description="Upload your CSV, Excel, or JSON file to begin exploratory data analysis"
          />
        );

      case 'validate':
        return (
          <DataValidationStep
            validationResults={validationResults}
            onValidate={handleDataValidation}
            fileName={uploadedFile?.name}
          />
        );

      case 'configure':
        return (
          <DataPreprocessingStep
            validationResults={validationResults}
            onPreprocess={handlePreprocessing}
            isLoading={isLoading}
          />
        );

      case 'analyze':
        return (
          <AnalysisStep
            onAnalyze={handleAnalysis}
            isLoading={isLoading}
            preprocessingResults={preprocessingResults}
          />
        );

      case 'results':
        return (
          <ResultsVisualization
            analysisResults={analysisResults}
            validationResults={validationResults}
            onNext={() => navigate('/dashboard')}
          />
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  if (!sessionId && !error) {
    return (
      <LoadingState 
        message="Initializing EDA session..."
        submessage="Setting up your analysis environment"
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

export default EDAExplorePage;