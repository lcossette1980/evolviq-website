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
                onFileUpload={handleFileUpload}
                acceptedFileTypes={CLUSTERING_TOOL_CONFIG.allowedFileTypes}
                maxFileSize={CLUSTERING_TOOL_CONFIG.maxFileSize}
                uploadResults={stepData.uploadResults}
              />
            );

          case 'validate':
          case 'configure':
            return (
              <ClusterConfigurationStep
                uploadResults={stepData.uploadResults}
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
              <ClusterAnalysisStep
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

export default ClusteringExplorePage;