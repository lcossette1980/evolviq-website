/**
 * EDA Tool with Sidebar Layout
 * Uses new UnifiedInteractiveToolSidebar for improved UX
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedInteractiveToolSidebar from '../components/tools/UnifiedInteractiveToolSidebar';
import { EDA_TOOL_CONFIG } from '../config/toolConfigs';

// Step components
import DataUploadStep from '../components/shared/DataUploadStep';
import ValidationResultsStep from '../components/shared/ValidationResultsStep';
import EDAConfigurationStep from '../components/eda/EDAConfigurationStep';
import EDAAnalysisStep from '../components/eda/EDAAnalysisStep';
import ResultsVisualization from '../components/eda/ResultsVisualization';

const EDAExplorePageSidebar = () => {
  const navigate = useNavigate();

  return (
    <UnifiedInteractiveToolSidebar
      toolConfig={EDA_TOOL_CONFIG}
      toolType="eda"
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
                description="Upload a CSV or Excel file for exploratory data analysis"
              />
            );

          case 'validate': {
            const validation = stepData.uploadResults;
            return (
              <ValidationResultsStep
                validationResults={validation}
                onNext={nextStep}
                onPrevious={prevStep}
                toolType="eda"
              />
            );
          }

          case 'configure':
            return (
              <EDAConfigurationStep
                validationResults={stepData.uploadResults}
                onConfigure={(config) => {
                  processStep('configure', {
                    analysis_types: config.analysis_types || ['quality', 'univariate', 'bivariate'],
                    handle_missing: config.handle_missing || 'report',
                    correlation_threshold: config.correlation_threshold || 0.7,
                    outlier_method: config.outlier_method || 'iqr'
                  })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                onPrevious={prevStep}
                isLoading={isLoading}
              />
            );

          case 'analyze':
            return (
              <EDAAnalysisStep
                config={stepData.configure}
                validationResults={stepData.uploadResults}
                onAnalyze={() => {
                  processStep('analyze', stepData.configure)
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
                    analysisResults={stepData.analyze}
                    sessionId={sessionId}
                    activeTab={activeTab?.key}
                  />
                </div>
              );
            }
            
            // Default results view
            return (
              <ResultsVisualization
                analysisResults={stepData.analyze}
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

export default EDAExplorePageSidebar;