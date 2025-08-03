import React from 'react';
import { Play } from 'lucide-react';
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
      title="Start Analysis"
      description="Run NLP analysis with selected tasks"
      currentStep={4}
      totalSteps={6}
      onNext={onAnalyze}
      canGoNext={!isLoading}
      nextLabel={isLoading ? "Analyzing..." : "Start Analysis"}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Selected Tasks */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Selected Tasks ({config?.tasks?.length || 0})
          </h3>
          
          <div className="grid md:grid-cols-4 gap-3">
            {config?.tasks?.map(taskId => {
              const task = taskDetails[taskId];
              if (!task) return null;
              
              return (
                <div key={taskId} className="p-3 bg-bone rounded-lg border text-center">
                  <div className="font-medium text-charcoal text-sm">
                    {task.name}
                  </div>
                </div>
              );
            })}
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
                  {config?.textColumn || 'N/A'}
                </div>
                <div className="text-charcoal/60">Text Column</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config?.tasks?.length || 0}
                </div>
                <div className="text-charcoal/60">Tasks</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config?.labelColumn ? 'Yes' : 'No'}
                </div>
                <div className="text-charcoal/60">Labels</div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Action */}
        {isLoading ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-charcoal/60">Running NLP analysis...</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Analyze</h3>
            <p className="text-charcoal/70">Process text with {config?.tasks?.length || 0} NLP tasks</p>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default NLPAnalysisStep;