/**
 * Unified Classification Tool - Replaces ClassificationExplorePageNew.js
 * Uses UnifiedInteractiveTool to eliminate code duplication
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedInteractiveTool from '../components/tools/UnifiedInteractiveTool';
import { CLASSIFICATION_TOOL_CONFIG } from '../config/toolConfigs';

// Classification-specific step components
import DataUploadStep from '../components/shared/DataUploadStep';
import ModelSelectionStep from '../components/classification/ModelSelectionStep';
import TargetSelectionStep from '../components/classification/TargetSelectionStep';
import ModelTrainingStep from '../components/classification/ModelTrainingStep';
import ResultsVisualization from '../components/classification/ResultsVisualization';
import ExportStep from '../components/classification/ExportStep';

const ClassificationExplorePage = () => {
  const navigate = useNavigate();
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
            return (
              <div className="text-center py-8 text-charcoal/60">Validation complete. Continue to select target.</div>
            );

          case 'target':
            return (
              <TargetSelectionStep
                validationResults={stepData.uploadResults}
                onSelectTarget={(target) => {
                  // Kick off server-side preprocessing with target
                  processStep('preprocess', { target_column: target, config: {} })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={false}
              />
            );

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
                  const target = stepData.preprocess?.selected_target || stepData.preprocess?.target_column;
                  const config = { models_to_include: stepData.configure || [] };
                  processStep('train', { config, target_column: target })
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
                validationResults={stepData.uploadResults}
                sessionId={toolContext.sessionId}
                onNext={() => navigate('/dashboard')}
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
