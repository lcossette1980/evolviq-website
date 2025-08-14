import React from 'react';
import { Play } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const ModelTrainingStep = ({ selectedModels, validationResults, onTrain, isLoading }) => {
  const targetClasses = validationResults?.summary?.target_classes || {};
  const classCounts = Object.values(targetClasses);
  const minClass = classCounts.length ? Math.min(...classCounts) : 0;
  const hasRareClass = minClass < 2; // stratified split needs at least 2 per class
  const warnings = [];
  if (hasRareClass) warnings.push('One or more classes have fewer than 2 samples. Stratified split may fail; we will retry without stratify. Consider collecting more samples.');
  return (
    <StepContainer
      title="Train Models"
      description="Train and evaluate classification models"
      currentStep={4}
      totalSteps={6}
      onNext={onTrain}
      canGoNext={!isLoading}
      nextLabel={isLoading ? "Training..." : "Start Training"}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Before You Train</h3>
            <ul className="list-disc list-inside text-yellow-800 text-sm">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
        {/* Selected Models */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Selected Models ({selectedModels?.length || 0})
          </h3>
          
          <div className="grid md:grid-cols-4 gap-3">
            {selectedModels?.map(modelId => (
              <div key={modelId} className="p-3 bg-bone rounded-lg border text-center">
                <div className="font-medium text-charcoal text-sm">
                  {modelId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Summary */}
        {validationResults && (
          <div className="bg-bone border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-chestnut">
                  {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-charcoal/60">Samples</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {(validationResults.summary?.shape?.[1] - 1) || 'N/A'}
                </div>
                <div className="text-charcoal/60">Features</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {Object.keys(validationResults.summary?.target_classes || {}).length || 'N/A'}
                </div>
                <div className="text-charcoal/60">Classes</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {selectedModels?.length || 0}
                </div>
                <div className="text-charcoal/60">Models</div>
              </div>
            </div>
          </div>
        )}

        {/* Training Action */}
        {isLoading ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-charcoal/60">Training models...</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Train</h3>
            <p className="text-charcoal/70">Train {selectedModels?.length || 0} models with cross-validation</p>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default ModelTrainingStep;
