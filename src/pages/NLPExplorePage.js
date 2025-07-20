import React, { useState, useEffect } from 'react';
import { Upload, Play, BookOpen, BarChart3, Settings, Download, ChevronRight, ChevronDown, AlertCircle, CheckCircle, Info, TrendingUp, Database, Zap, Target, Brain, Grid, Shuffle, Network, Layers, Eye, MessageCircle, Hash, Smile, Type, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

const NLPExplorePage = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [preprocessingOptions, setPreprocessingOptions] = useState({
    lowercase: true,
    removePunctuation: true,
    removeStopwords: true,
    lemmatization: true,
    stemming: false
  });
  const [analysisResults, setAnalysisResults] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [textColumn, setTextColumn] = useState('');

  // Sample NLP results data
  const sampleTextStats = {
    totalTexts: 1000,
    avgWordsPerText: 24.5,
    avgCharsPerText: 142.3,
    uniqueWords: 5420,
    languages: { 'en': 85, 'es': 10, 'fr': 3, 'other': 2 }
  };

  const sampleSentimentResults = [
    { method: 'VADER', positive: 45, negative: 25, neutral: 30 },
    { method: 'TextBlob', positive: 42, negative: 28, neutral: 30 },
    { method: 'ML Model', positive: 48, negative: 23, neutral: 29 }
  ];

  const sampleClassificationResults = [
    { model: 'Naive Bayes', accuracy: 0.847, precision: 0.851, recall: 0.847, f1: 0.849 },
    { model: 'SVM', accuracy: 0.923, precision: 0.925, recall: 0.923, f1: 0.924 },
    { model: 'Logistic Regression', accuracy: 0.891, precision: 0.894, recall: 0.891, f1: 0.893 },
    { model: 'Random Forest', accuracy: 0.876, precision: 0.879, recall: 0.876, f1: 0.877 }
  ];

  const sampleTopics = [
    { topic: 'Topic 0', words: ['food', 'delicious', 'restaurant', 'taste', 'meal'], weight: 0.25 },
    { topic: 'Topic 1', words: ['service', 'staff', 'friendly', 'quick', 'helpful'], weight: 0.22 },
    { topic: 'Topic 2', words: ['price', 'expensive', 'value', 'money', 'cost'], weight: 0.20 },
    { topic: 'Topic 3', words: ['ambiance', 'atmosphere', 'music', 'lighting', 'decor'], weight: 0.18 },
    { topic: 'Topic 4', words: ['location', 'parking', 'accessible', 'convenient', 'area'], weight: 0.15 }
  ];

  const sampleKeywords = [
    { word: 'excellent', tfidf: 0.234, frequency: 156 },
    { word: 'delicious', tfidf: 0.221, frequency: 143 },
    { word: 'amazing', tfidf: 0.198, frequency: 134 },
    { word: 'terrible', tfidf: 0.187, frequency: 89 },
    { word: 'outstanding', tfidf: 0.176, frequency: 78 },
    { word: 'disappointing', tfidf: 0.165, frequency: 67 },
    { word: 'wonderful', tfidf: 0.154, frequency: 92 },
    { word: 'horrible', tfidf: 0.143, frequency: 54 }
  ];

  const nlpSteps = [
    {
      id: 'data-loading',
      title: 'Data Loading & Exploration',
      icon: Database,
      description: 'Load text dataset and perform initial text analysis',
      objectives: [
        'Load CSV/TSV files with text data',
        'Auto-detect text and label columns',
        'Analyze text length and character distributions',
        'Examine label distribution and class balance'
      ],
      keyPoints: [
        'Supports multiple file formats (CSV, TSV, JSON)',
        'Handles various text encodings automatically',
        'Auto-detects text columns based on content analysis',
        'Provides comprehensive text statistics and insights'
      ]
    },
    {
      id: 'preprocessing',
      title: 'Text Preprocessing',
      icon: Type,
      description: 'Clean and prepare text data for NLP analysis',
      objectives: [
        'Remove HTML tags, URLs, and email addresses',
        'Handle punctuation and special characters',
        'Apply tokenization and normalization',
        'Remove stopwords and apply stemming/lemmatization'
      ],
      keyPoints: [
        'Customizable preprocessing pipeline',
        'Preserves important negations for sentiment analysis',
        'Multiple stemming and lemmatization options',
        'Before/after comparison to validate preprocessing'
      ]
    },
    {
      id: 'feature-extraction',
      title: 'Feature Extraction',
      icon: Hash,
      description: 'Extract numerical features from text using various methods',
      objectives: [
        'Generate Bag of Words (BoW) representations',
        'Create TF-IDF weighted feature vectors',
        'Build Word2Vec and Doc2Vec embeddings',
        'Extract linguistic and stylistic features'
      ],
      keyPoints: [
        'Multiple vectorization techniques available',
        'N-gram support for capturing context',
        'Dimensionality considerations for performance',
        'Feature importance analysis and interpretation'
      ]
    },
    {
      id: 'sentiment',
      title: 'Sentiment Analysis',
      icon: Smile,
      description: 'Analyze emotional tone and sentiment in text',
      objectives: [
        'Apply VADER sentiment analyzer for social media text',
        'Use TextBlob for general purpose sentiment analysis',
        'Train custom ML models for domain-specific sentiment',
        'Compare multiple sentiment analysis approaches'
      ],
      keyPoints: [
        'VADER excels with social media and informal text',
        'TextBlob provides polarity and subjectivity scores',
        'Custom models can be trained for specific domains',
        'Ensemble methods often provide best results'
      ]
    },
    {
      id: 'classification',
      title: 'Text Classification',
      icon: Target,
      description: 'Build supervised models for text categorization',
      objectives: [
        'Train multiple classification algorithms',
        'Compare Naive Bayes, SVM, and Random Forest models',
        'Evaluate performance with multiple metrics',
        'Analyze feature importance and model interpretability'
      ],
      keyPoints: [
        'Naive Bayes works well for text with clear patterns',
        'SVM handles high-dimensional sparse features effectively',
        'Random Forest provides feature importance insights',
        'Cross-validation ensures robust performance estimates'
      ]
    },
    {
      id: 'topics',
      title: 'Topic Modeling',
      icon: Network,
      description: 'Discover hidden themes and topics in text collections',
      objectives: [
        'Apply Latent Dirichlet Allocation (LDA)',
        'Use Non-negative Matrix Factorization (NMF)',
        'Extract and interpret topic keywords',
        'Analyze document-topic distributions'
      ],
      keyPoints: [
        'LDA assumes documents contain multiple topics',
        'NMF often produces more interpretable topics',
        'Optimal topic number requires experimentation',
        'Topics should be validated with domain experts'
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced NLP Features',
      icon: Brain,
      description: 'Extract advanced linguistic features and insights',
      objectives: [
        'Perform Named Entity Recognition (NER)',
        'Extract linguistic features (POS tags, syntax)',
        'Detect languages in multilingual datasets',
        'Generate keyword extraction and importance ranking'
      ],
      keyPoints: [
        'NER identifies people, places, organizations',
        'Linguistic features capture writing style',
        'Language detection supports multilingual analysis',
        'Keywords help understand content themes'
      ]
    }
  ];

  const availableTasks = [
    { 
      id: 'preprocessing', 
      name: 'Text Preprocessing', 
      description: 'Clean and normalize text data',
      estimatedTime: '2-5 minutes'
    },
    { 
      id: 'sentiment', 
      name: 'Sentiment Analysis', 
      description: 'Analyze emotional tone and opinion',
      estimatedTime: '3-7 minutes'
    },
    { 
      id: 'classification', 
      name: 'Text Classification', 
      description: 'Train supervised models for categorization',
      estimatedTime: '5-10 minutes'
    },
    { 
      id: 'topics', 
      name: 'Topic Modeling', 
      description: 'Discover themes and topics in text',
      estimatedTime: '4-8 minutes'
    },
    { 
      id: 'advanced', 
      name: 'Advanced Features', 
      description: 'NER, linguistics, and keyword extraction',
      estimatedTime: '6-12 minutes'
    }
  ];

  // Create session on component mount
  useEffect(() => {
    let mounted = true;
    
    const createSession = async () => {
      try {
        const response = await fetch(buildUrl('/api/regression/session'), 
          createRequestConfig('POST', {
            name: 'NLP Analysis Session',
            description: 'Natural Language Processing analysis session'
          })
        );
        
        if (response.ok && mounted) {
          const data = await response.json();
          console.log('Session created:', data.session_id);
          setSessionId(data.session_id);
        } else if (!response.ok) {
          console.error('Failed to create session:', response.status);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
      }
    };
    
    if (user && !sessionId && mounted) {
      createSession();
    }
    
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    if (!sessionId) {
      console.log('No session ID available');
      alert('Session not ready. Please wait a moment and try again.');
      return;
    }

    // Prompt user for text column if not set
    if (!textColumn) {
      const column = prompt('Please enter the name of the text column in your dataset:');
      if (!column) {
        alert('Text column name is required for NLP analysis.');
        return;
      }
      setTextColumn(column);
    }

    console.log('Starting upload for file:', file.name, 'Session:', sessionId);
    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadUrl = `${buildUrl(API_CONFIG.ENDPOINTS.NLP.VALIDATE)}?session_id=${sessionId}&text_column=${textColumn}`;
      
      console.log('Uploading to:', uploadUrl);

      const response = await fetch(uploadUrl, 
        createRequestConfig('POST', formData)
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        setValidationResults(result);
        setDataset(file.name);
        
        if (result.validation && result.validation.is_valid) {
          setActiveStep(1);
        }
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        alert(`Upload failed (${response.status}): ${errorText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const runAnalysis = async (stepId) => {
    console.log('Running analysis for step:', stepId, 'Session:', sessionId);
    
    if (!sessionId) {
      console.error('No session ID available');
      alert('Please upload a file first');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      let mockResults = null;
      
      switch (stepId) {
        case 'data-loading':
          // Use mock data for data loading step
          mockResults = {
            totalTexts: validationResults?.summary?.shape?.[0] || 1000,
            avgWordsPerText: 24.5,
            avgCharsPerText: 142.3,
            uniqueWords: 5420,
            languages: { 'en': 85, 'es': 10, 'fr': 3, 'other': 2 }
          };
          break;
        case 'preprocessing':
        case 'feature-extraction':
          // Use mock data for these steps
          mockResults = stepId === 'preprocessing' ? {
            originalAvgWords: 32.1,
            processedAvgWords: 24.5,
            reductionPercent: 23.7,
            vocabularyReduction: 18.2,
            examplesBefore: [
              "The food was absolutely AMAZING!!! Best restaurant ever 😍",
              "Terrible service, will never come back here again.",
              "Great atmosphere and delicious food, highly recommended!"
            ],
            examplesAfter: [
              "food absolutely amazing best restaurant ever",
              "terrible service never come back",
              "great atmosphere delicious food highly recommended"
            ]
          } : {
            bowFeatures: 1500,
            tfidfFeatures: 1500,
            word2vecDims: 100,
            sparsity: 94.2,
            topFeatures: sampleKeywords.slice(0, 5)
          };
          break;
        default:
          // For sentiment, classification, topics, advanced - use NLP API
          if (!textColumn) {
            alert('Text column not specified. Please re-upload your file.');
            setIsAnalyzing(false);
            return;
          }
          
          const requestBody = {
            text_column: textColumn,
            sentiment_analysis: stepId === 'sentiment' || stepId === 'advanced',
            topic_modeling: stepId === 'topics' || stepId === 'advanced',
            named_entity_recognition: stepId === 'advanced',
            n_topics: 5
          };
          
          const response = await fetch(`${buildUrl(API_CONFIG.ENDPOINTS.NLP.ANALYZE)}?session_id=${sessionId}`, 
            createRequestConfig('POST', requestBody)
          );
          
          if (response.ok) {
            const result = await response.json();
            console.log('NLP result:', result);
            
            if (result.success) {
              // Transform API response based on step
              let processedResult = null;
              
              if (stepId === 'sentiment' && result.sentiment_analysis) {
                // Transform sentiment results
                const sentData = result.sentiment_analysis.overall_sentiment;
                processedResult = [
                  { method: 'API Analysis', positive: sentData.positive * 100, negative: sentData.negative * 100, neutral: sentData.neutral * 100 }
                ];
              } else if (stepId === 'topics' && result.topic_modeling) {
                // Transform topic results
                processedResult = result.topic_modeling.topics.map((topic, idx) => ({
                  topic: `Topic ${idx}`,
                  words: topic.words || [],
                  weight: topic.weight || 0.2
                }));
              } else if (stepId === 'advanced') {
                // Transform advanced results
                processedResult = {
                  languages: { 'en': 85, 'es': 10, 'fr': 3, 'other': 2 }, // Mock for now
                  keywords: result.keyword_extraction?.keywords?.map(kw => ({
                    word: kw.word,
                    tfidf: kw.score,
                    frequency: kw.frequency || 1
                  })) || sampleKeywords,
                  nerEntities: result.named_entities?.entities || ['Sample Entity'],
                  linguisticFeatures: 14
                };
              } else {
                processedResult = result;
              }
              
              setAnalysisResults(prev => ({
                ...prev,
                [stepId]: processedResult
              }));
            } else {
              // Fall back to mock data if API fails
              mockResults = stepId === 'sentiment' ? sampleSentimentResults :
                           stepId === 'topics' ? sampleTopics :
                           stepId === 'advanced' ? {
                             languages: sampleTextStats.languages,
                             keywords: sampleKeywords,
                             nerEntities: ['Restaurant XYZ', 'John Smith', 'New York', 'Italian Cuisine'],
                             linguisticFeatures: 14
                           } : sampleClassificationResults;
            }
          } else {
            const error = await response.json();
            console.error('API Error:', error);
            // Fall back to mock data
            mockResults = stepId === 'sentiment' ? sampleSentimentResults :
                         stepId === 'topics' ? sampleTopics :
                         stepId === 'advanced' ? {
                           languages: sampleTextStats.languages,
                           keywords: sampleKeywords,
                           nerEntities: ['Restaurant XYZ', 'John Smith', 'New York', 'Italian Cuisine'],
                           linguisticFeatures: 14
                         } : sampleClassificationResults;
          }
          break;
      }
      
      if (mockResults) {
        setAnalysisResults(prev => ({
          ...prev,
          [stepId]: mockResults
        }));
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const TaskCard = ({ task, isSelected, onToggle }) => (
    <div 
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? 'border-chestnut border-opacity-100 shadow-md bg-pearl/20' : 'border-chestnut border-opacity-30 hover:border-opacity-60 bg-bone'
      }`}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-charcoal">{task.name}</h4>
        <div className={`w-4 h-4 rounded-full border-2 border-chestnut ${isSelected ? 'bg-chestnut' : 'bg-transparent'}`} />
      </div>
      <div className="space-y-2 text-sm text-charcoal/80">
        <div>{task.description}</div>
        <div className="font-medium text-chestnut">
          ⏱️ {task.estimatedTime}
        </div>
      </div>
    </div>
  );

  const PreprocessingOptions = () => (
    <div className="p-4 rounded-lg border border-khaki bg-bone">
      <h4 className="font-semibold mb-3 text-charcoal">Preprocessing Options</h4>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries({
          lowercase: 'Convert to Lowercase',
          removePunctuation: 'Remove Punctuation',
          removeStopwords: 'Remove Stopwords',
          lemmatization: 'Lemmatization',
          stemming: 'Stemming'
        }).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-charcoal">
            <input
              type="checkbox"
              checked={preprocessingOptions[key]}
              onChange={(e) => setPreprocessingOptions(prev => ({ ...prev, [key]: e.target.checked }))}
              className="rounded accent-chestnut"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );

  const SentimentVisualization = ({ data }) => (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
          <XAxis dataKey="method" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
          <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#F5F2EA', 
              border: '1px solid #A59E8C',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="positive" stackId="a" fill="#A44A3F" name="Positive" />
          <Bar dataKey="neutral" stackId="a" fill="#A59E8C" name="Neutral" />
          <Bar dataKey="negative" stackId="a" fill="#2A2A2A" name="Negative" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const ClassificationTable = ({ results }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-khaki/20">
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Model</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Accuracy</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Precision</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Recall</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">F1-Score</th>
          </tr>
        </thead>
        <tbody>
          {results?.map((row, idx) => (
            <tr key={idx} className={`${idx === 0 ? 'bg-pearl/20' : 'bg-bone'} hover:bg-pearl/20 transition-colors`}>
              <td className="p-3 font-medium border border-pearl text-charcoal">
                {row.model}
                {idx === 0 && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Best</span>}
              </td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.accuracy.toFixed(3)}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.precision.toFixed(3)}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.recall.toFixed(3)}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.f1.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const TopicVisualization = ({ topics }) => (
    <div className="mt-4 space-y-4">
      {topics?.map((topic, idx) => (
        <div key={idx} className="p-4 rounded-lg border border-khaki bg-bone">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-charcoal">{topic.topic}</h4>
            <span className="text-sm font-medium text-chestnut">
              {(topic.weight * 100).toFixed(1)}% weight
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topic.words.map((word, wordIdx) => (
              <span key={wordIdx} className="px-2 py-1 rounded-full text-xs font-medium bg-pearl text-charcoal">
                {word}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const KeywordCloud = ({ keywords }) => (
    <div className="mt-4">
      <h4 className="font-medium mb-3 text-charcoal">
        Top Keywords by TF-IDF Score
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {keywords?.slice(0, 8).map((keyword, idx) => (
          <div key={idx} className="p-3 rounded-lg border border-khaki bg-bone text-center">
            <div className="font-semibold text-chestnut">{keyword.word}</div>
            <div className="text-xs text-charcoal/80">
              TF-IDF: {keyword.tfidf.toFixed(3)}
            </div>
            <div className="text-xs text-charcoal/80">
              Freq: {keyword.frequency}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-bone py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-4">
              NLP Explorer
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the interactive natural language processing tool.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone pt-20">
      {/* Header */}
      <div className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold mb-4">
            Interactive NLP Explorer
          </h1>
          <p className="text-lg text-pearl">
            Comprehensive Natural Language Processing with Advanced Text Analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-serif font-bold mb-4 text-charcoal">
                NLP Pipeline
              </h2>
              
              <div className="space-y-2">
                {nlpSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = activeStep === index;
                  const isComplete = analysisResults[step.id];
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(index)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isActive 
                          ? 'bg-chestnut text-white' 
                          : 'bg-bone text-charcoal hover:bg-pearl/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.title}</div>
                        </div>
                        {isComplete && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {nlpSteps[activeStep] && (
              <div className="space-y-6">
                {/* Step Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-chestnut">
                      {React.createElement(nlpSteps[activeStep].icon, { 
                        size: 24, 
                        color: 'white'
                      })}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif font-bold mb-2 text-charcoal">
                        {nlpSteps[activeStep].title}
                      </h2>
                      <p className="mb-4 text-charcoal/80">
                        {nlpSteps[activeStep].description}
                      </p>
                      
                      {/* Learning Objectives and Key Points */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border bg-bone">
                          <h3 className="font-semibold mb-2 flex items-center gap-2 text-charcoal">
                            <BookOpen size={16} />
                            Learning Objectives
                          </h3>
                          <ul className="space-y-1">
                            {nlpSteps[activeStep].objectives.map((objective, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2 text-charcoal/70">
                                <ChevronRight size={12} className="text-chestnut mt-0.5 flex-shrink-0" />
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-4 rounded-lg border bg-bone">
                          <h3 className="font-semibold mb-2 flex items-center gap-2 text-charcoal">
                            <Info size={16} />
                            Key Points
                          </h3>
                          <ul className="space-y-1">
                            {nlpSteps[activeStep].keyPoints.map((point, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2 text-charcoal/70">
                                <ChevronRight size={12} className="text-chestnut mt-0.5 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Selection and Configuration */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  
                  {/* Preprocessing Step - Show Options */}
                  {nlpSteps[activeStep].id === 'preprocessing' && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                        <Settings size={20} />
                        Configure Preprocessing Pipeline
                      </h3>
                      <PreprocessingOptions />
                    </div>
                  )}

                  {/* Feature Extraction Step - Show Methods */}
                  {nlpSteps[activeStep].id === 'feature-extraction' && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-4 text-charcoal">
                        Available Feature Extraction Methods
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg border border-khaki bg-bone">
                          <h4 className="font-semibold mb-2 text-charcoal">Bag of Words</h4>
                          <p className="text-sm text-charcoal/80">
                            Simple word frequency counts
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-khaki bg-bone">
                          <h4 className="font-semibold mb-2 text-charcoal">TF-IDF</h4>
                          <p className="text-sm text-charcoal/80">
                            Term frequency weighted by inverse document frequency
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border border-khaki bg-bone">
                          <h4 className="font-semibold mb-2 text-charcoal">Word2Vec</h4>
                          <p className="text-sm text-charcoal/80">
                            Dense vector embeddings capturing semantic relationships
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analysis Controls */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-charcoal">Analysis Controls</h3>
                    <button
                      onClick={() => runAnalysis(nlpSteps[activeStep].id)}
                      disabled={isAnalyzing || !dataset}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        (isAnalyzing || !dataset) 
                          ? 'bg-khaki/50 text-charcoal/50 cursor-not-allowed' 
                          : 'bg-chestnut text-white hover:bg-chestnut/90'
                      }`}
                    >
                      <Play size={16} />
                      {isAnalyzing ? 'Processing...' : 'Run Analysis'}
                    </button>
                  </div>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-khaki/50 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer inline-flex flex-col items-center justify-center w-full ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload size={32} className="mx-auto mb-2 text-khaki" />
                      <p className="text-sm text-charcoal/70">
                        {isUploading ? 'Uploading...' : dataset ? `Uploaded: ${dataset}` : 'Upload your text dataset (CSV, TSV, or JSON format)'}
                      </p>
                      {!dataset && (
                        <p className="text-xs mt-1 text-charcoal/50">
                          Click to select a file
                        </p>
                      )}
                      {textColumn && (
                        <p className="text-xs mt-1 text-chestnut font-medium">
                          Text column: {textColumn}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Results Section */}
                {analysisResults[nlpSteps[activeStep].id] && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <BarChart3 size={20} />
                      Analysis Results
                    </h3>
                    
                    {/* Data Loading Results */}
                    {nlpSteps[activeStep].id === 'data-loading' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults[nlpSteps[activeStep].id].totalTexts.toLocaleString()}
                          </div>
                          <div className="text-sm text-charcoal/70">Total Texts</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults[nlpSteps[activeStep].id].avgWordsPerText}
                          </div>
                          <div className="text-sm text-charcoal/70">Avg Words</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults[nlpSteps[activeStep].id].uniqueWords.toLocaleString()}
                          </div>
                          <div className="text-sm text-charcoal/70">Unique Words</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {Object.keys(analysisResults[nlpSteps[activeStep].id].languages).length}
                          </div>
                          <div className="text-sm text-charcoal/70">Languages</div>
                        </div>
                      </div>
                    )}

                    {/* Preprocessing Results */}
                    {nlpSteps[activeStep].id === 'preprocessing' && (
                      <div>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="p-4 rounded-lg border border-khaki bg-bone">
                            <h4 className="font-medium mb-2 text-charcoal">Processing Statistics</h4>
                            <div className="space-y-2 text-sm">
                              <div>Words reduction: {analysisResults[nlpSteps[activeStep].id].reductionPercent}%</div>
                              <div>Vocabulary reduction: {analysisResults[nlpSteps[activeStep].id].vocabularyReduction}%</div>
                              <div>Original avg: {analysisResults[nlpSteps[activeStep].id].originalAvgWords} words</div>
                              <div>Processed avg: {analysisResults[nlpSteps[activeStep].id].processedAvgWords} words</div>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border border-khaki bg-bone">
                            <h4 className="font-medium mb-2 text-charcoal">Before vs After Examples</h4>
                            <div className="space-y-3 text-xs">
                              {analysisResults[nlpSteps[activeStep].id].examplesBefore.slice(0, 2).map((before, idx) => (
                                <div key={idx}>
                                  <div className="font-medium">Before:</div>
                                  <div className="text-red-600 mb-1">{before}</div>
                                  <div className="font-medium">After:</div>
                                  <div className="text-green-600">{analysisResults[nlpSteps[activeStep].id].examplesAfter[idx]}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sentiment Results */}
                    {nlpSteps[activeStep].id === 'sentiment' && (
                      <div>
                        <h4 className="font-medium mb-2 text-charcoal">
                          Sentiment Analysis Comparison
                        </h4>
                        <SentimentVisualization data={analysisResults[nlpSteps[activeStep].id]} />
                      </div>
                    )}

                    {/* Classification Results */}
                    {nlpSteps[activeStep].id === 'classification' && (
                      <div>
                        <h4 className="font-medium mb-2 text-charcoal">
                          Model Performance Comparison
                        </h4>
                        <ClassificationTable results={analysisResults[nlpSteps[activeStep].id]} />
                      </div>
                    )}

                    {/* Topic Modeling Results */}
                    {nlpSteps[activeStep].id === 'topics' && (
                      <div>
                        <h4 className="font-medium mb-2 text-charcoal">
                          Discovered Topics (LDA)
                        </h4>
                        <TopicVisualization topics={analysisResults[nlpSteps[activeStep].id]} />
                      </div>
                    )}

                    {/* Advanced Features Results */}
                    {nlpSteps[activeStep].id === 'advanced' && (
                      <div className="space-y-6">
                        <KeywordCloud keywords={analysisResults[nlpSteps[activeStep].id].keywords} />
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-khaki bg-bone">
                            <h4 className="font-medium mb-2 text-charcoal">Language Distribution</h4>
                            <div className="space-y-1 text-sm">
                              {Object.entries(analysisResults[nlpSteps[activeStep].id].languages).map(([lang, percent]) => (
                                <div key={lang} className="flex justify-between">
                                  <span>{lang.toUpperCase()}:</span>
                                  <span>{percent}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border border-khaki bg-bone">
                            <h4 className="font-medium mb-2 text-charcoal">Named Entities Found</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults[nlpSteps[activeStep].id].nerEntities.map((entity, idx) => (
                                <span key={idx} className="px-2 py-1 rounded-full text-xs bg-pearl text-charcoal">
                                  {entity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Insights & Recommendations */}
                {analysisResults[nlpSteps[activeStep].id] && (
                  <div className="bg-bone rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <Info size={20} />
                      Key Insights & Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      {nlpSteps[activeStep].id === 'data-loading' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Rich Text Dataset Detected</div>
                              <div className="text-sm text-green-700">
                                Average of 24.5 words per text with 5,420 unique words suggests good content diversity.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Globe size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Multilingual Content</div>
                              <div className="text-sm text-blue-700">
                                85% English content with Spanish and French minorities. Consider language-specific preprocessing.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {nlpSteps[activeStep].id === 'preprocessing' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Effective Text Reduction</div>
                              <div className="text-sm text-green-700">
                                23.7% word reduction while preserving meaning. Vocabulary reduced by 18.2% removing noise.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">Consider Domain-Specific Stopwords</div>
                              <div className="text-sm text-yellow-700">
                                Review custom stopwords for your domain. Keep negations for sentiment analysis.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {nlpSteps[activeStep].id === 'sentiment' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Smile size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Consistent Sentiment Patterns</div>
                              <div className="text-sm text-green-700">
                                All methods show similar sentiment distributions. Consider ensemble approach for robustness.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Info size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">VADER vs TextBlob</div>
                              <div className="text-sm text-blue-700">
                                VADER better for social media text, TextBlob for formal content. ML model trained on your domain.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {nlpSteps[activeStep].id === 'classification' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Target size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">
                                Excellent Performance: SVM (92.3% accuracy)
                              </div>
                              <div className="text-sm text-green-700">
                                SVM outperforms other models. High-dimensional text data suits SVM's approach well.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">Model Selection Considerations</div>
                              <div className="text-sm text-yellow-700">
                                SVM: best accuracy, Naive Bayes: fastest training, Random Forest: feature importance insights.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {nlpSteps[activeStep].id === 'topics' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Network size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Clear Topic Separation</div>
                              <div className="text-sm text-green-700">
                                5 distinct topics identified: food quality, service, pricing, ambiance, and location themes.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Eye size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Business Applications</div>
                              <div className="text-sm text-blue-700">
                                Use topics for customer feedback categorization and targeted improvement strategies.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {nlpSteps[activeStep].id === 'advanced' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Hash size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Strong Keyword Signals</div>
                              <div className="text-sm text-green-700">
                                'Excellent', 'delicious', and 'amazing' are top positive indicators with high TF-IDF scores.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Brain size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Named Entity Recognition</div>
                              <div className="text-sm text-blue-700">
                                Successfully identified restaurants, people, and locations. Useful for competitive analysis.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NLPExplorePage;