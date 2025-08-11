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
                onUpload={handleFileUpload}
                uploadedFile={stepData.uploadedFile}
                validationResults={stepData.uploadResults}
                showValidationResults={Boolean(stepData.uploadResults && stepData.uploadedFile)}
                onNext={nextStep}
              />
            );

          case 'validate':
          case 'target':
          case 'configure':
            return (
              <ModelSelectionStep
                validationResults={stepData.uploadResults}
                onSelectModels={(selected) => {
                  processStep('configure', selected)
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={false}
              />
            );

          case 'train':
            return (
              <ModelTrainingStep
                selectedModels={stepData.configure}
                validationResults={stepData.uploadResults}
                onTrain={() => {
                  processStep('train', { models: stepData.configure })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={false}
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
