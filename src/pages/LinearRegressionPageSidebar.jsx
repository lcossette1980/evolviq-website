/**
 * Linear Regression Tool with Sidebar Layout
 * Uses new UnifiedInteractiveToolSidebar for improved UX
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedInteractiveToolSidebar from '../components/tools/UnifiedInteractiveToolSidebar';
import { REGRESSION_TOOL_CONFIG } from '../config/toolConfigs';

// Step components
import DataUploadStep from '../components/shared/DataUploadStep';
import ValidationResultsStep from '../components/shared/ValidationResultsStep';
import DataPreprocessingStep from '../components/regression/DataPreprocessingStep';
import ModelTrainingStep from '../components/regression/ModelTrainingStep';
import ResultsVisualization from '../components/regression/ResultsVisualization';
import PredictionInterface from '../components/regression/PredictionInterface';

const LinearRegressionPageSidebar = () => {
  const navigate = useNavigate();

  return (
    <UnifiedInteractiveToolSidebar
      toolConfig={REGRESSION_TOOL_CONFIG}
      toolType="regression"
    >
      {({ toolContext, currentStepConfig }) => {
        const { 
          stepData, 
          handleFileUpload, 
          processStep, 
          nextStep, 
          prevStep,
          goToStep, 
          isLoading,
          sessionId,
          resultTabs,
          activeResultTab,
          setActiveResultTab
        } = toolContext;

        switch (currentStepConfig.component) {
          case 'upload':
            return (
              <DataUploadStep
                onUpload={handleFileUpload}
                uploadedFile={stepData.uploadedFile}
                validationResults={stepData.uploadResults}
                showValidationResults={Boolean(stepData.uploadResults && stepData.uploadedFile)}
                onNext={nextStep}
                acceptedFormats=".csv,.json,.xlsx,.xls"
                title="Upload Dataset"
                description="Upload a CSV or Excel file with your data for regression analysis"
              />
            );

          case 'validate': {
            const validation = stepData.uploadResults;
            return (
              <ValidationResultsStep
                validationResults={validation}
                onNext={nextStep}
                onPrevious={prevStep}
                toolType="regression"
              />
            );
          }

          case 'preprocess':
            return (
              <DataPreprocessingStep
                validationResults={stepData.uploadResults}
                onPreprocess={(config) => {
                  const target = config.target_column;
                  const features = config.feature_columns || [];
                  processStep('preprocess', { 
                    target_column: target,
                    feature_columns: features.length > 0 ? features : undefined,
                    handle_missing: config.handle_missing || 'drop',
                    scaling_method: config.scaling_method || 'standard',
                    encoding_method: config.encoding_method || 'onehot'
                  })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                onPrevious={prevStep}
                isLoading={isLoading}
              />
            );

          case 'train':
            return (
              <ModelTrainingStep
                preprocessResults={stepData.preprocess}
                validationResults={stepData.uploadResults}
                onTrain={(config) => {
                  const models = config.models || ['linear_regression'];
                  const trainConfig = {
                    models: models,
                    test_size: config.test_size || 0.2,
                    cross_validation: config.cross_validation !== false,
                    cv_folds: config.cv_folds || 5
                  };
                  
                  processStep('train', trainConfig)
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                onPrevious={prevStep}
                isLoading={isLoading}
              />
            );

          case 'results':
            // Handle tabbed results if available
            if (resultTabs.length > 0) {
              const activeTab = resultTabs[activeResultTab];
              return (
                <div>
                  {/* Tab Navigation */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      {resultTabs.map((tab, index) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveResultTab(index)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeResultTab === index
                              ? 'border-chestnut text-chestnut'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <ResultsVisualization
                    trainingResults={stepData.train}
                    sessionId={sessionId}
                    activeTab={activeTab?.key}
                  />
                </div>
              );
            }
            
            // Default results view
            return (
              <ResultsVisualization
                trainingResults={stepData.train}
                sessionId={sessionId}
              />
            );

          case 'predict':
            return (
              <PredictionInterface
                trainingResults={stepData.train}
                preprocessResults={stepData.preprocess}
                sessionId={sessionId}
                onBack={prevStep}
              />
            );

          default:
            return (
              <div className="text-center py-8">
                <p className="text-charcoal/60">Step component not found: {currentStepConfig.component}</p>
                <button
                  onClick={() => goToStep(1)}
                  className="mt-4 text-chestnut hover:text-chestnut/80"
                >
                  Return to Start
                </button>
              </div>
            );
        }
      }}
    </UnifiedInteractiveToolSidebar>
  );
};

export default LinearRegressionPageSidebar;