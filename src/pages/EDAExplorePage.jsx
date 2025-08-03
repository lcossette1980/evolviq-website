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
                onFileUpload={handleFileUpload}
                acceptedFileTypes={EDA_TOOL_CONFIG.allowedFileTypes}
                maxFileSize={EDA_TOOL_CONFIG.maxFileSize}
                uploadResults={stepData.uploadResults}
              />
            );

          case 'validate':
            return (
              <DataValidationStep
                uploadResults={stepData.uploadResults}
                onValidation={(results) => {
                  processStep('validate', results).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                validationResults={stepData.validate}
              />
            );

          case 'configure':
            return (
              <DataPreprocessingStep
                validationResults={stepData.validate}
                onConfiguration={(config) => {
                  processStep('configure', config).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                configurationResults={stepData.configure}
              />
            );

          case 'analyze':
            return (
              <AnalysisStep
                configurationResults={stepData.configure}
                onAnalysis={(params) => {
                  processStep('analyze', params).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                analysisResults={stepData.analyze}
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