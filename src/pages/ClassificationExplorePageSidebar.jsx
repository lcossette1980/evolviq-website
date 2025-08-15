/**
 * Classification Tool with Sidebar Layout
 * Uses new UnifiedInteractiveToolSidebar for improved UX
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedInteractiveToolSidebar from '../components/tools/UnifiedInteractiveToolSidebar';
import { CLASSIFICATION_TOOL_CONFIG } from '../config/toolConfigs';

// Step components
import DataUploadStep from '../components/shared/DataUploadStep';
import ValidationResultsStep from '../components/shared/ValidationResultsStep';
import TargetSelectionStep from '../components/classification/TargetSelectionStep';
import ModelSelectionStep from '../components/classification/ModelSelectionStep';
import ModelTrainingStep from '../components/classification/ModelTrainingStep';
import ResultsVisualization from '../components/classification/ResultsVisualization';

const ClassificationExplorePageSidebar = () => {
  const navigate = useNavigate();

  return (
    <UnifiedInteractiveToolSidebar
      toolConfig={CLASSIFICATION_TOOL_CONFIG}
      toolType="classification"
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
                description="Upload a CSV or Excel file with your classification data"
              />
            );

          case 'validate': {
            const validation = stepData.uploadResults;
            return (
              <ValidationResultsStep
                validationResults={validation}
                onNext={nextStep}
                onPrevious={prevStep}
                toolType="classification"
              />
            );
          }

          case 'target':
            return (
              <TargetSelectionStep
                validationResults={stepData.uploadResults}
                onSelectTarget={(target) => {
                  processStep('selectTarget', { target_column: target })
                    .then(() => {
                      // After selecting target, preprocess the data
                      return processStep('preprocess', {
                        target_column: target,
                        handle_missing: 'drop',
                        scaling_method: 'standard',
                        encoding_method: 'onehot',
                        stratify: true,
                        test_size: 0.2
                      });
                    })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                onPrevious={prevStep}
                isLoading={isLoading}
              />
            );

          case 'configure':
            return (
              <ModelSelectionStep
                validationResults={stepData.uploadResults}
                preprocessResults={stepData.preprocess}
                onSelectModels={(models) => {
                  processStep('selectModels', { models })
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
                selectedModels={stepData.selectModels?.models || ['logistic_regression']}
                validationResults={stepData.uploadResults}
                onTrain={() => {
                  const models = stepData.selectModels?.models || ['logistic_regression'];
                  processStep('train', {
                    models: models,
                    cross_validation: true,
                    cv_folds: 5,
                    scoring_metric: 'accuracy'
                  })
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

export default ClassificationExplorePageSidebar;