/**
 * Unified Clustering Tool - Replaces ClusteringExplorePageNew.js
 * Uses UnifiedInteractiveTool to eliminate code duplication
 */

import React from 'react';
import UnifiedInteractiveTool from '../components/tools/UnifiedInteractiveTool';
import { CLUSTERING_TOOL_CONFIG } from '../config/toolConfigs';

// Clustering-specific step components
import DataUploadStep from '../components/shared/DataUploadStep';
import ClusterConfigurationStep from '../components/clustering/ClusterConfigurationStep';
import ClusterAnalysisStep from '../components/clustering/ClusterAnalysisStep';
import ResultsVisualization from '../components/clustering/ResultsVisualization';
import ExportStep from '../components/clustering/ExportStep';

const ClusteringExplorePage = () => {
  return (
    <UnifiedInteractiveTool 
      toolConfig={CLUSTERING_TOOL_CONFIG}
      toolType="clustering"
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
          case 'configure':
            return (
              <ClusterConfigurationStep
                validationResults={stepData.uploadResults}
                onConfigure={(config) => {
                  processStep('configure', config)
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={false}
              />
            );

          case 'analyze':
            return (
              <ClusterAnalysisStep
                config={stepData.configure}
                validationResults={stepData.uploadResults}
                onAnalyze={() => {
                  processStep('analyze', {
                    algorithms: stepData.configure?.algorithms,
                    minClusters: stepData.configure?.minClusters,
                    maxClusters: stepData.configure?.maxClusters,
                    scalingMethod: stepData.configure?.scalingMethod,
                    dimensionalityReduction: stepData.configure?.enableDimensionalityReduction ? 'pca' : 'none'
                  })
                    .then(() => nextStep())
                    .catch(console.error);
                }}
                isLoading={false}
              />
            );

          case 'results':
            return (
              <ResultsVisualization
                analysisResults={stepData.analyze}
                validationResults={stepData.uploadResults}
                onNext={() => {}}
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

export default ClusteringExplorePage;
