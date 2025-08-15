/**
 * Unified Linear Regression Tool - Replaces old LinearRegressionPage.js
 * Uses UnifiedInteractiveTool to eliminate code duplication
 */

import React from 'react';
import UnifiedInteractiveTool from '../components/tools/UnifiedInteractiveTool';
import { REGRESSION_TOOL_CONFIG } from '../config/toolConfigs';

// Regression-specific step components
import DataUploadStep from '../components/shared/DataUploadStep';
import DataValidation from '../components/regression/DataValidation';
import DataPreprocessing from '../components/regression/DataPreprocessing';
import ModelTraining from '../components/regression/ModelTraining';
import ResultsVisualization from '../components/regression/ResultsVisualization';
import PredictionInterface from '../components/regression/PredictionInterface';

const LinearRegressionPage = () => {
  return (
    <UnifiedInteractiveTool 
      toolConfig={REGRESSION_TOOL_CONFIG}
      toolType="regression"
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
              <DataValidation
                validationResults={stepData.uploadResults}
                onValidate={(selectedTarget) => {
                  processStep('validate', { target: selectedTarget })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={false}
              />
            );

          case 'preprocess':
            return (
              <DataPreprocessing
                validationResults={{ ...(stepData.uploadResults || {}), selectedTarget: stepData.validate?.target }}
                onPreprocess={(config) => {
                  const target = stepData.validate?.target;
                  processStep('preprocess', { config, target_column: target })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                preprocessingResults={stepData.preprocess}
              />
            );

          case 'train':
            return (
              <ModelTraining
                preprocessingResults={stepData.preprocess}
                onTrain={(config) => {
                  const target = stepData.validate?.target;
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
                sessionId={toolContext.sessionId}
              />
            );

          case 'predict':
            return (
              <PredictionInterface
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

export default LinearRegressionPage;
