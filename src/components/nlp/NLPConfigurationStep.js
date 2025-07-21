import React, { useState } from 'react';
import { Settings, Type, Brain, Info } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const NLPConfigurationStep = ({ validationResults, onConfigure, isLoading }) => {
  const [config, setConfig] = useState({
    tasks: ['sentiment_analysis', 'text_classification'],
    textColumn: validationResults?.text_column || '',
    labelColumn: validationResults?.label_column || '',
    preprocessing: {
      lowercase: true,
      removePunctuation: true,
      removeStopwords: true,
      lemmatization: true,
      stemming: false,
      removeHtml: true,
      removeUrls: true,
      removeNumbers: false
    },
    analysis: {
      maxFeatures: 10000,
      ngramRange: [1, 2],
      minDf: 2,
      maxDf: 0.95
    }
  });

  const availableTasks = [
    { 
      id: 'sentiment_analysis', 
      name: 'Sentiment Analysis', 
      description: 'Analyze emotional tone and polarity of text',
      icon: '😊',
      complexity: 'Medium'
    },
    { 
      id: 'text_classification', 
      name: 'Text Classification', 
      description: 'Classify text into predefined categories',
      icon: '📁',
      complexity: 'High'
    },
    { 
      id: 'topic_modeling', 
      name: 'Topic Modeling', 
      description: 'Discover hidden themes and topics in text',
      icon: '🧩',
      complexity: 'High'
    },
    { 
      id: 'keyword_extraction', 
      name: 'Keyword Extraction', 
      description: 'Extract important keywords and phrases',
      icon: '🔑',
      complexity: 'Low'
    },
    { 
      id: 'text_similarity', 
      name: 'Text Similarity', 
      description: 'Find similar documents and measure semantic similarity',
      icon: '🔗',
      complexity: 'Medium'
    },
    { 
      id: 'language_detection', 
      name: 'Language Detection', 
      description: 'Identify the language of text documents',
      icon: '🌐',
      complexity: 'Low'
    }
  ];

  const toggleTask = (taskId) => {
    setConfig(prev => ({
      ...prev,
      tasks: prev.tasks.includes(taskId)
        ? prev.tasks.filter(id => id !== taskId)
        : [...prev.tasks, taskId]
    }));
  };

  const handlePreprocessingChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      preprocessing: {
        ...prev.preprocessing,
        [key]: value
      }
    }));
  };

  const handleAnalysisChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        [key]: value
      }
    }));
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    onConfigure(config);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StepContainer
      title="Select Tasks"
      description="Choose NLP analysis tasks to run"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      canGoNext={config.tasks.length > 0 && config.textColumn}
      nextLabel="Start Analysis"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Task Selection */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Select Tasks ({config.tasks.length} selected)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTasks.map(task => {
              const isSelected = config.tasks.includes(task.id);
              const requiresLabels = ['text_classification'].includes(task.id);
              const isDisabled = requiresLabels && !config.labelColumn;
              
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isDisabled 
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : isSelected 
                        ? 'border-chestnut bg-chestnut text-white' 
                        : 'border-gray-200 bg-white hover:border-chestnut'
                  }`}
                  onClick={() => !isDisabled && toggleTask(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{task.name}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      isSelected ? 'bg-white' : 'border border-gray-300'
                    }`} />
                  </div>
                  {requiresLabels && !config.labelColumn && (
                    <div className="text-xs text-red-600 mt-1">
                      Requires labels
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column Configuration */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Data Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Text Column
              </label>
              <select
                value={config.textColumn}
                onChange={(e) => handleConfigChange('textColumn', e.target.value)}
                className="w-full px-3 py-2 border border-khaki/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="">Select text column...</option>
                {validationResults?.summary?.columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Label Column (Optional)
              </label>
              <select
                value={config.labelColumn}
                onChange={(e) => handleConfigChange('labelColumn', e.target.value)}
                className="w-full px-3 py-2 border border-khaki/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="">No labels</option>
                {validationResults?.summary?.columns?.filter(col => col !== config.textColumn).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
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
                <div className="text-charcoal/60">Texts</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {validationResults.summary?.shape?.[1] || 'N/A'}
                </div>
                <div className="text-charcoal/60">Columns</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config.tasks.length}
                </div>
                <div className="text-charcoal/60">Tasks</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config.labelColumn ? 'Yes' : 'No'}
                </div>
                <div className="text-charcoal/60">Labels</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default NLPConfigurationStep;