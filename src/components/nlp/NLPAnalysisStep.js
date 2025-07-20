import React from 'react';
import { Brain, Type, MessageCircle, Play } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const NLPAnalysisStep = ({ config, validationResults, onAnalyze, isLoading }) => {
  const taskDetails = {
    sentiment_analysis: { name: 'Sentiment Analysis', icon: '😊', complexity: 'Medium' },
    text_classification: { name: 'Text Classification', icon: '📁', complexity: 'High' },
    topic_modeling: { name: 'Topic Modeling', icon: '🧩', complexity: 'High' },
    keyword_extraction: { name: 'Keyword Extraction', icon: '🔑', complexity: 'Low' },
    text_similarity: { name: 'Text Similarity', icon: '🔗', complexity: 'Medium' },
    language_detection: { name: 'Language Detection', icon: '🌐', complexity: 'Low' }
  };

  const analysisSteps = [
    {
      title: 'Text Preprocessing',
      description: 'Clean and normalize text data for analysis',
      tasks: ['Text cleaning', 'Tokenization', 'Stopword removal', 'Lemmatization/Stemming']
    },
    {
      title: 'Feature Extraction',
      description: 'Convert text to numerical representations',
      tasks: ['TF-IDF vectorization', 'N-gram extraction', 'Feature selection', 'Dimensionality handling']
    },
    {
      title: 'Task Execution',
      description: 'Run selected NLP analysis tasks',
      tasks: ['Model training', 'Pattern detection', 'Score calculation', 'Result aggregation']
    },
    {
      title: 'Insight Generation',
      description: 'Generate visualizations and actionable insights',
      tasks: ['Statistical analysis', 'Visualization creation', 'Pattern interpretation', 'Report compilation']
    }
  ];

  return (
    <StepContainer
      title="Run NLP Analysis"
      description="Execute comprehensive natural language processing analysis"
      currentStep={4}
      totalSteps={6}
      onNext={onAnalyze}
      canGoNext={!isLoading}
      nextLabel={isLoading ? "Analyzing..." : "Start Analysis"}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Analysis Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Analysis Overview</h3>
          <p className="text-blue-700">
            The NLP analysis will process your text data through multiple stages including preprocessing, 
            feature extraction, and task-specific analysis. Results will include comprehensive insights 
            and visualizations for each selected task.
          </p>
        </div>

        {/* Selected Tasks */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Brain size={20} />
            Selected Analysis Tasks ({config?.tasks?.length || 0})
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config?.tasks?.map(taskId => {
              const task = taskDetails[taskId];
              if (!task) return null;
              
              return (
                <div key={taskId} className="p-4 bg-bone rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <div className="font-medium text-charcoal">{task.name}</div>
                      <div className="text-sm text-charcoal/60">
                        Complexity: {task.complexity}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analysis Process */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Analysis Process</h3>
          
          <div className="space-y-4">
            {analysisSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-chestnut text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-charcoal">{step.title}</h4>
                  <p className="text-sm text-charcoal/60 mb-2">{step.description}</p>
                  <ul className="text-xs text-charcoal/50 space-y-1">
                    {step.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-chestnut rounded-full"></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Configuration Summary */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <MessageCircle size={20} />
            Data Configuration
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Text Column:</span>
                <span className="font-medium">{config?.textColumn || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Label Column:</span>
                <span className="font-medium">{config?.labelColumn || 'None (unsupervised)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Max Features:</span>
                <span className="font-medium">{config?.analysis?.maxFeatures?.toLocaleString() || '10,000'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Dataset Size:</span>
                <span className="font-medium">
                  {validationResults?.summary?.shape?.[0]?.toLocaleString() || 'N/A'} texts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">N-gram Range:</span>
                <span className="font-medium">
                  ({config?.analysis?.ngramRange?.[0] || 1}, {config?.analysis?.ngramRange?.[1] || 2})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Est. Time:</span>
                <span className="font-medium">{Math.ceil((config?.tasks?.length || 1) * 2)}-{(config?.tasks?.length || 1) * 5}min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preprocessing Summary */}
        {config?.preprocessing && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Type size={20} />
              Preprocessing Configuration
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(config.preprocessing).map(([key, enabled]) => {
                const labels = {
                  lowercase: 'Lowercase',
                  removePunctuation: 'Remove Punctuation',
                  removeStopwords: 'Remove Stopwords',
                  lemmatization: 'Lemmatization',
                  stemming: 'Stemming',
                  removeHtml: 'Remove HTML',
                  removeUrls: 'Remove URLs',
                  removeNumbers: 'Remove Numbers'
                };
                
                return (
                  <div key={key} className={`p-3 rounded-lg text-center ${
                    enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className={`text-sm font-medium ${
                      enabled ? 'text-green-800' : 'text-gray-500'
                    }`}>
                      {labels[key]}
                    </div>
                    <div className={`text-xs ${
                      enabled ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analysis Action */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mb-6">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Ready to Start NLP Analysis
            </h3>
            <p className="text-charcoal/70">
              Click "Start Analysis" to begin processing your text data. 
              All selected tasks will be executed with comprehensive preprocessing.
            </p>
          </div>

          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="space-y-2">
                <p className="text-charcoal/60">
                  Analysis in progress... This may take several minutes.
                </p>
                <div className="text-sm text-charcoal/50">
                  Processing: Text preprocessing → Feature extraction → Task execution
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-charcoal/50">
            <p>Analysis will provide insights, visualizations, and actionable recommendations</p>
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

export default NLPAnalysisStep;