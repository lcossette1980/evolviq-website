import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

// Shared Components
import DataUploadStep from '../components/shared/DataUploadStep';
import LoadingState from '../components/shared/LoadingState';
import StepNavigation from '../components/shared/StepNavigation';

// NLP-specific Components
import NLPConfigurationStep from '../components/nlp/NLPConfigurationStep';
import NLPAnalysisStep from '../components/nlp/NLPAnalysisStep';
import ResultsVisualization from '../components/nlp/ResultsVisualization';
import ExportStep from '../components/nlp/ExportStep';

const NLPExplorePageNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  
  // Data state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [nlpConfig, setNlpConfig] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, title: 'Upload', description: 'Upload text dataset' },
    { id: 2, title: 'Validate', description: 'Validate data quality' },
    { id: 3, title: 'Configure', description: 'Configure NLP tasks' },
    { id: 4, title: 'Analyze', description: 'Run NLP analysis' },
    { id: 5, title: 'Results', description: 'View results' },
    { id: 6, title: 'Export', description: 'Export & finish' }
  ];

  // Create session on mount
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch(buildUrl('/api/regression/session'), 
          createRequestConfig('POST', {
            name: 'NLP Analysis Session',
            description: 'Natural language processing and text analytics'
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

  const handleUpload = async (file, textColumn) => {
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
        `${buildUrl(API_CONFIG.ENDPOINTS.NLP.VALIDATE)}?session_id=${sessionId}&text_column=${encodeURIComponent(textColumn)}`,
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
          shape: [1000, 3],
          columns: ['text', 'category', 'rating'],
          memory_usage: '245 KB',
          missing_values: {}
        },
        text_column: textColumn || 'text',
        label_column: 'category',
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
    setNlpConfig(config);
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
        `${buildUrl(API_CONFIG.ENDPOINTS.NLP.ANALYZE)}?session_id=${sessionId}`,
        createRequestConfig('POST', {
          tasks: nlpConfig?.tasks || ['sentiment_analysis', 'keyword_extraction'],
          text_column: nlpConfig?.textColumn,
          label_column: nlpConfig?.labelColumn,
          preprocessing: nlpConfig?.preprocessing,
          analysis: nlpConfig?.analysis
        })
      );

      if (response.ok) {
        const result = await response.json();
        if (result?.sentiment_analysis || result?.keyword_extraction) {
          setAnalysisResults(result);
          setCurrentStep(5);
        } else {
          throw new Error('Invalid NLP response');
        }
      } else {
        throw new Error(`NLP analysis failed: ${response.status}`);
      }
    } catch (error) {
      console.error('NLP analysis error:', error);
      
      // Provide fallback data for demo
      const fallbackResults = {
        text_stats: {
          total_texts: 1000,
          avg_words_per_text: 24.5,
          avg_chars_per_text: 142.3,
          unique_words: 5420,
          languages: { 'en': 85, 'es': 10, 'fr': 3, 'other': 2 }
        },
        sentiment_analysis: [
          { method: 'VADER', positive: 45, negative: 25, neutral: 30 },
          { method: 'TextBlob', positive: 42, negative: 28, neutral: 30 },
          { method: 'ML Model', positive: 48, negative: 23, neutral: 29 }
        ],
        keyword_extraction: [
          { word: 'excellent', tfidf: 0.234, frequency: 156 },
          { word: 'delicious', tfidf: 0.221, frequency: 143 },
          { word: 'amazing', tfidf: 0.198, frequency: 134 },
          { word: 'terrible', tfidf: 0.187, frequency: 89 },
          { word: 'outstanding', tfidf: 0.176, frequency: 78 },
          { word: 'disappointing', tfidf: 0.165, frequency: 67 }
        ],
        topic_modeling: [
          { topic: 'Topic 0', words: ['food', 'delicious', 'restaurant', 'taste', 'meal'], weight: 0.25 },
          { topic: 'Topic 1', words: ['service', 'staff', 'friendly', 'quick', 'helpful'], weight: 0.22 },
          { topic: 'Topic 2', words: ['price', 'expensive', 'value', 'money', 'cost'], weight: 0.20 },
          { topic: 'Topic 3', words: ['ambiance', 'atmosphere', 'music', 'lighting', 'decor'], weight: 0.18 }
        ],
        text_classification: nlpConfig?.labelColumn ? [
          { model: 'SVM', accuracy: 0.923, precision: 0.925, recall: 0.923, f1: 0.924 },
          { model: 'Logistic Regression', accuracy: 0.891, precision: 0.894, recall: 0.891, f1: 0.893 },
          { model: 'Naive Bayes', accuracy: 0.847, precision: 0.851, recall: 0.847, f1: 0.849 }
        ] : []
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
    setNlpConfig(null);
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
            acceptedFormats={['.csv', '.xlsx', '.xls', '.json', '.txt']}
            title="Upload Text Dataset"
            description="Upload your text dataset for NLP analysis"
            requiresTargetColumn={true}
            targetColumnLabel="Text Column (column containing text data)"
            targetColumnPlaceholder="e.g., 'text', 'content', 'review'"
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
            description="Your text dataset has been validated and is ready for NLP analysis"
            isLoading={false}
          />
        );

      case 3:
        return (
          <NLPConfigurationStep
            validationResults={validationResults}
            onConfigure={handleConfiguration}
            isLoading={isLoading}
          />
        );

      case 4:
        return (
          <NLPAnalysisStep
            config={nlpConfig}
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
              NLP Explorer
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the NLP analysis tool.
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
            NLP Explorer
          </h1>
          <p className="text-lg text-pearl">
            Extract insights from text data with comprehensive natural language processing analysis
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

export default NLPExplorePageNew;