/**
 * Secure NLP Explorer Tool
 * Replaces NLPExplorePageNew.js with authenticated implementation
 */

import React from 'react';
import SecureToolBase from '../components/tools/SecureToolBase';
import DataUploadStep from '../components/shared/DataUploadStep';
import NLPConfigurationStep from '../components/nlp/NLPConfigurationStep';
import NLPAnalysisStep from '../components/nlp/NLPAnalysisStep';
import ResultsVisualization from '../components/nlp/ResultsVisualization';

const SecureNLPTool = () => {
  const steps = [
    { 
      id: 1, 
      name: 'Upload Data', 
      description: 'Upload your text data for analysis',
      component: 'upload' 
    },
    { 
      id: 2, 
      name: 'Validate Data', 
      description: 'Review text data structure and quality',
      component: 'validate' 
    },
    { 
      id: 3, 
      name: 'Configure Analysis', 
      description: 'Select NLP tasks and preprocessing options',
      component: 'configure' 
    },
    { 
      id: 4, 
      name: 'Run Analysis', 
      description: 'Perform natural language processing',
      component: 'analyze' 
    },
    { 
      id: 5, 
      name: 'View Results', 
      description: 'Explore NLP insights and visualizations',
      component: 'results' 
    }
  ];

  const renderStepContent = (toolState) => {
    const { currentStep, stepData, handleUpload, processStep, nextStep, isLoading } = toolState;

    switch (currentStep) {
      case 1:
        return (
          <DataUploadStep
            onFileUpload={async (file) => {
              const result = await handleUpload(file);
              if (result) {
                nextStep();
              }
            }}
            isLoading={isLoading}
            acceptedFileTypes=".csv,.json,.txt"
            maxFileSize="10MB"
            helpText="Upload a CSV file with text data, JSON file with text fields, or plain text file."
          />
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Data Validation</h3>
            
            {stepData[1] ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Validation Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Rows:</span>
                      <span className="ml-2 font-medium">{stepData[1].rows || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Text Columns:</span>
                      <span className="ml-2 font-medium">{stepData[1].text_columns?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Size:</span>
                      <span className="ml-2 font-medium">{stepData[1].size || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Encoding:</span>
                      <span className="ml-2 font-medium">{stepData[1].encoding || 'UTF-8'}</span>
                    </div>
                  </div>
                </div>

                {stepData[1].preview && (
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Data Preview</h4>
                    <div className="bg-white border rounded p-3 text-sm font-mono">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(stepData[1].preview, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <button
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Configuration
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No validation data available</p>
                <button
                  onClick={() => toolState.goToStep(1)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Go back to upload
                </button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <NLPConfigurationStep
            validationResults={stepData[1]}
            onConfigurationComplete={async (config) => {
              const result = await processStep(3, config);
              if (result) {
                nextStep();
              }
            }}
            isLoading={isLoading}
          />
        );

      case 4:
        return (
          <NLPAnalysisStep
            nlpConfig={stepData[3]}
            onAnalysisComplete={async (analysisData) => {
              const result = await processStep(4, analysisData);
              if (result) {
                nextStep();
              }
            }}
            isLoading={isLoading}
          />
        );

      case 5:
        return (
          <ResultsVisualization
            analysisResults={stepData[4]}
            nlpConfig={stepData[3]}
            validationResults={stepData[1]}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Invalid step</p>
          </div>
        );
    }
  };

  return (
    <SecureToolBase
      toolType="nlp"
      toolName="NLP Explorer"
      requiresPremium={false}
      steps={steps}
    >
      {renderStepContent}
    </SecureToolBase>
  );
};

export default SecureNLPTool;