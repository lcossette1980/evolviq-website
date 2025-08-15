import React from 'react';
import { Play, BarChart } from 'lucide-react';

const EDAAnalysisStep = ({ config, validationResults, onAnalyze, onPrevious, isLoading }) => {
  const summary = validationResults?.summary || {};
  
  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Analysis Configuration</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-charcoal/70 mb-2">Analysis Types</h4>
            <div className="space-y-1">
              {config?.analysis_types?.map(type => (
                <div key={type} className="text-sm bg-bone px-3 py-1 rounded inline-block mr-2">
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-charcoal/70 mb-2">Settings</h4>
            <div className="text-sm space-y-1">
              <div>Missing Data: {config?.handle_missing || 'report'}</div>
              <div>Correlation Threshold: {config?.correlation_threshold || 0.7}</div>
              <div>Outlier Method: {config?.outlier_method || 'iqr'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Summary */}
      <div className="bg-bone border rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {summary.shape?.[0]?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-charcoal/60 text-sm">Rows</div>
          </div>
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {summary.shape?.[1] || 'N/A'}
            </div>
            <div className="text-charcoal/60 text-sm">Columns</div>
          </div>
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {config?.analysis_types?.length || 0}
            </div>
            <div className="text-charcoal/60 text-sm">Analysis Types</div>
          </div>
        </div>
      </div>

      {/* Analysis Action */}
      {isLoading ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-charcoal/60">Running exploratory data analysis...</p>
          <p className="text-sm text-charcoal/40 mt-2">This may take a moment for large datasets</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 text-center">
          <BarChart size={48} className="mx-auto text-chestnut mb-4" />
          <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Analyze</h3>
          <p className="text-charcoal/70 mb-4">
            Run comprehensive exploratory data analysis on your dataset
          </p>
          <div className="text-sm text-charcoal/50">
            This will generate visualizations and statistical insights
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="text-charcoal/60 hover:text-charcoal disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-chestnut text-white hover:bg-chestnut/90'
          }`}
        >
          {isLoading ? (
            <>Running Analysis...</>
          ) : (
            <>
              <Play size={20} />
              Start Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EDAAnalysisStep;