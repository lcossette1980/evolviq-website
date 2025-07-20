import React from 'react';
import { Download, Home, RotateCcw, FileText, BarChart3, Share, MessageCircle } from 'lucide-react';

const ExportStep = ({ 
  analysisResults, 
  validationResults, 
  onReturnToDashboard, 
  onStartNew 
}) => {
  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      analysis_type: 'Natural Language Processing',
      dataset: validationResults?.summary,
      nlp_results: analysisResults,
      text_statistics: analysisResults?.text_stats,
      sentiment_analysis: analysisResults?.sentiment_analysis,
      keyword_extraction: analysisResults?.keyword_extraction,
      topic_modeling: analysisResults?.topic_modeling,
      text_classification: analysisResults?.text_classification
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nlp_analysis_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      icon: FileText,
      title: 'Download Analysis Report',
      description: 'Comprehensive JSON report with all NLP results and insights',
      action: handleDownloadReport,
      primary: true
    },
    {
      icon: BarChart3,
      title: 'Export Visualizations',
      description: 'Download sentiment charts and keyword visualizations',
      action: () => alert('Visualization export coming soon!')
    },
    {
      icon: MessageCircle,
      title: 'Text Insights Export',
      description: 'Download extracted keywords, topics, and sentiment data',
      action: () => alert('Text insights export coming soon!')
    },
    {
      icon: Share,
      title: 'Share Results',
      description: 'Generate shareable link for your NLP analysis',
      action: () => alert('Sharing feature coming soon!')
    }
  ];

  const textStats = analysisResults?.text_stats || {};
  const avgSentiment = analysisResults?.sentiment_analysis?.reduce((sum, r) => sum + r.positive, 0) / 
                      (analysisResults?.sentiment_analysis?.length || 1);
  const topKeywords = analysisResults?.keyword_extraction?.slice(0, 3) || [];
  const bestClassifier = analysisResults?.text_classification?.[0];

  const nextSteps = [
    {
      title: 'Sentiment Monitoring',
      description: 'Set up automated sentiment tracking for ongoing analysis',
      link: '/guides/sentiment-monitoring',
      icon: MessageCircle
    },
    {
      title: 'Text Classification',
      description: 'Build classification models based on your findings',
      link: '/tools/classification-explorer',
      icon: BarChart3
    },
    {
      title: 'Advanced Analytics',
      description: 'Explore deeper insights with EDA and clustering',
      link: '/tools/eda-explorer',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            NLP Analysis Complete!
          </h2>
          <p className="text-green-700">
            Your natural language processing analysis has been completed successfully. 
            Review your insights and discover actionable patterns in your text data.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Analysis Summary */}
        <div className="bg-bone rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Analysis Summary</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {textStats.total_texts?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Texts Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {textStats.unique_words?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Unique Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {avgSentiment ? `${Math.round(avgSentiment)}%` : 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Positive Sentiment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {analysisResults?.topic_modeling?.length || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Topics Discovered</div>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Key Findings</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Content Quality</h4>
              <p className="text-green-700 text-sm">
                Analyzed {textStats.total_texts?.toLocaleString()} texts with an average of {textStats.avg_words_per_text?.toFixed(1)} words each, 
                indicating substantial content for meaningful insights.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Sentiment Profile</h4>
              <p className="text-blue-700 text-sm">
                Overall sentiment is {avgSentiment > 50 ? 'predominantly positive' : avgSentiment > 30 ? 'mixed with positive lean' : 'varied'}, 
                with {Math.round(avgSentiment)}% positive sentiment detected across analysis methods.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Key Themes</h4>
              <p className="text-yellow-700 text-sm">
                Top keywords include {topKeywords.map(k => k.word).join(', ')}, 
                revealing important themes and focus areas in your text data.
              </p>
            </div>

            {bestClassifier && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Classification Performance</h4>
                <p className="text-purple-700 text-sm">
                  {bestClassifier.model} achieved {(bestClassifier.accuracy * 100).toFixed(1)}% accuracy, 
                  indicating reliable text classification capabilities.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Keywords Highlight */}
        {topKeywords.length > 0 && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Top Keywords by Importance</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {topKeywords.map((keyword, idx) => (
                <div key={idx} className="text-center p-4 bg-bone rounded-lg">
                  <div className="text-xl font-bold text-chestnut mb-1">
                    {keyword.word}
                  </div>
                  <div className="text-sm text-charcoal/60">
                    TF-IDF: {keyword.tfidf.toFixed(3)}
                  </div>
                  <div className="text-xs text-charcoal/50">
                    Frequency: {keyword.frequency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Options */}
        <div>
          <h3 className="font-semibold text-charcoal mb-4">Export Your Results</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <button
                  key={idx}
                  onClick={option.action}
                  className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                    option.primary 
                      ? 'bg-chestnut text-white border-chestnut hover:bg-chestnut/90' 
                      : 'bg-white border-gray-200 hover:border-chestnut'
                  }`}
                >
                  <Icon size={24} className={`mb-3 ${option.primary ? 'text-white' : 'text-chestnut'}`} />
                  <div className={`font-medium mb-1 ${option.primary ? 'text-white' : 'text-charcoal'}`}>
                    {option.title}
                  </div>
                  <div className={`text-sm ${option.primary ? 'text-white/80' : 'text-charcoal/60'}`}>
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="font-semibold text-charcoal mb-4">Recommended Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {nextSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <a
                  key={idx}
                  href={step.link}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-chestnut hover:shadow-md transition-all"
                >
                  <Icon size={24} className="text-chestnut mb-3" />
                  <div className="font-medium text-charcoal mb-1">{step.title}</div>
                  <div className="text-sm text-charcoal/60">{step.description}</div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Business Applications */}
        <div className="bg-bone border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Business Applications</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-charcoal mb-3">Customer Intelligence</h4>
              <ul className="space-y-2 text-charcoal/70">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Monitor real-time customer sentiment
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Identify emerging themes and topics
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Track brand perception changes
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Automate content categorization
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-charcoal mb-3">Strategic Actions</h4>
              <ul className="space-y-2 text-charcoal/70">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Develop targeted messaging strategies
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Improve customer service responses
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Guide product development priorities
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                  Enhance content recommendation systems
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onReturnToDashboard}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-all"
            >
              <Home size={20} />
              Return to Dashboard
            </button>
            
            <button
              onClick={onStartNew}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-bone text-charcoal border border-khaki rounded-lg hover:bg-bone/80 transition-all"
            >
              <RotateCcw size={20} />
              Start New NLP Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportStep;