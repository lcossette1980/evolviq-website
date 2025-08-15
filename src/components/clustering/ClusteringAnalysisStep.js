import React from 'react';
import { Play, Layers } from 'lucide-react';

const ClusteringAnalysisStep = ({ config, validationResults, onAnalyze, onPrevious, isLoading }) => {
  const summary = validationResults?.summary || {};
  
  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Clustering Configuration</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-charcoal/70 mb-2">Algorithms</h4>
            <div className="space-y-1">
              {config?.algorithms?.map(algo => (
                <span key={algo} className="text-sm bg-bone px-3 py-1 rounded inline-block mr-2">
                  {algo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-charcoal/70 mb-2">Settings</h4>
            <div className="text-sm space-y-1">
              <div>Clusters: {config?.n_clusters_range?.[0]} - {config?.n_clusters_range?.[1]}</div>
              <div>Features: {config?.feature_columns?.length || 0} selected</div>
              <div>Scaling: {config?.scaling_method || 'standard'}</div>
              <div>Metric: {config?.optimization_metric?.replace('_', ' ') || 'silhouette'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Summary */}
      <div className="bg-bone border rounded-lg p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {summary.shape?.[0]?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-charcoal/60 text-sm">Samples</div>
          </div>
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {config?.feature_columns?.length || 0}
            </div>
            <div className="text-charcoal/60 text-sm">Features</div>
          </div>
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {config?.algorithms?.length || 0}
            </div>
            <div className="text-charcoal/60 text-sm">Algorithms</div>
          </div>
          <div>
            <div className="font-bold text-chestnut text-2xl">
              {((config?.n_clusters_range?.[1] - config?.n_clusters_range?.[0] + 1) * config?.algorithms?.length) || 0}
            </div>
            <div className="text-charcoal/60 text-sm">Experiments</div>
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
          <p className="text-charcoal/60">Running clustering analysis...</p>
          <p className="text-sm text-charcoal/40 mt-2">Testing multiple algorithms and parameters</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 text-center">
          <Layers size={48} className="mx-auto text-chestnut mb-4" />
          <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Cluster</h3>
          <p className="text-charcoal/70 mb-4">
            Find optimal clusters and patterns in your data
          </p>
          <div className="text-sm text-charcoal/50">
            This will test {config?.algorithms?.length || 0} algorithms across {config?.n_clusters_range?.[1] - config?.n_clusters_range?.[0] + 1} cluster counts
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
              Start Clustering
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClusteringAnalysisStep;