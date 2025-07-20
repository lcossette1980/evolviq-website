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
      title="Configure NLP Analysis"
      description="Select analysis tasks and preprocessing options"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      canGoNext={config.tasks.length > 0 && config.textColumn}
      nextLabel="Start NLP Analysis"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Configuration Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Info size={16} />
            NLP Analysis Configuration
          </h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• <strong>Multiple tasks</strong> can be selected for comprehensive text analysis</p>
            <p>• <strong>Text preprocessing</strong> will be applied consistently across all tasks</p>
            <p>• <strong>Advanced parameters</strong> are optimized for most datasets</p>
            <p>• Results will include visualizations and actionable insights</p>
          </div>
        </div>

        {/* Column Selection */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Column Configuration</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Text Column
              </label>
              <select
                value={config.textColumn}
                onChange={(e) => handleConfigChange('textColumn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="">Select text column...</option>
                {validationResults?.summary?.columns?.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-xs text-charcoal/50 mt-1">
                Column containing the text data to analyze
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Label Column (Optional)
              </label>
              <select
                value={config.labelColumn}
                onChange={(e) => handleConfigChange('labelColumn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="">No labels (unsupervised only)</option>
                {validationResults?.summary?.columns?.filter(col => col !== config.textColumn).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              <p className="text-xs text-charcoal/50 mt-1">
                Column containing category labels for supervised tasks
              </p>
            </div>
          </div>
        </div>

        {/* Task Selection */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Brain size={20} />
            Select NLP Tasks ({config.tasks.length} selected)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTasks.map(task => {
              const isSelected = config.tasks.includes(task.id);
              const requiresLabels = ['text_classification'].includes(task.id);
              const isDisabled = requiresLabels && !config.labelColumn;
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isDisabled 
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : isSelected 
                        ? 'border-chestnut bg-chestnut/5 shadow-md cursor-pointer' 
                        : 'border-gray-200 bg-white hover:border-chestnut/50 cursor-pointer'
                  }`}
                  onClick={() => !isDisabled && toggleTask(task.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{task.icon}</span>
                      <h4 className="font-semibold text-charcoal pr-2">{task.name}</h4>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 border-chestnut flex-shrink-0 ${
                      isSelected ? 'bg-chestnut' : 'bg-transparent'
                    }`} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/70">Complexity:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(task.complexity)}`}>
                        {task.complexity}
                      </span>
                    </div>
                    
                    <p className="text-xs text-charcoal/60 leading-relaxed">
                      {task.description}
                    </p>
                    
                    {requiresLabels && !config.labelColumn && (
                      <p className="text-xs text-red-600 mt-2">
                        Requires label column
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preprocessing Options */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Type size={20} />
            Text Preprocessing Options
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              lowercase: 'Convert to lowercase',
              removePunctuation: 'Remove punctuation',
              removeStopwords: 'Remove stopwords',
              lemmatization: 'Apply lemmatization',
              stemming: 'Apply stemming',
              removeHtml: 'Remove HTML tags',
              removeUrls: 'Remove URLs',
              removeNumbers: 'Remove numbers'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.preprocessing[key]}
                  onChange={(e) => handlePreprocessingChange(key, e.target.checked)}
                  className="text-chestnut"
                />
                <div>
                  <div className="font-medium">{label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Parameters */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Settings size={20} />
            Advanced Parameters
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Maximum Features
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                step="1000"
                value={config.analysis.maxFeatures}
                onChange={(e) => handleAnalysisChange('maxFeatures', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              />
              <p className="text-xs text-charcoal/50 mt-1">
                Maximum number of features to extract from text
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                N-gram Range
              </label>
              <select
                value={`${config.analysis.ngramRange[0]}-${config.analysis.ngramRange[1]}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-').map(Number);
                  handleAnalysisChange('ngramRange', [min, max]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="1-1">Unigrams (1-1)</option>
                <option value="1-2">Unigrams + Bigrams (1-2)</option>
                <option value="1-3">Unigrams + Bigrams + Trigrams (1-3)</option>
                <option value="2-2">Bigrams only (2-2)</option>
                <option value="2-3">Bigrams + Trigrams (2-3)</option>
              </select>
              <p className="text-xs text-charcoal/50 mt-1">
                Range of n-grams to consider for feature extraction
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-bone border rounded-lg p-4">
          <h4 className="font-medium text-charcoal mb-2">Analysis Configuration</h4>
          <div className="text-sm text-charcoal/70 space-y-1">
            <div>• Selected tasks: {config.tasks.length}</div>
            <div>• Text column: {config.textColumn || 'Not selected'}</div>
            <div>• Label column: {config.labelColumn || 'None (unsupervised)'}</div>
            <div>• Preprocessing steps: {Object.values(config.preprocessing).filter(Boolean).length}/8 enabled</div>
            <div>• Estimated analysis time: {Math.ceil(config.tasks.length * 2)} - {config.tasks.length * 5} minutes</div>
          </div>
        </div>

        {(config.tasks.length === 0 || !config.textColumn) && (
          <div className="text-center text-charcoal/60 py-4">
            Please select at least one task and specify the text column to continue
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default NLPConfigurationStep;