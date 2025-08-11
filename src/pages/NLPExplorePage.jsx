/**
 * Unified NLP Tool - Replaces SecureNLPTool.jsx
 * Uses UnifiedInteractiveTool for shared UI/UX
 */

import React from 'react';
import UnifiedInteractiveTool from '../components/tools/UnifiedInteractiveTool';
import { NLP_TOOL_CONFIG } from '../config/toolConfigs';

// Shared + NLP-specific components
import DataUploadStep from '../components/shared/DataUploadStep';
import NLPConfigurationStep from '../components/nlp/NLPConfigurationStep';
import NLPAnalysisStep from '../components/nlp/NLPAnalysisStep';
import ResultsVisualization from '../components/nlp/ResultsVisualization';

const NLPExplorePage = () => {
  return (
    <UnifiedInteractiveTool
      toolConfig={NLP_TOOL_CONFIG}
      toolType="nlp"
    >
      {({ toolContext, currentStepConfig }) => {
        const { stepData, handleFileUpload, processStep, nextStep, goToStep, isLoading } = toolContext;

        switch (currentStepConfig.component) {
          case 'upload':
            return (
              <DataUploadStep
                onUpload={handleFileUpload}
                uploadedFile={stepData.uploadedFile}
                validationResults={stepData.uploadResults}
                showValidationResults={Boolean(stepData.uploadResults && stepData.uploadedFile)}
                onNext={nextStep}
                acceptedFormats={'.csv,.json,.txt'}
                title="Upload Text Dataset"
                description="Upload a CSV, JSON, or TXT file with your text data"
              />
            );

          case 'validate': {
            const validation = stepData.uploadResults;
            return (
              <div className="space-y-6">
                <div className="text-2xl font-serif font-bold text-charcoal">Data Validation</div>

                {validation ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Validation Results</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-charcoal/60">Rows:</span>
                          <span className="ml-2 font-medium">{validation.rows || validation.summary?.shape?.[0] || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/60">Text Columns:</span>
                          <span className="ml-2 font-medium">{validation.text_columns?.length || 1}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/60">Total Size:</span>
                          <span className="ml-2 font-medium">{validation.size || validation.summary?.memory_usage || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-charcoal/60">Encoding:</span>
                          <span className="ml-2 font-medium">{validation.encoding || 'UTF-8'}</span>
                        </div>
                      </div>
                    </div>

                    {validation.preview && (
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Data Preview</h4>
                        <div className="bg-bone border rounded p-3 text-sm font-mono">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(validation.preview, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        onClick={nextStep}
                        className="bg-chestnut text-white px-6 py-2 rounded-lg hover:bg-chestnut/90"
                      >
                        Continue to Configuration
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-charcoal/60">No validation data available</p>
                    <button
                      onClick={() => goToStep(1)}
                      className="mt-4 text-chestnut hover:text-chestnut/80"
                    >
                      Go back to upload
                    </button>
                  </div>
                )}
              </div>
            );
          }

          case 'configure':
            return (
              <NLPConfigurationStep
                validationResults={stepData.uploadResults}
                onConfigure={(config) => {
                  processStep('configure', config)
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={isLoading}
              />
            );

          case 'analyze':
            return (
              <NLPAnalysisStep
                config={stepData.configure}
                validationResults={stepData.uploadResults}
                onAnalyze={() => {
                  processStep('analyze', { config: stepData.configure })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={isLoading}
              />
            );

          case 'results':
            return (
              <ResultsVisualization
                analysisResults={stepData.analyze}
                validationResults={stepData.uploadResults}
              />
            );

          default:
            return (
              <div className="text-center py-8">
                <p className="text-charcoal/60">Step component not found: {currentStepConfig.component}</p>
              </div>
            );
        }
      }}
    </UnifiedInteractiveTool>
  );
};

export default NLPExplorePage;

