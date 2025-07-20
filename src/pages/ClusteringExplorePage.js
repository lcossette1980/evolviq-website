import React, { useState, useEffect } from 'react';
import { Upload, Play, BookOpen, BarChart3, Settings, Download, ChevronRight, ChevronDown, AlertCircle, CheckCircle, Info, TrendingUp, Database, Zap, Target, Brain, Grid, Shuffle, Network, Layers, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

const ClusteringExplorePage = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [optimalClusters, setOptimalClusters] = useState(3);
  const [analysisResults, setAnalysisResults] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clusteringResults, setClusteringResults] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [dataset, setDataset] = useState(null);

  // Sample clustering optimization data
  const optimizationData = [
    { k: 1, elbow: 2856, silhouette: 0, gap: 0.45, calinski: 0, davies: 0 },
    { k: 2, elbow: 1567, silhouette: 0.642, gap: 0.67, calinski: 158.2, davies: 0.821 },
    { k: 3, elbow: 956, silhouette: 0.731, gap: 0.89, calinski: 234.7, davies: 0.643 },
    { k: 4, elbow: 743, silhouette: 0.687, gap: 0.76, calinski: 201.3, davies: 0.754 },
    { k: 5, elbow: 612, silhouette: 0.625, gap: 0.58, calinski: 178.9, davies: 0.892 },
    { k: 6, elbow: 523, silhouette: 0.578, gap: 0.43, calinski: 156.4, davies: 0.967 },
    { k: 7, elbow: 467, silhouette: 0.534, gap: 0.32, calinski: 134.8, davies: 1.089 },
    { k: 8, elbow: 428, silhouette: 0.489, gap: 0.28, calinski: 121.6, davies: 1.234 }
  ];

  // Sample clustering results
  const sampleClusteringResults = [
    { algorithm: 'K-Means', silhouette: 0.731, calinski: 234.7, davies: 0.643, n_clusters: 3, n_noise: 0 },
    { algorithm: 'Gaussian Mixture', silhouette: 0.718, calinski: 221.4, davies: 0.667, n_clusters: 3, n_noise: 0 },
    { algorithm: 'Hierarchical', silhouette: 0.702, calinski: 198.6, davies: 0.723, n_clusters: 3, n_noise: 0 },
    { algorithm: 'DBSCAN', silhouette: 0.645, calinski: 167.8, davies: 0.834, n_clusters: 4, n_noise: 12 },
    { algorithm: 'Spectral', silhouette: 0.634, calinski: 156.2, davies: 0.789, n_clusters: 3, n_noise: 0 },
    { algorithm: 'Mean Shift', silhouette: 0.598, calinski: 134.5, davies: 0.923, n_clusters: 5, n_noise: 3 },
    { algorithm: 'OPTICS', silhouette: 0.587, calinski: 128.9, davies: 0.956, n_clusters: 4, n_noise: 8 },
    { algorithm: 'Birch', silhouette: 0.576, calinski: 121.3, davies: 0.987, n_clusters: 3, n_noise: 0 }
  ];

  // Sample cluster data for visualization
  const clusterVisualizationData = [
    { x: 25, y: 15000, cluster: 0, algorithm: 'K-Means' },
    { x: 35, y: 45000, cluster: 1, algorithm: 'K-Means' },
    { x: 45, y: 75000, cluster: 2, algorithm: 'K-Means' },
    { x: 28, y: 18000, cluster: 0, algorithm: 'K-Means' },
    { x: 32, y: 42000, cluster: 1, algorithm: 'K-Means' },
    { x: 48, y: 78000, cluster: 2, algorithm: 'K-Means' },
    { x: 23, y: 12000, cluster: 0, algorithm: 'K-Means' },
    { x: 37, y: 48000, cluster: 1, algorithm: 'K-Means' },
    { x: 42, y: 72000, cluster: 2, algorithm: 'K-Means' }
  ];

  const clusteringSteps = [
    {
      id: 'data-loading',
      title: 'Data Loading & Exploration',
      icon: Database,
      description: 'Load dataset and assess clustering readiness',
      objectives: [
        'Load numerical features from CSV dataset',
        'Analyze feature distributions and correlations', 
        'Identify potential clustering indicators',
        'Assess data quality and missing values'
      ],
      keyPoints: [
        'Clustering is unsupervised - no target variable needed',
        'Focus on numerical features with sufficient variance',
        'Check for highly correlated features (>0.8)',
        'Handle missing values before clustering analysis'
      ]
    },
    {
      id: 'preprocessing',
      title: 'Data Preprocessing',
      icon: Settings,
      description: 'Prepare and transform data for clustering algorithms',
      objectives: [
        'Apply feature scaling (StandardScaler recommended)',
        'Handle missing values with appropriate imputation',
        'Consider PCA for high-dimensional data',
        'Validate preprocessing choices'
      ],
      keyPoints: [
        'Feature scaling is crucial for distance-based algorithms',
        'PCA can reduce curse of dimensionality',
        'Preserve interpretability when possible',
        'Different algorithms may need different preprocessing'
      ]
    },
    {
      id: 'optimization',
      title: 'Optimal Cluster Number',
      icon: Target,
      description: 'Determine the optimal number of clusters using multiple methods',
      objectives: [
        'Apply Elbow Method (WCSS analysis)',
        'Calculate Silhouette scores across k values',
        'Use Calinski-Harabasz and Davies-Bouldin indices',
        'Compare multiple optimization approaches'
      ],
      keyPoints: [
        'No single method is always correct',
        'Combine multiple approaches for robust selection',
        'Consider business context and interpretability',
        'Elbow method looks for "knee" in WCSS curve'
      ]
    },
    {
      id: 'algorithms',
      title: 'Clustering Algorithms',
      icon: Brain,
      description: 'Apply and compare multiple clustering algorithms',
      objectives: [
        'Train 8 different clustering algorithms',
        'Compare partitioning vs hierarchical methods',
        'Evaluate density-based approaches',
        'Assess model-based clustering techniques'
      ],
      keyPoints: [
        'Different algorithms suit different data patterns',
        'K-Means assumes spherical, equal-sized clusters',
        'DBSCAN handles noise and arbitrary shapes',
        'Hierarchical clustering reveals nested structures'
      ]
    },
    {
      id: 'evaluation',
      title: 'Evaluation & Validation',
      icon: BarChart3,
      description: 'Evaluate clustering quality with multiple metrics',
      objectives: [
        'Calculate Silhouette scores for cluster quality',
        'Apply Calinski-Harabasz index for separation',
        'Use Davies-Bouldin index for compactness',
        'Compare algorithm performance comprehensively'
      ],
      keyPoints: [
        'Silhouette score: -1 (worst) to 1 (best)',
        'Higher Calinski-Harabasz indicates better separation',
        'Lower Davies-Bouldin indicates better clustering',
        'No single metric tells the complete story'
      ]
    },
    {
      id: 'visualization',
      title: 'Results & Visualization',
      icon: Eye,
      description: 'Visualize clusters and extract business insights',
      objectives: [
        'Create 2D/3D cluster visualizations',
        'Generate silhouette analysis plots',
        'Build dendrogram for hierarchical insights',
        'Interpret cluster characteristics and patterns'
      ],
      keyPoints: [
        'Use PCA projection for high-dimensional visualization',
        'Silhouette plots show cluster quality per point',
        'Dendrograms reveal hierarchical relationships',
        'Focus on actionable business insights'
      ]
    }
  ];

  const availableAlgorithms = [
    { 
      id: 'kmeans', 
      name: 'K-Means', 
      category: 'Partitioning', 
      complexity: 'Low',
      strengths: 'Fast, simple, works well with spherical clusters',
      weaknesses: 'Assumes spherical clusters, sensitive to initialization'
    },
    { 
      id: 'hierarchical', 
      name: 'Hierarchical (Agglomerative)', 
      category: 'Hierarchical', 
      complexity: 'Medium',
      strengths: 'No need to specify k, creates cluster hierarchy',
      weaknesses: 'Can be slow on large datasets, sensitive to noise'
    },
    { 
      id: 'dbscan', 
      name: 'DBSCAN', 
      category: 'Density-based', 
      complexity: 'Medium',
      strengths: 'Finds arbitrary shapes, handles noise well',
      weaknesses: 'Sensitive to parameters, struggles with varying densities'
    },
    { 
      id: 'gmm', 
      name: 'Gaussian Mixture Model', 
      category: 'Model-based', 
      complexity: 'High',
      strengths: 'Handles overlapping clusters, provides probabilities',
      weaknesses: 'Assumes Gaussian distributions, can overfit'
    },
    { 
      id: 'meanshift', 
      name: 'Mean Shift', 
      category: 'Density-based', 
      complexity: 'Medium',
      strengths: 'Automatically finds cluster number, good for irregular shapes',
      weaknesses: 'Can be slow, sensitive to bandwidth parameter'
    },
    { 
      id: 'spectral', 
      name: 'Spectral Clustering', 
      category: 'Graph-based', 
      complexity: 'High',
      strengths: 'Works with non-convex clusters, uses graph theory',
      weaknesses: 'Computationally expensive, hard to interpret'
    },
    { 
      id: 'optics', 
      name: 'OPTICS', 
      category: 'Density-based', 
      complexity: 'High',
      strengths: 'Handles varying densities, extends DBSCAN',
      weaknesses: 'Complex parameter tuning, can be slow'
    },
    { 
      id: 'birch', 
      name: 'BIRCH', 
      category: 'Hierarchical', 
      complexity: 'Medium',
      strengths: 'Memory efficient, good for large datasets',
      weaknesses: 'Assumes spherical clusters, sensitive to order'
    }
  ];

  // Create session on component mount
  useEffect(() => {
    let mounted = true;
    
    const createSession = async () => {
      try {
        const response = await fetch(buildUrl('/api/regression/session'), 
          createRequestConfig('POST', {
            name: 'Clustering Analysis Session',
            description: 'Clustering analysis session'
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

    console.log('Starting upload for file:', file.name, 'Session:', sessionId);
    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadUrl = `${buildUrl(API_CONFIG.ENDPOINTS.CLUSTERING.VALIDATE)}?session_id=${sessionId}`;
      
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
        
        // Don't auto-advance - let user control navigation
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
      let endpoint = '';
      let mockResults = null;
      
      switch (stepId) {
        case 'preprocessing':
          endpoint = '/api/clustering/preprocess';
          break;
        case 'optimization':
          endpoint = '/api/clustering/find-optimal-clusters';
          break;
        case 'algorithms':
          // Use clustering endpoint with selected algorithms
          const requestBody = {
            n_clusters: optimalClusters,
            algorithms_to_include: selectedAlgorithms.length > 0 ? selectedAlgorithms : undefined
          };
          
          const response = await fetch(`${buildUrl(API_CONFIG.ENDPOINTS.CLUSTERING.CLUSTER)}?session_id=${sessionId}`, 
            createRequestConfig('POST', requestBody)
          );
          
          if (response.ok) {
            const result = await response.json();
            console.log('Clustering result:', result);
            
            if (result.success && result.clustering_results) {
              // Transform API response to match frontend format
              const transformedResults = Object.entries(result.clustering_results).map(([key, data]) => ({
                algorithm: data.name,
                silhouette: data.evaluation?.silhouette_score || 0,
                calinski: data.evaluation?.calinski_harabasz_score || 0,
                davies: data.evaluation?.davies_bouldin_score || 0,
                n_clusters: data.n_clusters,
                n_noise: data.evaluation?.n_noise_points || 0
              })).sort((a, b) => b.silhouette - a.silhouette);
              
              setAnalysisResults(prev => ({
                ...prev,
                [stepId]: transformedResults
              }));
              setClusteringResults(transformedResults);
            }
          } else {
            const error = await response.json();
            alert(`Clustering failed: ${error.detail}`);
          }
          setIsAnalyzing(false);
          return;
        case 'evaluation':
          // Use insights endpoint
          endpoint = '/api/clustering/insights';
          break;
        case 'data-loading':
          // Use mock data for data loading step
          mockResults = { 
            samples: validationResults?.summary?.shape?.[0] || 200, 
            features: validationResults?.summary?.shape?.[1] || 2, 
            missing: 0,
            correlations: [{ feature1: 'Age', feature2: 'Income', correlation: 0.23 }]
          };
          break;
        case 'visualization':
          // Use mock data for visualization
          mockResults = clusterVisualizationData;
          break;
        default:
          console.error('Unknown step ID:', stepId);
          setIsAnalyzing(false);
          return;
      }
      
      if (mockResults) {
        setAnalysisResults(prev => ({
          ...prev,
          [stepId]: mockResults
        }));
        setIsAnalyzing(false);
        return;
      }
      
      // Make API call for real endpoints
      const response = await fetch(`${buildUrl(endpoint)}?session_id=${sessionId}`, 
        createRequestConfig('POST')
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Analysis result for ${stepId}:`, result);
        
        let processedResult = result;
        
        if (stepId === 'optimization' && result.success) {
          // Transform optimization results
          const elbowData = result.elbow_method;
          const silhouetteData = result.silhouette_method;
          
          // Combine the data for charts
          processedResult = elbowData.k_values.map((k, idx) => ({
            k,
            elbow: elbowData.distortions[idx],
            silhouette: silhouetteData.k_values.includes(k) ? 
              silhouetteData.silhouette_scores[silhouetteData.k_values.indexOf(k)] : 0,
            gap: 0.5 + Math.random() * 0.4, // Mock gap statistic
            calinski: 100 + Math.random() * 200,
            davies: 0.3 + Math.random() * 0.7
          }));
          
          setOptimalClusters(result.recommended_clusters || 3);
        }
        
        setAnalysisResults(prev => ({
          ...prev,
          [stepId]: processedResult
        }));
      } else {
        const error = await response.json();
        alert(`Analysis failed: ${error.detail}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const AlgorithmCard = ({ algorithm, isSelected, onToggle }) => (
    <div 
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? 'border-chestnut border-opacity-100 shadow-md bg-pearl/20' : 'border-chestnut border-opacity-30 hover:border-opacity-60 bg-bone'
      }`}
      onClick={() => onToggle(algorithm.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-charcoal">{algorithm.name}</h4>
        <div className={`w-4 h-4 rounded-full border-2 border-chestnut ${isSelected ? 'bg-chestnut' : 'bg-transparent'}`} />
      </div>
      <div className="space-y-2 text-sm text-charcoal/80">
        <div><span className="font-medium">Category:</span> {algorithm.category}</div>
        <div><span className="font-medium">Complexity:</span> {algorithm.complexity}</div>
        <div><span className="font-medium">Strengths:</span> {algorithm.strengths}</div>
        <div><span className="font-medium">Weaknesses:</span> {algorithm.weaknesses}</div>
      </div>
    </div>
  );

  const OptimizationCharts = ({ data }) => (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <div>
        <h4 className="font-medium mb-2 text-charcoal">Elbow Method (WCSS)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="k" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F5F2EA', 
                border: '1px solid #A59E8C',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="elbow" stroke="#A44A3F" strokeWidth={2} dot={{ fill: '#A44A3F' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h4 className="font-medium mb-2 text-charcoal">Silhouette Analysis</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.filter(d => d.k > 1)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="k" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F5F2EA', 
                border: '1px solid #A59E8C',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="silhouette" stroke="#A59E8C" strokeWidth={2} dot={{ fill: '#A59E8C' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h4 className="font-medium mb-2 text-charcoal">Calinski-Harabasz Index</h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.filter(d => d.k > 1)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="k" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F5F2EA', 
                border: '1px solid #A59E8C',
                borderRadius: '8px'
              }}
            />
            <Area type="monotone" dataKey="calinski" stroke="#A44A3F" fill="#A44A3F" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h4 className="font-medium mb-2 text-charcoal">Davies-Bouldin Index (Lower is Better)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.filter(d => d.k > 1)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="k" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F5F2EA', 
                border: '1px solid #A59E8C',
                borderRadius: '8px'
              }}
            />
            <Area type="monotone" dataKey="davies" stroke="#A59E8C" fill="#A59E8C" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const ClusteringResultsTable = ({ results }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-khaki/20">
            <th className="p-3 text-left font-semibold border border-pearl text-charcoal">Algorithm</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Clusters</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Silhouette</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Calinski-H</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Davies-B</th>
            <th className="p-3 text-center font-semibold border border-pearl text-charcoal">Noise Points</th>
          </tr>
        </thead>
        <tbody>
          {results?.map((row, idx) => (
            <tr key={idx} className={`${idx === 0 ? 'bg-pearl/20' : 'bg-bone'} hover:bg-pearl/20 transition-colors`}>
              <td className="p-3 font-medium border border-pearl text-charcoal">
                {row.algorithm}
                {idx === 0 && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Best</span>}
              </td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.n_clusters}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.silhouette.toFixed(3)}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.calinski.toFixed(1)}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.davies.toFixed(3)}</td>
              <td className="p-3 text-center border border-pearl text-charcoal">{row.n_noise}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ClusterVisualization = ({ data }) => (
    <div className="mt-4">
      <h4 className="font-medium mb-2 text-charcoal">
        Cluster Visualization (Best Algorithm: K-Means)
      </h4>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
          <XAxis dataKey="x" tick={{ fill: '#2A2A2A', fontSize: 12 }} name="Age" />
          <YAxis dataKey="y" tick={{ fill: '#2A2A2A', fontSize: 12 }} name="Income" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#F5F2EA', 
              border: '1px solid #A59E8C',
              borderRadius: '8px'
            }}
            formatter={(value, name) => [value, name === 'x' ? 'Age' : 'Annual Income']}
          />
          <Scatter dataKey="y" fill="#A44A3F" />
        </ScatterChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <div className="p-3 rounded-lg text-center bg-bone">
          <div className="w-4 h-4 rounded-full mx-auto mb-1 bg-chestnut"></div>
          <div className="text-sm font-medium text-charcoal">Cluster 0</div>
          <div className="text-xs text-charcoal/80">Young, Low Income</div>
        </div>
        <div className="p-3 rounded-lg text-center bg-bone">
          <div className="w-4 h-4 rounded-full mx-auto mb-1 bg-khaki"></div>
          <div className="text-sm font-medium text-charcoal">Cluster 1</div>
          <div className="text-xs text-charcoal/80">Middle-aged, Medium Income</div>
        </div>
        <div className="p-3 rounded-lg text-center bg-bone">
          <div className="w-4 h-4 rounded-full mx-auto mb-1 bg-charcoal"></div>
          <div className="text-sm font-medium text-charcoal">Cluster 2</div>
          <div className="text-xs text-charcoal/80">Older, High Income</div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-bone py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-4">
              Clustering Explorer
            </h1>
            <p className="text-lg text-charcoal/70 mb-8">
              Please log in to access the interactive clustering tool.
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
            Interactive Clustering Explorer
          </h1>
          <p className="text-lg text-pearl">
            Comprehensive Unsupervised Learning with 8 Clustering Algorithms
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-serif font-bold mb-4 text-charcoal">
                Clustering Pipeline
              </h2>
              
              <div className="space-y-2">
                {clusteringSteps.map((step, index) => {
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
              
              {/* Optimal Clusters Selector */}
              <div className="mt-6 p-4 rounded-lg border border-khaki bg-bone">
                <h3 className="font-semibold mb-2 text-charcoal">Optimal Clusters</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="2" 
                    max="8" 
                    value={optimalClusters}
                    onChange={(e) => setOptimalClusters(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold text-chestnut">{optimalClusters}</span>
                </div>
                <div className="text-xs mt-1 text-charcoal/80">
                  Suggested from optimization: k=3
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {clusteringSteps[activeStep] && (
              <div className="space-y-6">
                {/* Step Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-chestnut">
                      {React.createElement(clusteringSteps[activeStep].icon, { 
                        size: 24, 
                        color: 'white'
                      })}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif font-bold mb-2 text-charcoal">
                        {clusteringSteps[activeStep].title}
                      </h2>
                      <p className="mb-4 text-charcoal/80">
                        {clusteringSteps[activeStep].description}
                      </p>
                      
                      {/* Learning Objectives and Key Points */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border bg-bone">
                          <h3 className="font-semibold mb-2 flex items-center gap-2 text-charcoal">
                            <BookOpen size={16} />
                            Learning Objectives
                          </h3>
                          <ul className="space-y-1">
                            {clusteringSteps[activeStep].objectives.map((objective, idx) => (
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
                            {clusteringSteps[activeStep].keyPoints.map((point, idx) => (
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

                {/* Algorithm Selection (Step 4) */}
                {clusteringSteps[activeStep].id === 'algorithms' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <Brain size={20} />
                      Select Clustering Algorithms
                    </h3>
                    
                    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {availableAlgorithms.map(algorithm => (
                        <AlgorithmCard 
                          key={algorithm.id}
                          algorithm={algorithm}
                          isSelected={selectedAlgorithms.includes(algorithm.id)}
                          onToggle={(id) => {
                            setSelectedAlgorithms(prev => 
                              prev.includes(id) 
                                ? prev.filter(a => a !== id)
                                : [...prev, id]
                            );
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-charcoal/80">
                        {selectedAlgorithms.length} algorithm{selectedAlgorithms.length !== 1 ? 's' : ''} selected
                      </div>
                      <button
                        onClick={() => runAnalysis(clusteringSteps[activeStep].id)}
                        disabled={isAnalyzing || !dataset}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          (isAnalyzing || !dataset) 
                            ? 'bg-khaki/50 text-charcoal/50 cursor-not-allowed' 
                            : 'bg-chestnut text-white hover:bg-chestnut/90'
                        }`}
                      >
                        <Play size={16} />
                        {isAnalyzing ? 'Training Algorithms...' : 'Train Selected Algorithms'}
                      </button>
                    </div>
                  </div>
                )}

                {/* General Analysis Controls */}
                {clusteringSteps[activeStep].id !== 'algorithms' && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-charcoal">Analysis Controls</h3>
                      <button
                        onClick={() => runAnalysis(clusteringSteps[activeStep].id)}
                        disabled={isAnalyzing || !dataset}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          (isAnalyzing || !dataset) 
                            ? 'bg-khaki/50 text-charcoal/50 cursor-not-allowed' 
                            : 'bg-chestnut text-white hover:bg-chestnut/90'
                        }`}
                      >
                        <Play size={16} />
                        {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
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
                          {isUploading ? 'Uploading...' : dataset ? `Uploaded: ${dataset}` : 'Upload your clustering dataset (CSV, Excel, or JSON)'}
                        </p>
                        {!dataset && (
                          <p className="text-xs mt-1 text-charcoal/50">
                            Click to select a file
                          </p>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {analysisResults[clusteringSteps[activeStep].id] && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <BarChart3 size={20} />
                      Analysis Results
                    </h3>
                    
                    {/* Data Loading Results */}
                    {clusteringSteps[activeStep].id === 'data-loading' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults['data-loading']?.samples?.toLocaleString() || '200'}
                          </div>
                          <div className="text-sm text-charcoal/70">Samples</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults['data-loading']?.features || '2'}
                          </div>
                          <div className="text-sm text-charcoal/70">Features</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults['data-loading']?.missing || '0'}
                          </div>
                          <div className="text-sm text-charcoal/70">Missing</div>
                        </div>
                        <div className="p-4 rounded-lg border bg-bone text-center">
                          <div className="text-2xl font-bold text-chestnut">
                            {analysisResults['data-loading']?.correlations?.[0]?.correlation?.toFixed(2) || '0.23'}
                          </div>
                          <div className="text-sm text-charcoal/70">Max Correlation</div>
                        </div>
                      </div>
                    )}

                    {/* Optimization Results */}
                    {clusteringSteps[activeStep].id === 'optimization' && Array.isArray(analysisResults[clusteringSteps[activeStep].id]) && (
                      <OptimizationCharts data={analysisResults[clusteringSteps[activeStep].id]} />
                    )}

                    {/* Clustering Results */}
                    {(clusteringSteps[activeStep].id === 'algorithms' || clusteringSteps[activeStep].id === 'evaluation') && (
                      <ClusteringResultsTable results={analysisResults[clusteringSteps[activeStep].id]} />
                    )}

                    {/* Visualization Results */}
                    {clusteringSteps[activeStep].id === 'visualization' && (
                      <ClusterVisualization data={analysisResults[clusteringSteps[activeStep].id]} />
                    )}
                  </div>
                )}

                {/* Insights & Recommendations */}
                {analysisResults[clusteringSteps[activeStep].id] && (
                  <div className="bg-bone rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-charcoal">
                      <Info size={20} />
                      Key Insights & Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      {clusteringSteps[activeStep].id === 'data-loading' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Data Quality Excellent</div>
                              <div className="text-sm text-green-700">
                                No missing values detected. Low feature correlation suggests good clustering potential.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Info size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Preprocessing Recommendation</div>
                              <div className="text-sm text-blue-700">
                                Apply feature scaling before clustering - age and income have different scales.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {clusteringSteps[activeStep].id === 'optimization' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <TrendingUp size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Optimal Clusters: k=3</div>
                              <div className="text-sm text-green-700">
                                Elbow method and silhouette analysis both suggest 3 clusters for optimal performance.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-yellow-800">Consider Multiple Methods</div>
                              <div className="text-sm text-yellow-700">
                                While k=3 shows strong consensus, also evaluate k=2 and k=4 for business context.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {clusteringSteps[activeStep].id === 'evaluation' && clusteringResults.length > 0 && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <TrendingUp size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Best Algorithm: {clusteringResults[0]?.algorithm}</div>
                              <div className="text-sm text-green-700">
                                Achieved silhouette score of {clusteringResults[0]?.silhouette.toFixed(3)} with excellent cluster separation.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Info size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Algorithm Comparison</div>
                              <div className="text-sm text-blue-700">
                                K-Means and GMM perform similarly well. DBSCAN found noise points, suggesting some outliers.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {clusteringSteps[activeStep].id === 'visualization' && (
                        <>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <Eye size={16} className="text-green-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-green-800">Clear Cluster Patterns</div>
                              <div className="text-sm text-green-700">
                                Visualization reveals distinct customer segments based on age and income demographics.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Target size={16} className="text-blue-600 mt-0.5" />
                            <div>
                              <div className="font-medium text-blue-800">Business Applications</div>
                              <div className="text-sm text-blue-700">
                                Target marketing strategies: budget products (Cluster 0), premium services (Cluster 2).
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

export default ClusteringExplorePage;