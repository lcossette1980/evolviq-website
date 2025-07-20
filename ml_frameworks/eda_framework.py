# Enhanced EDA Analysis Framework for FastAPI
# Optimized for React frontend integration

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime
import logging
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
import scipy.stats as stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EDAConfig:
    """Configuration for EDA analysis."""
    correlation_threshold: float = 0.1
    outlier_method: str = 'iqr'  # 'iqr', 'zscore', 'isolation_forest'
    outlier_threshold: float = 1.5
    missing_threshold: float = 0.05
    cardinality_threshold: int = 50
    visualizations: List[str] = None
    
    def __post_init__(self):
        if self.visualizations is None:
            self.visualizations = [
                'distributions', 'correlations', 'missing_patterns', 
                'outliers', 'feature_relationships'
            ]

class DataQualityAssessment:
    """Comprehensive data quality assessment."""
    
    @staticmethod
    def assess_quality(data: pd.DataFrame) -> Dict[str, Any]:
        """Perform comprehensive data quality assessment."""
        assessment = {
            'overall_score': 0.0,
            'completeness': {},
            'uniqueness': {},
            'validity': {},
            'consistency': {},
            'recommendations': []
        }
        
        total_cells = data.shape[0] * data.shape[1]
        missing_cells = data.isnull().sum().sum()
        
        # Completeness score
        completeness_score = (1 - missing_cells / total_cells) * 100
        assessment['completeness'] = {
            'score': completeness_score,
            'missing_count': int(missing_cells),
            'total_count': int(total_cells),
            'missing_by_column': data.isnull().sum().to_dict()
        }
        
        # Uniqueness score
        duplicate_rows = data.duplicated().sum()
        uniqueness_score = (1 - duplicate_rows / len(data)) * 100 if len(data) > 0 else 100
        assessment['uniqueness'] = {
            'score': uniqueness_score,
            'duplicate_count': int(duplicate_rows),
            'unique_count': int(len(data) - duplicate_rows)
        }
        
        # Validity score (basic data type consistency)
        validity_issues = 0
        total_checks = 0
        
        for col in data.columns:
            total_checks += 1
            if data[col].dtype == 'object':
                # Check for mixed types in string columns
                if data[col].dropna().apply(type).nunique() > 1:
                    validity_issues += 1
            elif np.issubdtype(data[col].dtype, np.number):
                # Check for infinite values
                if np.isinf(data[col]).any():
                    validity_issues += 1
        
        validity_score = (1 - validity_issues / total_checks) * 100 if total_checks > 0 else 100
        assessment['validity'] = {
            'score': validity_score,
            'issues_found': validity_issues,
            'total_checks': total_checks
        }
        
        # Overall score (weighted average)
        assessment['overall_score'] = (
            completeness_score * 0.4 + 
            uniqueness_score * 0.3 + 
            validity_score * 0.3
        )
        
        # Generate recommendations
        if completeness_score < 95:
            assessment['recommendations'].append("Address missing values before analysis")
        if uniqueness_score < 98:
            assessment['recommendations'].append("Remove or investigate duplicate records")
        if validity_score < 95:
            assessment['recommendations'].append("Review data types and handle invalid values")
        
        return assessment

class UnivariateAnalysis:
    """Comprehensive univariate analysis."""
    
    @staticmethod
    def analyze_numeric_features(data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze numeric features comprehensively."""
        numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        
        results = {
            'summary_stats': {},
            'distribution_analysis': {},
            'outlier_analysis': {},
            'recommendations': []
        }
        
        for col in numeric_cols:
            series = data[col].dropna()
            
            if len(series) == 0:
                continue
                
            # Summary statistics
            results['summary_stats'][col] = {
                'count': int(len(series)),
                'mean': float(series.mean()),
                'median': float(series.median()),
                'std': float(series.std()),
                'min': float(series.min()),
                'max': float(series.max()),
                'q25': float(series.quantile(0.25)),
                'q75': float(series.quantile(0.75)),
                'skewness': float(stats.skew(series)),
                'kurtosis': float(stats.kurtosis(series))
            }
            
            # Distribution analysis
            skewness = abs(stats.skew(series))
            kurtosis_val = stats.kurtosis(series)
            
            distribution_type = 'normal'
            if skewness > 2:
                distribution_type = 'highly_skewed'
            elif skewness > 0.5:
                distribution_type = 'moderately_skewed'
            
            results['distribution_analysis'][col] = {
                'type': distribution_type,
                'skewness': float(skewness),
                'kurtosis': float(kurtosis_val),
                'transformation_needed': bool(skewness > 1.0)
            }
            
            # Outlier detection using IQR method
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = series[(series < lower_bound) | (series > upper_bound)]
            
            results['outlier_analysis'][col] = {
                'outlier_count': int(len(outliers)),
                'outlier_percentage': float(len(outliers) / len(series) * 100),
                'lower_bound': float(lower_bound),
                'upper_bound': float(upper_bound)
            }
        
        return results
    
    @staticmethod
    def analyze_categorical_features(data: pd.DataFrame) -> Dict[str, Any]:
        """Analyze categorical features."""
        categorical_cols = data.select_dtypes(include=['object', 'category']).columns.tolist()
        
        results = {
            'cardinality_analysis': {},
            'frequency_analysis': {},
            'recommendations': []
        }
        
        for col in categorical_cols:
            series = data[col].dropna()
            
            if len(series) == 0:
                continue
            
            unique_count = series.nunique()
            total_count = len(series)
            
            results['cardinality_analysis'][col] = {
                'unique_count': int(unique_count),
                'total_count': int(total_count),
                'cardinality_ratio': float(unique_count / total_count),
                'high_cardinality': bool(unique_count > 50)
            }
            
            # Frequency analysis
            value_counts = series.value_counts().head(10)
            results['frequency_analysis'][col] = {
                'top_values': value_counts.to_dict(),
                'mode': str(series.mode().iloc[0]) if len(series.mode()) > 0 else None
            }
        
        return results

class BivariateAnalysis:
    """Bivariate relationship analysis."""
    
    @staticmethod
    def correlation_analysis(data: pd.DataFrame) -> Dict[str, Any]:
        """Comprehensive correlation analysis."""
        numeric_data = data.select_dtypes(include=[np.number])
        
        if len(numeric_data.columns) < 2:
            return {'error': 'Insufficient numeric columns for correlation analysis'}
        
        # Pearson correlation
        pearson_corr = numeric_data.corr()
        
        # Spearman correlation
        spearman_corr = numeric_data.corr(method='spearman')
        
        # Find strong correlations
        strong_correlations = []
        for i in range(len(pearson_corr.columns)):
            for j in range(i+1, len(pearson_corr.columns)):
                corr_val = pearson_corr.iloc[i, j]
                if abs(corr_val) > 0.7:
                    strong_correlations.append({
                        'feature1': pearson_corr.columns[i],
                        'feature2': pearson_corr.columns[j],
                        'correlation': float(corr_val),
                        'strength': 'strong' if abs(corr_val) > 0.8 else 'moderate'
                    })
        
        return {
            'pearson_correlation': pearson_corr.to_dict(),
            'spearman_correlation': spearman_corr.to_dict(),
            'strong_correlations': strong_correlations,
            'multicollinearity_detected': len(strong_correlations) > 0
        }

class DataCleaning:
    """Data cleaning and preprocessing utilities."""
    
    @staticmethod
    def handle_missing_values(data: pd.DataFrame, strategy: str = 'auto') -> Tuple[pd.DataFrame, List[str]]:
        """Handle missing values with specified strategy."""
        cleaned_data = data.copy()
        cleaning_steps = []
        
        for col in data.columns:
            missing_count = data[col].isnull().sum()
            missing_ratio = missing_count / len(data)
            
            if missing_count == 0:
                continue
            
            if missing_ratio > 0.5:
                # Drop columns with >50% missing values
                cleaned_data.drop(columns=[col], inplace=True)
                cleaning_steps.append(f"Dropped column '{col}' (>{missing_ratio:.1%} missing)")
                continue
            
            if data[col].dtype in ['object', 'category']:
                # Fill categorical with mode
                mode_val = data[col].mode()
                fill_val = mode_val.iloc[0] if len(mode_val) > 0 else 'Unknown'
                cleaned_data[col].fillna(fill_val, inplace=True)
                cleaning_steps.append(f"Filled missing values in '{col}' with mode")
            else:
                # Fill numeric with median
                median_val = data[col].median()
                cleaned_data[col].fillna(median_val, inplace=True)
                cleaning_steps.append(f"Filled missing values in '{col}' with median")
        
        return cleaned_data, cleaning_steps
    
    @staticmethod
    def remove_outliers(data: pd.DataFrame, method: str = 'iqr') -> Tuple[pd.DataFrame, List[str]]:
        """Remove outliers using specified method."""
        cleaned_data = data.copy()
        cleaning_steps = []
        
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if method == 'iqr':
                Q1 = data[col].quantile(0.25)
                Q3 = data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outlier_mask = (data[col] < lower_bound) | (data[col] > upper_bound)
                outlier_count = outlier_mask.sum()
                
                if outlier_count > 0:
                    cleaned_data = cleaned_data[~outlier_mask]
                    cleaning_steps.append(f"Removed {outlier_count} outliers from '{col}' using IQR method")
        
        return cleaned_data, cleaning_steps

class EDAWorkflow:
    """Main EDA workflow orchestrator."""
    
    def __init__(self, config: EDAConfig = None):
        self.config = config or EDAConfig()
        self.data_quality = DataQualityAssessment()
        self.univariate = UnivariateAnalysis()
        self.bivariate = BivariateAnalysis()
        self.cleaning = DataCleaning()
        self.results = {}
    
    def validate_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Validate data for EDA analysis."""
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
        
        if len(data.columns) < 2:
            validation_results['warnings'].append("Dataset has very few columns")
        
        if len(data) < 10:
            validation_results['warnings'].append("Dataset has very few rows")
        
        # Check memory usage
        memory_mb = data.memory_usage(deep=True).sum() / 1024**2
        if memory_mb > 100:
            validation_results['warnings'].append(f"Large dataset ({memory_mb:.1f} MB)")
        
        return validation_results
    
    def perform_quality_assessment(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Perform comprehensive data quality assessment."""
        try:
            assessment = self.data_quality.assess_quality(data)
            
            return {
                'success': True,
                'assessment': assessment
            }
        except Exception as e:
            logger.error(f"Quality assessment failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def perform_univariate_analysis(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Perform univariate analysis."""
        try:
            numeric_analysis = self.univariate.analyze_numeric_features(data)
            categorical_analysis = self.univariate.analyze_categorical_features(data)
            
            return {
                'success': True,
                'numeric_analysis': numeric_analysis,
                'categorical_analysis': categorical_analysis
            }
        except Exception as e:
            logger.error(f"Univariate analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def perform_bivariate_analysis(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Perform bivariate analysis."""
        try:
            correlation_results = self.bivariate.correlation_analysis(data)
            
            return {
                'success': True,
                'correlation_analysis': correlation_results
            }
        except Exception as e:
            logger.error(f"Bivariate analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def clean_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Clean the dataset."""
        try:
            # Handle missing values
            cleaned_data, missing_steps = self.cleaning.handle_missing_values(data)
            
            # Remove outliers
            cleaned_data, outlier_steps = self.cleaning.remove_outliers(cleaned_data)
            
            all_steps = missing_steps + outlier_steps
            
            return {
                'success': True,
                'cleaned_data': cleaned_data.to_dict('records'),
                'cleaning_steps': all_steps,
                'original_shape': data.shape,
                'cleaned_shape': cleaned_data.shape
            }
        except Exception as e:
            logger.error(f"Data cleaning failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_insights(self, data: pd.DataFrame, analysis_results: Dict) -> Dict[str, Any]:
        """Generate actionable insights from analysis."""
        insights = {
            'data_quality_insights': [],
            'feature_insights': [],
            'relationship_insights': [],
            'recommendations': []
        }
        
        # Data quality insights
        if 'assessment' in analysis_results:
            quality = analysis_results['assessment']
            overall_score = quality.get('overall_score', 0)
            
            if overall_score >= 90:
                insights['data_quality_insights'].append({
                    'type': 'positive',
                    'message': f"Excellent data quality (Score: {overall_score:.1f}/100)"
                })
            elif overall_score >= 70:
                insights['data_quality_insights'].append({
                    'type': 'warning',
                    'message': f"Good data quality with room for improvement (Score: {overall_score:.1f}/100)"
                })
            else:
                insights['data_quality_insights'].append({
                    'type': 'negative',
                    'message': f"Poor data quality requires attention (Score: {overall_score:.1f}/100)"
                })
        
        # Feature insights
        if 'numeric_analysis' in analysis_results:
            numeric = analysis_results['numeric_analysis']
            if 'distribution_analysis' in numeric:
                skewed_features = []
                for feature, analysis in numeric['distribution_analysis'].items():
                    if analysis.get('transformation_needed', False):
                        skewed_features.append(feature)
                
                if skewed_features:
                    insights['feature_insights'].append({
                        'type': 'warning',
                        'message': f"Features requiring transformation: {', '.join(skewed_features)}"
                    })
        
        # Relationship insights
        if 'correlation_analysis' in analysis_results:
            corr = analysis_results['correlation_analysis']
            if corr.get('multicollinearity_detected', False):
                strong_corrs = corr.get('strong_correlations', [])
                insights['relationship_insights'].append({
                    'type': 'warning',
                    'message': f"Detected {len(strong_corrs)} strong correlations - consider feature selection"
                })
        
        return insights