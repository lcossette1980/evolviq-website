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
                onFileUpload={handleFileUpload}
                acceptedFileTypes={REGRESSION_TOOL_CONFIG.allowedFileTypes}
                maxFileSize={REGRESSION_TOOL_CONFIG.maxFileSize}
                uploadResults={stepData.uploadResults}
              />
            );

          case 'validate':
            return (
              <DataValidation
                uploadResults={stepData.uploadResults}
                onValidation={(results) => {
                  processStep('validate', results).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                validationResults={stepData.validate}
              />
            );

          case 'preprocess':
            return (
              <DataPreprocessing
                validationResults={stepData.validate}
                onPreprocessing={(config) => {
                  processStep('preprocess', config).then(() => {
                    nextStep();
                  }).catch(console.error);
                }}
                preprocessingResults={stepData.preprocess}
              />
            );

          case 'train':
            return (
              <ModelTraining
                preprocessingResults={stepData.preprocess}
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