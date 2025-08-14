import React, { useState } from 'react';
import regressionAPI from '../../services/regressionAPI';

const PredictionInterface = ({ sessionId, featureColumns, trainingResults }) => {
  const [inputValues, setInputValues] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  
  // Guard against missing feature columns
  if (!featureColumns || !Array.isArray(featureColumns) || featureColumns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500">
          No feature columns available. Please complete the training step first.
        </div>
      </div>
    );
  }

  const handleInputChange = (feature, value) => {
    setInputValues(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handlePredict = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert string values to numbers where appropriate
      const numericInputs = {};
      Object.entries(inputValues).forEach(([key, value]) => {
        const numValue = parseFloat(value);
        numericInputs[key] = isNaN(numValue) ? value : numValue;
      });
      
      const result = await regressionAPI.makePrediction(sessionId, numericInputs);
      
      if (result.success) {
        setPrediction(result.prediction);
        setPredictionHistory(prev => [
          { 
            id: Date.now(),
            inputs: { ...numericInputs },
            prediction: result.prediction,
            timestamp: new Date().toLocaleString(),
            model: result.model_used
          },
          ...prev.slice(0, 9) // Keep last 10 predictions
        ]);
      } else {
        setError(result.error || 'Prediction failed');
      }
    } catch (error) {
      setError(`Prediction failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearInputs = () => {
    setInputValues({});
    setPrediction(null);
    setError(null);
  };

  const handleUsePrediction = (historicalPrediction) => {
    setInputValues(historicalPrediction.inputs);
    setPrediction(historicalPrediction.prediction);
  };

  const isFormValid = () => {
    return featureColumns.every(feature => 
      inputValues[feature] !== undefined && 
      inputValues[feature] !== ''
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Make Predictions
        </h2>
        <p className="text-charcoal/70">
          Use your trained model to make predictions on new data. Enter values for all features to get a prediction.
        </p>
      </div>

      {/* Model Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-md font-medium text-green-800 mb-2">Active Model</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-700">
            <strong>{trainingResults?.best_model?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
          </span>
          <span className="text-green-700">
            R² Score: <strong>{trainingResults?.training_summary?.best_r2_score?.toFixed(3)}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-charcoal mb-4">Input Features</h3>
            
            <div className="space-y-4">
              {featureColumns.map((feature) => (
                <div key={feature}>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={inputValues[feature] || ''}
                    onChange={(e) => handleInputChange(feature, e.target.value)}
                    placeholder={`Enter ${feature}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-chestnut"
                  />
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePredict}
                disabled={!isFormValid() || isLoading}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  !isFormValid() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-chestnut text-white hover:bg-chestnut/90'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Predicting...
                  </div>
                ) : (
                  'Predict'
                )}
              </button>
              
              <button
                onClick={handleClearInputs}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Current Prediction */}
          {prediction !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Prediction Result</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {typeof prediction === 'number' ? prediction.toFixed(3) : prediction}
                </div>
                <div className="text-sm text-blue-700">
                  Predicted using {trainingResults?.best_model?.replace('_', ' ')} model
                </div>
              </div>
            </div>
          )}

          {/* Prediction History */}
          {predictionHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-charcoal mb-4">Prediction History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {predictionHistory.map((pred) => (
                  <div 
                    key={pred.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleUsePrediction(pred)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-charcoal">
                        Result: {pred.prediction.toFixed(3)}
                      </span>
                      <span className="text-xs text-charcoal/60">
                        {pred.timestamp}
                      </span>
                    </div>
                    
                    <div className="text-sm text-charcoal/70">
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(pred.inputs).slice(0, 4).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                        {Object.keys(pred.inputs).length > 4 && (
                          <div className="text-xs text-charcoal/50 col-span-2">
                            +{Object.keys(pred.inputs).length - 4} more features...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-blue-600">
                      Click to reuse these inputs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="bg-pearl/20 rounded-lg p-4">
            <h4 className="text-md font-medium text-charcoal mb-2">💡 Tips</h4>
            <ul className="text-sm text-charcoal/70 space-y-1">
              <li>• Enter numeric values for all features</li>
              <li>• Click on historical predictions to reuse inputs</li>
              <li>• Model confidence depends on data similarity to training set</li>
              <li>• Use values within the range of your training data for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionInterface;