import React, { useState, useMemo } from 'react';
import StepContainer from '../shared/StepContainer';

const TargetSelectionStep = ({ validationResults, onSelectTarget, isLoading }) => {
  const categorical = validationResults?.summary?.categorical_columns || [];
  const allColumns = validationResults?.summary?.columns || [];
  // Heuristic: prefer non-numeric columns; fallback to last column
  const defaultTarget = categorical[0] || allColumns?.[allColumns.length - 1] || '';
  const [target, setTarget] = useState(defaultTarget);

  const options = useMemo(() => {
    return (categorical.length ? categorical : allColumns).map((c) => ({ id: c, name: c }));
  }, [categorical, allColumns]);

  return (
    <StepContainer
      title="Select Target Variable"
      description="Choose the column to classify (categorical recommended)"
      currentStep={3}
      totalSteps={6}
      onNext={() => onSelectTarget(target)}
      canGoNext={Boolean(target)}
      nextLabel="Continue"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Target Column</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {options.map((opt) => (
              <label key={opt.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value={opt.id}
                  checked={target === opt.id}
                  onChange={(e) => setTarget(e.target.value)}
                  className="mr-3 text-chestnut focus:ring-chestnut"
                />
                <div className="flex-1">
                  <div className="font-medium text-charcoal">{opt.name}</div>
                </div>
              </label>
            ))}
          </div>
          {!categorical.length && (
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
              No categorical columns detected. You can still choose any column; it will be encoded.
            </p>
          )}
        </div>
      </div>
    </StepContainer>
  );
};

export default TargetSelectionStep;

