/**
 * Unified Classification Tool - Replaces ClassificationExplorePageNew.js
 * Uses UnifiedInteractiveTool to eliminate code duplication
 */

import React from 'react';
import UnifiedInteractiveTool from '../components/tools/UnifiedInteractiveTool';
import { CLASSIFICATION_TOOL_CONFIG } from '../config/toolConfigs';

// Classification-specific step components
import DataUploadStep from '../components/shared/DataUploadStep';
import ModelSelectionStep from '../components/classification/ModelSelectionStep';
import ModelTrainingStep from '../components/classification/ModelTrainingStep';
import ResultsVisualization from '../components/classification/ResultsVisualization';
import ExportStep from '../components/classification/ExportStep';

const ClassificationExplorePage = () => {
  return (
    <UnifiedInteractiveTool 
      toolConfig={CLASSIFICATION_TOOL_CONFIG}
      toolType="classification"
    >
      {({ toolContext, currentStepConfig }) => {
        const { currentStep, stepData, handleFileUpload, processStep, nextStep } = toolContext;

        switch (currentStepConfig.component) {
          case 'upload':
            return (
              <DataUploadStep
                onFileUpload={handleFileUpload}
                acceptedFileTypes={CLASSIFICATION_TOOL_CONFIG.allowedFileTypes}
                maxFileSize={CLASSIFICATION_TOOL_CONFIG.maxFileSize}
                uploadResults={stepData.uploadResults}
              />
            );

          case 'validate':
          case 'target':
          case 'configure':
            return (
              <ModelSelectionStep
                uploadResults={stepData.uploadResults}
                onConfiguration={(config) => {
                  processStep('configure', config).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                configurationResults={stepData.configure}
              />
            );

          case 'train':
            return (
              <ModelTrainingStep
                configurationResults={stepData.configure}
                onTraining={(params) => {
                  processStep('train', params).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                trainingResults={stepData.train}
              />
            );

          case 'results':
            return (
              <ResultsVisualization
                trainingResults={stepData.train}
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

export default ClassificationExplorePage;