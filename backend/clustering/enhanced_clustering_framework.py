# Enhanced Clustering Analysis Framework for FastAPI
# Optimized for React frontend integration

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from datetime import datetime
import logging
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict

# Machine Learning
from sklearn.cluster import (
    KMeans, DBSCAN, AgglomerativeClustering, SpectralClustering,
    MeanShift, Birch, MiniBatchKMeans
)
from sklearn.mixture import GaussianMixture  # Correct import location
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import (
    silhouette_score, calinski_harabasz_score, davies_bouldin_score,
    adjusted_rand_score, normalized_mutual_info_score
)
from sklearn.neighbors import NearestNeighbors
import scipy.cluster.hierarchy as sch
from kneed import KneeLocator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ClusteringConfig:
    """Configuration for clustering analysis."""
    max_clusters: int = 10
    min_clusters: int = 2
    algorithms_to_include: List[str] = None
    scaling_method: str = 'standard'  # 'standard', 'minmax', 'robust'
    dimensionality_reduction: str = 'pca'  # 'pca', 'tsne', 'none'
    n_components: int = 2
    random_state: int = 42
    evaluation_metrics: List[str] = None
    
    def __post_init__(self):
        if self.algorithms_to_include is None:
            self.algorithms_to_include = [
                'kmeans', 'dbscan', 'hierarchical', 'gaussian_mixture',
                'spectral', 'meanshift', 'birch', 'mini_batch_kmeans'
            ]
        if self.evaluation_metrics is None:
            self.evaluation_metrics = [
                'silhouette', 'calinski_harabasz', 'davies_bouldin'
            ]

class DataPreprocessor:
    """Handle data preprocessing for clustering."""
    
    def __init__(self, config: ClusteringConfig):
        self.config = config
        self.scaler = None
        self.pca = None
        self.tsne = None
        
    def preprocess_data(self, data: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        """Preprocess data for clustering."""
        processing_steps = []
        
        # Remove non-numeric columns
        numeric_data = data.select_dtypes(include=[np.number])
        if len(numeric_data.columns) == 0:
            raise ValueError("No numeric columns found for clustering")
        
        processing_steps.append(f"Selected {len(numeric_data.columns)} numeric features")
        
        # Handle missing values
        if numeric_data.isnull().sum().sum() > 0:
            numeric_data = numeric_data.fillna(numeric_data.median())
            processing_steps.append("Filled missing values with median")
        
        # Scale features
        if self.config.scaling_method == 'standard':
            self.scaler = StandardScaler()
            scaled_data = self.scaler.fit_transform(numeric_data)
            processing_steps.append("Applied standard scaling")
        else:
            scaled_data = numeric_data.values
            processing_steps.append("No scaling applied")
        
        # Dimensionality reduction
        if self.config.dimensionality_reduction == 'pca' and scaled_data.shape[1] > self.config.n_components:
            self.pca = PCA(n_components=self.config.n_components, random_state=self.config.random_state)
            reduced_data = self.pca.fit_transform(scaled_data)
            processing_steps.append(f"Applied PCA reduction to {self.config.n_components} components")
            return reduced_data, processing_steps
        elif self.config.dimensionality_reduction == 'tsne' and scaled_data.shape[1] > self.config.n_components:
            # Use PCA first if too many dimensions for t-SNE
            if scaled_data.shape[1] > 50:
                pca_temp = PCA(n_components=50, random_state=self.config.random_state)
                scaled_data = pca_temp.fit_transform(scaled_data)
            
            self.tsne = TSNE(n_components=self.config.n_components, random_state=self.config.random_state)
            reduced_data = self.tsne.fit_transform(scaled_data)
            processing_steps.append(f"Applied t-SNE reduction to {self.config.n_components} components")
            return reduced_data, processing_steps
        
        return scaled_data, processing_steps

class OptimalClusters:
    """Determine optimal number of clusters."""
    
    @staticmethod
    def elbow_method(data: np.ndarray, max_k: int = 10) -> Dict[str, Any]:
        """Find optimal clusters using elbow method."""
        K = range(1, max_k + 1)
        distortions = []
        
        for k in K:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(data)
            distortions.append(kmeans.inertia_)
        
        # Find elbow using kneed
        try:
            kl = KneeLocator(K, distortions, curve="convex", direction="decreasing")
            optimal_k = kl.elbow if kl.elbow else 3
        except:
            optimal_k = 3
        
        return {
            'optimal_clusters': optimal_k,
            'k_values': list(K),
            'distortions': distortions
        }
    
    @staticmethod
    def silhouette_method(data: np.ndarray, max_k: int = 10) -> Dict[str, Any]:
        """Find optimal clusters using silhouette analysis."""
        K = range(2, max_k + 1)
        silhouette_scores = []
        
        for k in K:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(data)
            silhouette_avg = silhouette_score(data, cluster_labels)
            silhouette_scores.append(silhouette_avg)
        
        optimal_k = K[np.argmax(silhouette_scores)]
        
        return {
            'optimal_clusters': optimal_k,
            'k_values': list(K),
            'silhouette_scores': silhouette_scores,
            'best_score': max(silhouette_scores)
        }

class ClusteringAlgorithms:
    """Collection of clustering algorithms."""
    
    def __init__(self, config: ClusteringConfig):
        self.config = config
        
    def get_algorithms(self) -> Dict[str, Any]:
        """Get clustering algorithms based on config."""
        algorithms = {}
        
        if 'kmeans' in self.config.algorithms_to_include:
            algorithms['kmeans'] = {
                'name': 'K-Means',
                'requires_n_clusters': True,
                'algorithm': KMeans
            }
        
        if 'mini_batch_kmeans' in self.config.algorithms_to_include:
            algorithms['mini_batch_kmeans'] = {
                'name': 'Mini-Batch K-Means',
                'requires_n_clusters': True,
                'algorithm': MiniBatchKMeans
            }
        
        if 'dbscan' in self.config.algorithms_to_include:
            algorithms['dbscan'] = {
                'name': 'DBSCAN',
                'requires_n_clusters': False,
                'algorithm': DBSCAN
            }
        
        if 'hierarchical' in self.config.algorithms_to_include:
            algorithms['hierarchical'] = {
                'name': 'Hierarchical Clustering',
                'requires_n_clusters': True,
                'algorithm': AgglomerativeClustering
            }
        
        if 'gaussian_mixture' in self.config.algorithms_to_include:
            algorithms['gaussian_mixture'] = {
                'name': 'Gaussian Mixture',
                'requires_n_clusters': True,
                'algorithm': GaussianMixture
            }
        
        if 'spectral' in self.config.algorithms_to_include:
            algorithms['spectral'] = {
                'name': 'Spectral Clustering',
                'requires_n_clusters': True,
                'algorithm': SpectralClustering
            }
        
        if 'meanshift' in self.config.algorithms_to_include:
            algorithms['meanshift'] = {
                'name': 'Mean Shift',
                'requires_n_clusters': False,
                'algorithm': MeanShift
            }
        
        if 'birch' in self.config.algorithms_to_include:
            algorithms['birch'] = {
                'name': 'BIRCH',
                'requires_n_clusters': True,
                'algorithm': Birch
            }
        
        return algorithms

class ClusterEvaluator:
    """Evaluate clustering results."""
    
    @staticmethod
    def evaluate_clustering(data: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
        """Evaluate clustering performance."""
        metrics = {}
        
        # Remove noise points for DBSCAN (-1 labels)
        valid_mask = labels != -1
        if valid_mask.sum() < 2:
            return {'error': 'Insufficient valid clusters for evaluation'}
        
        valid_data = data[valid_mask]
        valid_labels = labels[valid_mask]
        
        # Only evaluate if we have at least 2 clusters
        n_clusters = len(np.unique(valid_labels))
        if n_clusters < 2:
            return {'error': 'Less than 2 clusters found'}
        
        try:
            metrics['silhouette_score'] = float(silhouette_score(valid_data, valid_labels))
        except:
            metrics['silhouette_score'] = 0.0
        
        try:
            metrics['calinski_harabasz_score'] = float(calinski_harabasz_score(valid_data, valid_labels))
        except:
            metrics['calinski_harabasz_score'] = 0.0
        
        try:
            metrics['davies_bouldin_score'] = float(davies_bouldin_score(valid_data, valid_labels))
        except:
            metrics['davies_bouldin_score'] = 0.0
        
        metrics['n_clusters'] = int(n_clusters)
        metrics['n_noise_points'] = int((labels == -1).sum())
        
        return metrics

class ClusteringWorkflow:
    """Main workflow orchestrator for clustering analysis."""
    
    def __init__(self, config: ClusteringConfig = None):
        self.config = config or ClusteringConfig()
        self.preprocessor = DataPreprocessor(self.config)
        self.algorithms = ClusteringAlgorithms(self.config)
        self.evaluator = ClusterEvaluator()
        self.results = {}
        self.processed_data = None
        
    def validate_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Validate data for clustering analysis."""
        validation_results = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'recommendations': []
        }
        
        if data.empty:
            validation_results['errors'].append("Dataset is empty")
            validation_results['is_valid'] = False
            return validation_results
        
        numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        if len(numeric_cols) < 2:
            validation_results['errors'].append("Need at least 2 numeric columns for clustering")
            validation_results['is_valid'] = False
        
        if len(data) < 10:
            validation_results['warnings'].append("Dataset is very small - clustering may not be meaningful")
        
        if data.isnull().sum().sum() > len(data) * 0.5:
            validation_results['warnings'].append("High proportion of missing values detected")
        
        # Add basic data summary
        summary = {
            'shape': data.shape,
            'numeric_columns': numeric_cols,
            'missing_values': data.isnull().sum().to_dict(),
            'data_types': data.dtypes.astype(str).to_dict()
        }
        
        return {
            'validation': validation_results,
            'summary': summary
        }
    
    def preprocess_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Preprocess data for clustering."""
        try:
            processed_data, steps = self.preprocessor.preprocess_data(data)
            self.processed_data = processed_data
            
            return {
                'success': True,
                'preprocessing_steps': steps,
                'processed_shape': processed_data.shape,
                'original_shape': data.shape
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def find_optimal_clusters(self) -> Dict[str, Any]:
        """Find optimal number of clusters."""
        try:
            if self.processed_data is None:
                return {
                    'success': False,
                    'error': 'No preprocessed data available'
                }
            
            elbow_result = OptimalClusters.elbow_method(self.processed_data, self.config.max_clusters)
            silhouette_result = OptimalClusters.silhouette_method(self.processed_data, self.config.max_clusters)
            
            return {
                'success': True,
                'elbow_method': elbow_result,
                'silhouette_method': silhouette_result,
                'recommended_clusters': silhouette_result['optimal_clusters']
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def perform_clustering(self, n_clusters: Optional[int] = None) -> Dict[str, Any]:
        """Perform clustering with multiple algorithms."""
        try:
            if self.processed_data is None:
                return {
                    'success': False,
                    'error': 'No preprocessed data available'
                }
            
            algorithms = self.algorithms.get_algorithms()
            clustering_results = {}
            
            # Determine optimal clusters if not provided
            if n_clusters is None:
                optimal_result = self.find_optimal_clusters()
                if optimal_result['success']:
                    n_clusters = optimal_result['silhouette_method']['optimal_clusters']
                else:
                    n_clusters = 3  # Default fallback
            
            for algo_name, algo_info in algorithms.items():
                try:
                    if algo_info['requires_n_clusters']:
                        if algo_name == 'gaussian_mixture':
                            model = algo_info['algorithm'](n_components=n_clusters, random_state=self.config.random_state)
                            labels = model.fit_predict(self.processed_data)
                        else:
                            model = algo_info['algorithm'](n_clusters=n_clusters, random_state=self.config.random_state)
                            labels = model.fit_predict(self.processed_data)
                    else:
                        if algo_name == 'dbscan':
                            # Auto-determine eps using k-distance
                            k = min(4, len(self.processed_data) - 1)
                            nbrs = NearestNeighbors(n_neighbors=k).fit(self.processed_data)
                            distances, indices = nbrs.kneighbors(self.processed_data)
                            distances = np.sort(distances[:, k-1], axis=0)
                            eps = np.percentile(distances, 90)
                            
                            model = algo_info['algorithm'](eps=eps, min_samples=5)
                        else:
                            model = algo_info['algorithm']()
                        
                        labels = model.fit_predict(self.processed_data)
                    
                    # Evaluate clustering
                    evaluation = self.evaluator.evaluate_clustering(self.processed_data, labels)
                    
                    clustering_results[algo_name] = {
                        'name': algo_info['name'],
                        'labels': labels.tolist(),
                        'n_clusters': len(np.unique(labels[labels != -1])),
                        'evaluation': evaluation
                    }
                    
                except Exception as algo_error:
                    logger.warning(f"Failed to run {algo_name}: {str(algo_error)}")
                    clustering_results[algo_name] = {
                        'name': algo_info['name'],
                        'error': str(algo_error)
                    }
            
            # Find best algorithm based on silhouette score
            best_algorithm = None
            best_score = -1
            
            for algo_name, result in clustering_results.items():
                if 'evaluation' in result and 'silhouette_score' in result['evaluation']:
                    score = result['evaluation']['silhouette_score']
                    if score > best_score:
                        best_score = score
                        best_algorithm = algo_name
            
            self.results = {
                'clustering_results': clustering_results,
                'best_algorithm': best_algorithm,
                'best_score': best_score,
                'processed_data': self.processed_data,
                'n_clusters_used': n_clusters
            }
            
            return {
                'success': True,
                'clustering_results': clustering_results,
                'best_algorithm': best_algorithm,
                'best_score': best_score,
                'summary': {
                    'algorithms_run': len(clustering_results),
                    'successful_algorithms': len([r for r in clustering_results.values() if 'error' not in r]),
                    'best_algorithm': best_algorithm,
                    'best_silhouette_score': best_score
                }
            }
            
        except Exception as e:
            logger.error(f"Clustering failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_cluster_insights(self) -> Dict[str, Any]:
        """Generate insights from clustering results."""
        try:
            if not self.results or 'clustering_results' not in self.results:
                return {
                    'success': False,
                    'error': 'No clustering results available'
                }
            
            insights = {
                'algorithm_comparison': [],
                'cluster_characteristics': {},
                'recommendations': []
            }
            
            # Compare algorithms
            for algo_name, result in self.results['clustering_results'].items():
                if 'evaluation' in result:
                    insights['algorithm_comparison'].append({
                        'algorithm': result['name'],
                        'n_clusters': result['n_clusters'],
                        'silhouette_score': result['evaluation'].get('silhouette_score', 0),
                        'calinski_harabasz_score': result['evaluation'].get('calinski_harabasz_score', 0),
                        'davies_bouldin_score': result['evaluation'].get('davies_bouldin_score', 0)
                    })
            
            # Sort by silhouette score
            insights['algorithm_comparison'].sort(key=lambda x: x['silhouette_score'], reverse=True)
            
            # Generate recommendations
            if insights['algorithm_comparison']:
                best_algo = insights['algorithm_comparison'][0]
                if best_algo['silhouette_score'] > 0.5:
                    insights['recommendations'].append("Excellent clustering structure detected")
                elif best_algo['silhouette_score'] > 0.25:
                    insights['recommendations'].append("Reasonable clustering structure found")
                else:
                    insights['recommendations'].append("Weak clustering structure - consider feature engineering")
                
                if best_algo['n_clusters'] > 8:
                    insights['recommendations'].append("High number of clusters - consider if this is meaningful for your use case")
            
            return {
                'success': True,
                'insights': insights
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }