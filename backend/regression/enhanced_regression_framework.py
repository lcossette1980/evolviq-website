# Enhanced Production Regression Analysis Framework for FastAPI
# Optimized for React frontend integration

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime
import joblib
import json
from pathlib import Path
import logging
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
import hashlib
import base64

# Machine Learning
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.inspection import permutation_importance
from sklearn.pipeline import Pipeline
from scipy import stats

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RegressionConfig:
    """Configuration for regression analysis."""
    test_size: float = 0.2
    random_state: int = 42
    cv_folds: int = 5
    models_to_include: List[str] = None
    scoring_metric: str = 'r2'
    handle_missing: str = 'auto'
    encode_categorical: str = 'onehot'
    scale_features: bool = True
    hyperparameter_tuning: bool = True
    tuning_method: str = 'random'
    tuning_iterations: int = 50
    
    def __post_init__(self):
        if self.models_to_include is None:
            self.models_to_include = [
                'linear', 'ridge', 'lasso', 'elastic_net', 
                'random_forest', 'gradient_boosting', 'svr'
            ]

class DataValidator:
    """Data validation for regression analysis."""
    
    @staticmethod
    def validate_regression_data(data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Validate data for regression analysis."""
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
        
        if target_column not in data.columns:
            validation_results['errors'].append(f"Target column '{target_column}' not found")
            validation_results['is_valid'] = False
            return validation_results
        
        # Target validation
        target_series = data[target_column]
        
        if target_series.isnull().all():
            validation_results['errors'].append("Target column is entirely null")
            validation_results['is_valid'] = False
        
        if not pd.api.types.is_numeric_dtype(target_series):
            try:
                pd.to_numeric(target_series, errors='raise')
            except (ValueError, TypeError):
                validation_results['errors'].append(
                    f"Target column '{target_column}' is not numeric and cannot be converted"
                )
                validation_results['is_valid'] = False
        
        # Feature validation
        feature_columns = [col for col in data.columns if col != target_column]
        
        if len(feature_columns) == 0:
            validation_results['errors'].append("No feature columns found")
            validation_results['is_valid'] = False
        
        if len(data) < 50:
            validation_results['warnings'].append(
                f"Dataset is very small ({len(data)} rows). Results may be unreliable."
            )
        
        return validation_results
    
    @staticmethod
    def get_data_summary(data: pd.DataFrame) -> Dict[str, Any]:
        """Generate comprehensive data summary."""
        dtypes_dict = {}
        for dtype, count in data.dtypes.value_counts().items():
            dtypes_dict[str(dtype)] = int(count)
        
        summary = {
            'shape': data.shape,
            'memory_usage_mb': float(data.memory_usage(deep=True).sum() / 1024**2),
            'dtypes': dtypes_dict,
            'missing_values': {k: int(v) for k, v in data.isnull().sum().to_dict().items()},
            'duplicate_rows': int(data.duplicated().sum()),
            'numerical_columns': data.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_columns': data.select_dtypes(include=['object', 'category']).columns.tolist()
        }
        
        if summary['numerical_columns']:
            stats_dict = data[summary['numerical_columns']].describe().to_dict()
            summary['numerical_stats'] = {
                col: {stat: float(val) if isinstance(val, (np.floating, np.integer)) else val 
                      for stat, val in col_stats.items()}
                for col, col_stats in stats_dict.items()
            }
        
        return summary

class DataProcessor:
    """Handle data preprocessing."""
    
    def __init__(self, config: RegressionConfig):
        self.config = config
        self.preprocessing_steps = []
        self.encoders = {}
        self.scalers = {}
        
    def handle_missing_values(self, data: pd.DataFrame, target_column: str) -> pd.DataFrame:
        """Handle missing values based on configuration."""
        data = data.copy()
        
        if self.config.handle_missing == 'drop':
            data = data.dropna()
            self.preprocessing_steps.append("Dropped rows with missing values")
        elif self.config.handle_missing in ['impute', 'auto']:
            for col in data.columns:
                if col == target_column:
                    continue
                    
                if data[col].isnull().sum() > 0:
                    if data[col].dtype in ['object', 'category']:
                        mode_value = data[col].mode()
                        fill_value = mode_value[0] if len(mode_value) > 0 else 'Unknown'
                        data[col] = data[col].fillna(fill_value)
                        self.preprocessing_steps.append(f"Filled missing values in '{col}' with mode")
                    else:
                        median_val = data[col].median()
                        data[col] = data[col].fillna(median_val)
                        self.preprocessing_steps.append(f"Filled missing values in '{col}' with median")
        
        return data
    
    def encode_categorical_features(self, data: pd.DataFrame, target_column: str) -> pd.DataFrame:
        """Encode categorical features."""
        data = data.copy()
        feature_columns = [col for col in data.columns if col != target_column]
        categorical_cols = data[feature_columns].select_dtypes(include=['object', 'category']).columns.tolist()
        
        if not categorical_cols:
            return data
        
        if self.config.encode_categorical in ['onehot', 'one_hot_encoding']:
            data = pd.get_dummies(data, columns=categorical_cols, prefix_sep='_', drop_first=True)
            self.preprocessing_steps.append(f"One-hot encoded {len(categorical_cols)} categorical columns")
        elif self.config.encode_categorical in ['label', 'label_encoding']:
            for col in categorical_cols:
                le = LabelEncoder()
                data[col] = le.fit_transform(data[col].astype(str))
                self.encoders[col] = le
                self.preprocessing_steps.append(f"Label encoded '{col}'")
        
        return data
    
    def get_preprocessing_summary(self) -> List[str]:
        """Get summary of preprocessing steps performed."""
        return self.preprocessing_steps.copy()

class ModelTrainer:
    """Handle model training."""
    
    def __init__(self, config: RegressionConfig):
        self.config = config
        self.models = {}
        self.trained_models = {}
        
    def initialize_models(self) -> Dict[str, Any]:
        """Initialize regression models."""
        available_models = {
            'linear': LinearRegression(),
            'ridge': Ridge(random_state=self.config.random_state),
            'lasso': Lasso(random_state=self.config.random_state),
            'elastic_net': ElasticNet(random_state=self.config.random_state),
            'random_forest': RandomForestRegressor(
                n_estimators=100,
                random_state=self.config.random_state,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100,
                random_state=self.config.random_state
            ),
            'svr': SVR()
        }
        
        self.models = {
            name: model for name, model in available_models.items()
            if name in self.config.models_to_include
        }
        
        return self.models
    
    def train_model(self, model_name: str, X_train: pd.DataFrame, y_train: pd.Series) -> Any:
        """Train a single model."""
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not available")
        
        model = self.models[model_name]
        
        if model_name == 'svr' or self.config.scale_features:
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('model', model)
            ])
            pipeline.fit(X_train, y_train)
            self.trained_models[model_name] = pipeline
            return pipeline
        else:
            model.fit(X_train, y_train)
            self.trained_models[model_name] = model
            return model

class ModelEvaluator:
    """Evaluate model performance."""
    
    def __init__(self, config: RegressionConfig):
        self.config = config
    
    def evaluate_model(self, model: Any, X_train: pd.DataFrame, X_test: pd.DataFrame,
                      y_train: pd.Series, y_test: pd.Series, model_name: str) -> Tuple[Dict[str, float], np.ndarray]:
        """Evaluate a single model."""
        
        # Cross-validation
        cv_scores = cross_val_score(
            model, X_train, y_train,
            cv=self.config.cv_folds,
            scoring=self.config.scoring_metric,
            n_jobs=-1
        )
        
        # Test predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        metrics = {
            'cv_mean': float(cv_scores.mean()),
            'cv_std': float(cv_scores.std()),
            'test_r2': float(r2_score(y_test, y_pred)),
            'test_rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
            'test_mae': float(mean_absolute_error(y_test, y_pred))
        }
        
        return metrics, cv_scores

class ModelVisualizer:
    """Create visualizations for model analysis."""
    
    @staticmethod
    def create_model_comparison_chart(results_df: pd.DataFrame) -> Dict[str, Any]:
        """Create model comparison visualization data."""
        
        fig = go.Figure()
        
        # R² Score comparison
        fig.add_trace(go.Bar(
            x=results_df['Model'],
            y=results_df['test_r2'],
            name='R² Score',
            marker_color='lightblue',
            text=[f"{val:.3f}" for val in results_df['test_r2']],
            textposition='auto'
        ))
        
        fig.update_layout(
            title="Model Performance Comparison (R² Score)",
            xaxis_title="Model",
            yaxis_title="R² Score",
            font=dict(family='Lato', size=12),
            height=400
        )
        
        return fig.to_dict()
    
    @staticmethod
    def create_feature_importance_chart(importance_df: pd.DataFrame) -> Dict[str, Any]:
        """Create feature importance visualization."""
        
        top_features = importance_df.head(15)
        
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            y=top_features['feature'],
            x=top_features['importance'],
            orientation='h',
            marker=dict(
                color=top_features['importance'],
                colorscale='Viridis',
                showscale=True
            ),
            text=[f"{val:.4f}" for val in top_features['importance']],
            textposition='inside'
        ))
        
        fig.update_layout(
            title="Feature Importance Analysis",
            xaxis_title="Importance Score",
            yaxis_title="Features",
            height=500,
            yaxis={'categoryorder': 'total ascending'}
        )
        
        return fig.to_dict()
    
    @staticmethod
    def create_residual_plots(y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, Any]:
        """Create residual analysis plots."""
        
        residuals = y_true - y_pred
        
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Residuals vs Predicted', 'Residual Distribution',
                          'Q-Q Plot', 'Residuals vs Fitted'),
            specs=[[{"secondary_y": False}, {"secondary_y": False}],
                   [{"secondary_y": False}, {"secondary_y": False}]]
        )
        
        # Residuals vs Predicted
        fig.add_trace(
            go.Scatter(x=y_pred, y=residuals, mode='markers',
                      name='Residuals', marker=dict(opacity=0.6)),
            row=1, col=1
        )
        
        # Add zero line
        fig.add_trace(
            go.Scatter(x=[y_pred.min(), y_pred.max()], y=[0, 0],
                      mode='lines', name='Zero Line', 
                      line=dict(color='red', dash='dash')),
            row=1, col=1
        )
        
        # Residual distribution
        fig.add_trace(
            go.Histogram(x=residuals, nbinsx=30, name='Distribution'),
            row=1, col=2
        )
        
        # Q-Q Plot
        sorted_residuals = np.sort(residuals)
        theoretical_quantiles = stats.norm.ppf(np.linspace(0.01, 0.99, len(sorted_residuals)))
        
        fig.add_trace(
            go.Scatter(x=theoretical_quantiles, y=sorted_residuals,
                      mode='markers', name='Q-Q Plot'),
            row=2, col=1
        )
        
        # Standardized residuals
        std_residuals = residuals / residuals.std()
        fig.add_trace(
            go.Scatter(x=y_pred, y=std_residuals, mode='markers',
                      name='Standardized'),
            row=2, col=2
        )
        
        fig.update_layout(height=600, showlegend=False, 
                         title_text="Residual Analysis")
        
        return fig.to_dict()

class RegressionWorkflow:
    """Main workflow orchestrator for regression analysis."""
    
    def __init__(self, config: RegressionConfig = None):
        self.config = config or RegressionConfig()
        self.data_processor = DataProcessor(self.config)
        self.model_trainer = ModelTrainer(self.config)
        self.model_evaluator = ModelEvaluator(self.config)
        self.results = {}
        self.feature_columns = None
    
    def validate_data(self, data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Validate uploaded data."""
        validation_results = DataValidator.validate_regression_data(data, target_column)
        data_summary = DataValidator.get_data_summary(data)
        
        return {
            'validation': validation_results,
            'summary': data_summary
        }
    
    def preprocess_data(self, data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Preprocess the data."""
        try:
            # Handle missing values
            processed_data = self.data_processor.handle_missing_values(data, target_column)
            
            # Encode categorical features
            processed_data = self.data_processor.encode_categorical_features(processed_data, target_column)
            
            # Update feature columns
            self.feature_columns = [col for col in processed_data.columns if col != target_column]
            
            preprocessing_summary = self.data_processor.get_preprocessing_summary()
            
            return {
                'success': True,
                'processed_data': processed_data.to_dict('records'),
                'feature_columns': self.feature_columns,
                'preprocessing_steps': preprocessing_summary,
                'final_shape': processed_data.shape
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def train_models(self, data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Train and evaluate models."""
        try:
            # Prepare data
            X = data[self.feature_columns]
            y = data[target_column]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, 
                test_size=self.config.test_size,
                random_state=self.config.random_state
            )
            
            # Initialize models
            models = self.model_trainer.initialize_models()
            
            # Train and evaluate each model
            model_results = {}
            cross_validation_scores = {}
            
            for model_name in models:
                # Train model
                trained_model = self.model_trainer.train_model(model_name, X_train, y_train)
                
                # Evaluate model
                metrics, cv_scores = self.model_evaluator.evaluate_model(
                    trained_model, X_train, X_test, y_train, y_test, model_name
                )
                
                model_results[model_name] = {
                    'model': trained_model,
                    'metrics': metrics
                }
                cross_validation_scores[model_name] = cv_scores.tolist()
            
            # Create comparison DataFrame
            comparison_data = []
            for name, result in model_results.items():
                row = {'Model': name}
                row.update(result['metrics'])
                comparison_data.append(row)
            
            comparison_df = pd.DataFrame(comparison_data).sort_values('test_r2', ascending=False)
            
            # Identify best model
            best_model_name = comparison_df.iloc[0]['Model']
            best_model = model_results[best_model_name]['model']
            
            # Generate feature importance if possible
            feature_importance = None
            if hasattr(best_model, 'feature_importances_'):
                importance_df = pd.DataFrame({
                    'feature': self.feature_columns,
                    'importance': best_model.feature_importances_
                }).sort_values('importance', ascending=False)
                feature_importance = importance_df.to_dict('records')
            elif hasattr(best_model, 'coef_'):
                coef = best_model.coef_ if hasattr(best_model, 'coef_') else best_model.named_steps['model'].coef_
                importance_df = pd.DataFrame({
                    'feature': self.feature_columns,
                    'importance': np.abs(coef)
                }).sort_values('importance', ascending=False)
                feature_importance = importance_df.to_dict('records')
            
            # Store results
            self.results = {
                'model_results': model_results,
                'comparison_df': comparison_df.to_dict('records'),
                'cross_validation': cross_validation_scores,
                'best_model_name': best_model_name,
                'best_model': best_model,
                'feature_importance': feature_importance,
                'X_test': X_test,
                'y_test': y_test,
                'split_info': {
                    'train_size': len(X_train),
                    'test_size': len(X_test),
                    'test_ratio': self.config.test_size
                }
            }
            
            return {
                'success': True,
                'model_results': {name: result['metrics'] for name, result in model_results.items()},
                'comparison_data': comparison_df.to_dict('records'),
                'best_model': best_model_name,
                'feature_importance': feature_importance,
                'training_summary': {
                    'models_trained': len(model_results),
                    'best_r2_score': float(comparison_df.iloc[0]['test_r2']),
                    'best_rmse': float(comparison_df.iloc[0]['test_rmse'])
                }
            }
            
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def make_prediction(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction with the best model."""
        try:
            if 'best_model' not in self.results:
                return {
                    'success': False,
                    'error': 'No trained model available'
                }
            
            # Convert input to DataFrame
            input_df = pd.DataFrame([input_data])
            
            # Ensure all required features are present
            for feature in self.feature_columns:
                if feature not in input_df.columns:
                    input_df[feature] = 0  # Default value for missing features
            
            # Select features in correct order
            input_df = input_df[self.feature_columns]
            
            # Make prediction
            prediction = self.results['best_model'].predict(input_df)[0]
            
            return {
                'success': True,
                'prediction': float(prediction),
                'model_used': self.results['best_model_name'],
                'input_features': input_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_visualizations(self) -> Dict[str, Any]:
        """Generate visualization data."""
        try:
            visualizations = {}
            
            if 'comparison_df' in self.results:
                comparison_df = pd.DataFrame(self.results['comparison_df'])
                visualizations['model_comparison'] = ModelVisualizer.create_model_comparison_chart(comparison_df)
            
            if 'feature_importance' in self.results and self.results['feature_importance']:
                importance_df = pd.DataFrame(self.results['feature_importance'])
                visualizations['feature_importance'] = ModelVisualizer.create_feature_importance_chart(importance_df)
            
            if 'best_model' in self.results and 'X_test' in self.results:
                y_pred = self.results['best_model'].predict(self.results['X_test'])
                visualizations['residual_analysis'] = ModelVisualizer.create_residual_plots(
                    self.results['y_test'], y_pred
                )
            
            return {
                'success': True,
                'visualizations': visualizations
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def export_model(self) -> Dict[str, Any]:
        """Export the best model."""
        try:
            if 'best_model' not in self.results:
                return {
                    'success': False,
                    'error': 'No trained model available'
                }
            
            # Serialize model
            model_bytes = joblib.dumps(self.results['best_model'])
            model_b64 = base64.b64encode(model_bytes).decode('utf-8')
            
            # Create metadata
            metadata = {
                'model_type': self.results['best_model_name'],
                'feature_names': self.feature_columns,
                'performance_metrics': self.results['model_results'][self.results['best_model_name']]['metrics'],
                'created_at': datetime.now().isoformat(),
                'config': asdict(self.config)
            }
            
            return {
                'success': True,
                'model_data': model_b64,
                'metadata': metadata,
                'filename': f"{self.results['best_model_name']}_model.joblib"
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }