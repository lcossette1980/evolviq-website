/**
 * Unified EDA Tool - Replaces EDAExplorePageNew.js
 * Uses UnifiedInteractiveTool to eliminate code duplication
 */

import React from 'react';
import UnifiedInteractiveTool from '../components/tools/UnifiedInteractiveTool';
import { EDA_TOOL_CONFIG } from '../config/toolConfigs';

// EDA-specific step components
import DataUploadStep from '../components/shared/DataUploadStep';
import DataValidationStep from '../components/eda/DataValidationStep';
import DataPreprocessingStep from '../components/eda/DataPreprocessingStep';
import AnalysisStep from '../components/eda/AnalysisStep';
import ResultsVisualization from '../components/eda/ResultsVisualization';

const EDAExplorePage = () => {
  return (
    <UnifiedInteractiveTool 
      toolConfig={EDA_TOOL_CONFIG}
      toolType="eda"
    >
      {({ toolContext, currentStepConfig }) => {
        const { currentStep, stepData, handleFileUpload, processStep, nextStep } = toolContext;

        switch (currentStepConfig.component) {
          case 'upload':
            return (
              <DataUploadStep
                onUpload={handleFileUpload}
                uploadedFile={stepData.uploadedFile}
                validationResults={stepData.uploadResults}
                showValidationResults={Boolean(stepData.uploadResults && stepData.uploadedFile)}
                onNext={nextStep}
              />
            );

          case 'validate':
            return (
              <DataValidationStep
                validationResults={stepData.uploadResults}
                fileName={stepData.uploadedFile?.name}
                onValidate={() => {
                  // Store validation results locally and continue
                  processStep('validate', stepData.uploadResults)
                    .then(() => nextStep())
                    .catch(console.error);
                }}
              />
            );

          case 'configure':
            return (
              <DataPreprocessingStep
                validationResults={stepData.uploadResults}
                onPreprocess={(config) => {
                  processStep('configure', config)
                    .then(() => nextStep())
                    .catch(console.error);
                }}
              />
            );

          case 'analyze':
            return (
              <AnalysisStep
                preprocessingResults={stepData.configure}
                onAnalyze={() => {
                  // For now, mark analyze as complete locally
                  processStep('analyze', { startedAt: new Date().toISOString() })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
              />
            );

          case 'results':
            return (
              <ResultsVisualization
                analysisResults={stepData.analyze}
                allStepData={stepData}
                toolContext={toolContext}
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

export default EDAExplorePage;
