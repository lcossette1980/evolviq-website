# Enhanced Classification Analysis Framework for FastAPI
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
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, 
    roc_auc_score, confusion_matrix, classification_report
)
from sklearn.pipeline import Pipeline
import joblib

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ClassificationConfig:
    """Configuration for classification analysis."""
    test_size: float = 0.25
    random_state: int = 42
    cv_folds: int = 5
    models_to_include: List[str] = None
    scoring_metric: str = 'accuracy'
    handle_missing: str = 'auto'
    encode_categorical: str = 'onehot'
    scale_features: bool = True
    hyperparameter_tuning: bool = True
    stratify: bool = True
    
    def __post_init__(self):
        if self.models_to_include is None:
            self.models_to_include = [
                'logistic', 'knn', 'svm_linear', 'svm_rbf', 'naive_bayes', 
                'decision_tree', 'random_forest', 'gradient_boosting', 'neural_network'
            ]

class DataValidator:
    """Data validation for classification analysis."""
    
    @staticmethod
    def validate_classification_data(data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Validate data for classification analysis."""
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
        unique_classes = target_series.dropna().nunique()
        
        if unique_classes < 2:
            validation_results['errors'].append("Target column must have at least 2 classes")
            validation_results['is_valid'] = False
        elif unique_classes > 10:
            validation_results['warnings'].append(f"High number of classes ({unique_classes}) - consider multiclass strategies")
        
        # Class balance analysis
        class_counts = target_series.value_counts()
        min_class_size = class_counts.min()
        max_class_size = class_counts.max()
        imbalance_ratio = max_class_size / min_class_size if min_class_size > 0 else float('inf')
        
        if imbalance_ratio > 10:
            validation_results['warnings'].append(f"Severe class imbalance detected (ratio: {imbalance_ratio:.1f})")
            validation_results['recommendations'].append("Consider class balancing techniques")
        elif imbalance_ratio > 3:
            validation_results['warnings'].append(f"Moderate class imbalance detected (ratio: {imbalance_ratio:.1f})")
        
        # Feature validation
        feature_columns = [col for col in data.columns if col != target_column]
        
        if len(feature_columns) == 0:
            validation_results['errors'].append("No feature columns found")
            validation_results['is_valid'] = False
        
        if len(data) < 50:
            validation_results['warnings'].append(f"Small dataset ({len(data)} rows) - results may be unreliable")
        
        return validation_results

class ModelTrainer:
    """Handle model training for classification."""
    
    def __init__(self, config: ClassificationConfig):
        self.config = config
        self.models = {}
        self.trained_models = {}
        
    def initialize_models(self) -> Dict[str, Any]:
        """Initialize classification models."""
        available_models = {
            'logistic': LogisticRegression(random_state=self.config.random_state, max_iter=1000),
            'knn': KNeighborsClassifier(n_neighbors=5),
            'svm_linear': SVC(kernel='linear', random_state=self.config.random_state, probability=True),
            'svm_rbf': SVC(kernel='rbf', random_state=self.config.random_state, probability=True),
            'naive_bayes': GaussianNB(),
            'decision_tree': DecisionTreeClassifier(random_state=self.config.random_state),
            'random_forest': RandomForestClassifier(
                n_estimators=100,
                random_state=self.config.random_state,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=100,
                random_state=self.config.random_state
            ),
            'neural_network': MLPClassifier(
                hidden_layer_sizes=(100, 50),
                random_state=self.config.random_state,
                max_iter=500
            )
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
        
        # Always use pipeline with scaling for consistency
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', model)
        ])
        
        pipeline.fit(X_train, y_train)
        self.trained_models[model_name] = pipeline
        return pipeline

class ModelEvaluator:
    """Evaluate classification model performance."""
    
    def __init__(self, config: ClassificationConfig):
        self.config = config
    
    def evaluate_model(self, model: Any, X_train: pd.DataFrame, X_test: pd.DataFrame,
                      y_train: pd.Series, y_test: pd.Series, model_name: str) -> Tuple[Dict[str, float], np.ndarray]:
        """Evaluate a single model."""
        
        # Cross-validation on training set
        cv_scores = cross_val_score(
            model, X_train, y_train,
            cv=self.config.cv_folds,
            scoring=self.config.scoring_metric,
            n_jobs=-1
        )
        
        # Test predictions
        y_pred = model.predict(X_test)
        y_pred_proba = None
        
        # Get prediction probabilities if available
        try:
            y_pred_proba = model.predict_proba(X_test)
        except:
            pass
        
        # Calculate metrics
        metrics = {
            'cv_mean': float(cv_scores.mean()),
            'cv_std': float(cv_scores.std()),
            'test_accuracy': float(accuracy_score(y_test, y_pred)),
            'test_precision': float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
            'test_recall': float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
            'test_f1': float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        }
        
        # Add AUC if binary classification and probabilities available
        if y_pred_proba is not None and len(np.unique(y_test)) == 2:
            try:
                metrics['test_auc'] = float(roc_auc_score(y_test, y_pred_proba[:, 1]))
            except:
                metrics['test_auc'] = 0.0
        else:
            metrics['test_auc'] = 0.0
        
        return metrics, cv_scores

class ClassificationWorkflow:
    """Main workflow orchestrator for classification analysis."""
    
    def __init__(self, config: ClassificationConfig = None):
        self.config = config or ClassificationConfig()
        self.model_trainer = ModelTrainer(self.config)
        self.model_evaluator = ModelEvaluator(self.config)
        self.results = {}
        self.feature_columns = None
        self.target_encoder = None
        
    def validate_data(self, data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Validate uploaded data."""
        validation_results = DataValidator.validate_classification_data(data, target_column)
        
        # Add basic data summary
        summary = {
            'shape': data.shape,
            'columns': data.columns.tolist(),
            'target_classes': data[target_column].value_counts().to_dict() if target_column in data.columns else {},
            'missing_values': data.isnull().sum().to_dict(),
            'data_types': data.dtypes.astype(str).to_dict()
        }
        
        return {
            'validation': validation_results,
            'summary': summary
        }
    
    def preprocess_data(self, data: pd.DataFrame, target_column: str) -> Dict[str, Any]:
        """Preprocess the data."""
        try:
            processed_data = data.copy()
            preprocessing_steps = []
            
            # Handle missing values
            for col in processed_data.columns:
                if processed_data[col].isnull().sum() > 0:
                    if col == target_column:
                        # Drop rows with missing target values
                        processed_data = processed_data.dropna(subset=[col])
                        preprocessing_steps.append(f"Removed rows with missing target values")
                    elif processed_data[col].dtype in ['object', 'category']:
                        mode_val = processed_data[col].mode()
                        fill_val = mode_val.iloc[0] if len(mode_val) > 0 else 'Unknown'
                        processed_data[col].fillna(fill_val, inplace=True)
                        preprocessing_steps.append(f"Filled missing values in '{col}' with mode")
                    else:
                        median_val = processed_data[col].median()
                        processed_data[col].fillna(median_val, inplace=True)
                        preprocessing_steps.append(f"Filled missing values in '{col}' with median")
            
            # Encode categorical features
            feature_columns = [col for col in processed_data.columns if col != target_column]
            categorical_cols = processed_data[feature_columns].select_dtypes(include=['object', 'category']).columns.tolist()
            
            if categorical_cols:
                processed_data = pd.get_dummies(processed_data, columns=categorical_cols, prefix_sep='_', drop_first=True)
                preprocessing_steps.append(f"One-hot encoded {len(categorical_cols)} categorical columns")
            
            # Encode target variable if it's categorical
            if processed_data[target_column].dtype in ['object', 'category']:
                self.target_encoder = LabelEncoder()
                processed_data[target_column] = self.target_encoder.fit_transform(processed_data[target_column])
                preprocessing_steps.append("Label encoded target variable")
            
            # Update feature columns after encoding
            self.feature_columns = [col for col in processed_data.columns if col != target_column]
            
            return {
                'success': True,
                'processed_data': processed_data.to_dict('records'),
                'feature_columns': self.feature_columns,
                'preprocessing_steps': preprocessing_steps,
                'final_shape': processed_data.shape,
                'target_classes': processed_data[target_column].value_counts().to_dict()
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
            stratify_param = y if self.config.stratify else None
            X_train, X_test, y_train, y_test = train_test_split(
                X, y,
                test_size=self.config.test_size,
                random_state=self.config.random_state,
                stratify=stratify_param
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
                row = {'model': name}
                row.update(result['metrics'])
                comparison_data.append(row)
            
            comparison_df = pd.DataFrame(comparison_data).sort_values('test_accuracy', ascending=False)
            
            # Identify best model
            best_model_name = comparison_df.iloc[0]['model']
            best_model = model_results[best_model_name]['model']
            
            # Generate feature importance if possible
            feature_importance = None
            if hasattr(best_model.named_steps['model'], 'feature_importances_'):
                importance_values = best_model.named_steps['model'].feature_importances_
                feature_importance = [
                    {'feature': feature, 'importance': float(importance)}
                    for feature, importance in zip(self.feature_columns, importance_values)
                ]
                feature_importance.sort(key=lambda x: x['importance'], reverse=True)
            elif hasattr(best_model.named_steps['model'], 'coef_'):
                coef_values = best_model.named_steps['model'].coef_
                if len(coef_values.shape) > 1:
                    # Multi-class: use mean absolute coefficient
                    importance_values = np.mean(np.abs(coef_values), axis=0)
                else:
                    importance_values = np.abs(coef_values)
                
                feature_importance = [
                    {'feature': feature, 'importance': float(importance)}
                    for feature, importance in zip(self.feature_columns, importance_values)
                ]
                feature_importance.sort(key=lambda x: x['importance'], reverse=True)
            
            # Generate confusion matrix for best model
            y_pred_best = best_model.predict(X_test)
            conf_matrix = confusion_matrix(y_test, y_pred_best)
            
            # Store results
            self.results = {
                'model_results': model_results,
                'comparison_df': comparison_df.to_dict('records'),
                'cross_validation': cross_validation_scores,
                'best_model_name': best_model_name,
                'best_model': best_model,
                'feature_importance': feature_importance,
                'confusion_matrix': conf_matrix.tolist(),
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
                'confusion_matrix': conf_matrix.tolist(),
                'training_summary': {
                    'models_trained': len(model_results),
                    'best_accuracy': float(comparison_df.iloc[0]['test_accuracy']),
                    'best_f1_score': float(comparison_df.iloc[0]['test_f1'])
                }
            }
            
        except Exception as e:
            logger.error(f"Training failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_visualizations(self) -> Dict[str, Any]:
        """Create Plotly visualizations for classification results."""
        try:
            import plotly.graph_objects as go
            import numpy as np
            visuals = {}

            # Model comparison bar (Accuracy)
            if 'comparison_df' in self.results:
                comp_df = pd.DataFrame(self.results['comparison_df'])
                fig = go.Figure()
                fig.add_trace(go.Bar(
                    x=comp_df['model'],
                    y=comp_df['test_accuracy'],
                    name='Accuracy',
                    marker_color='#A44A3F',
                    text=[f"{v:.3f}" for v in comp_df['test_accuracy']],
                    textposition='auto'
                ))
                fig.update_layout(title='Model Accuracy Comparison', yaxis_title='Accuracy', height=400)
                visuals['model_comparison'] = fig.to_dict()

            # Confusion matrix heatmap for best model
            if 'confusion_matrix' in self.results:
                cm = np.array(self.results['confusion_matrix'])
                heat = go.Figure(data=go.Heatmap(
                    z=cm,
                    colorscale='Reds',
                    showscale=True
                ))
                heat.update_layout(title='Confusion Matrix', xaxis_title='Predicted', yaxis_title='Actual', height=400)
                visuals['confusion_matrix'] = heat.to_dict()

            # ROC curve (binary) if probabilities available
            try:
                if 'best_model' in self.results and 'X_test' in self.results:
                    best = self.results['best_model']
                    X_test = self.results['X_test']
                    y_test = self.results['y_test']
                    # Try proba
                    proba = None
                    try:
                        proba = best.predict_proba(X_test)
                    except Exception:
                        pass
                    if proba is not None and len(np.unique(y_test)) == 2:
                        from sklearn.metrics import roc_curve, auc
                        fpr, tpr, _ = roc_curve(y_test, proba[:, 1])
                        roc_auc = auc(fpr, tpr)
                        roc_fig = go.Figure()
                        roc_fig.add_trace(go.Scatter(x=fpr, y=tpr, mode='lines', name=f'ROC (AUC={roc_auc:.3f})', line=dict(color='#A44A3F')))
                        roc_fig.add_trace(go.Scatter(x=[0,1], y=[0,1], mode='lines', name='Chance', line=dict(dash='dash', color='#cccccc')))
                        roc_fig.update_layout(title='ROC Curve', xaxis_title='False Positive Rate', yaxis_title='True Positive Rate', height=400)
                        visuals['roc_curve'] = roc_fig.to_dict()
            except Exception:
                pass

            # Feature importance bar (if available)
            if self.results.get('feature_importance'):
                imp_df = pd.DataFrame(self.results['feature_importance'])
                top = imp_df.head(15)
                fig_imp = go.Figure(go.Bar(y=top['feature'], x=top['importance'], orientation='h', marker_color='#A44A3F'))
                fig_imp.update_layout(title='Feature Importance', xaxis_title='Importance', height=500, yaxis={'categoryorder': 'total ascending'})
                visuals['feature_importance'] = fig_imp.to_dict()

            return {'success': True, 'visualizations': visuals}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
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
            prediction_proba = None
            
            try:
                prediction_proba = self.results['best_model'].predict_proba(input_df)[0].tolist()
            except:
                pass
            
            # Decode prediction if target was encoded
            if self.target_encoder is not None:
                prediction = self.target_encoder.inverse_transform([prediction])[0]
            
            return {
                'success': True,
                'prediction': prediction,
                'prediction_probabilities': prediction_proba,
                'model_used': self.results['best_model_name'],
                'input_features': input_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
