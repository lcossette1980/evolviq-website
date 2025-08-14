# Enhanced NLP Analysis Framework for FastAPI
# Optimized for React frontend integration

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from datetime import datetime
import logging
import re
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from collections import Counter

# NLP Libraries
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer, PorterStemmer
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.chunk import ne_chunk
from nltk.tag import pos_tag

# Scikit-learn for ML
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation, TruncatedSVD
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

try:
    nltk.data.find('averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

try:
    nltk.data.find('maxent_ne_chunker')
except LookupError:
    nltk.download('maxent_ne_chunker')

try:
    nltk.data.find('words')
except LookupError:
    nltk.download('words')

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NLPConfig:
    """Configuration for NLP analysis."""
    max_features: int = 1000
    min_df: int = 2
    max_df: float = 0.95
    ngram_range: Tuple[int, int] = (1, 2)
    stop_words: str = 'english'
    lowercase: bool = True
    remove_punctuation: bool = True
    remove_numbers: bool = True
    lemmatize: bool = True
    stem: bool = False
    min_word_length: int = 2
    sentiment_analysis: bool = True
    topic_modeling: bool = True
    named_entity_recognition: bool = True
    text_classification: bool = True
    n_topics: int = 5
    random_state: int = 42

class TextPreprocessor:
    """Handle text preprocessing."""
    
    def __init__(self, config: NLPConfig):
        self.config = config
        self.lemmatizer = WordNetLemmatizer() if config.lemmatize else None
        self.stemmer = PorterStemmer() if config.stem else None
        self.stop_words = set(stopwords.words('english')) if config.stop_words == 'english' else set()
        
    def clean_text(self, text: str) -> str:
        """Clean and preprocess a single text."""
        if not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        if self.config.lowercase:
            text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove punctuation
        if self.config.remove_punctuation:
            text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove numbers
        if self.config.remove_numbers:
            text = re.sub(r'\d+', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize_and_process(self, text: str) -> List[str]:
        """Tokenize and process text."""
        # Clean text first
        text = self.clean_text(text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Filter tokens
        processed_tokens = []
        for token in tokens:
            # Skip short words
            if len(token) < self.config.min_word_length:
                continue
            
            # Skip stop words
            if token in self.stop_words:
                continue
            
            # Apply stemming or lemmatization
            if self.lemmatizer:
                token = self.lemmatizer.lemmatize(token)
            elif self.stemmer:
                token = self.stemmer.stem(token)
            
            processed_tokens.append(token)
        
        return processed_tokens
    
    def preprocess_documents(self, documents: List[str]) -> List[str]:
        """Preprocess a list of documents."""
        processed_docs = []
        for doc in documents:
            tokens = self.tokenize_and_process(doc)
            processed_docs.append(' '.join(tokens))
        return processed_docs

class SentimentAnalyzer:
    """Perform sentiment analysis."""
    
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of a single text."""
        scores = self.analyzer.polarity_scores(text)
        
        # Determine overall sentiment
        if scores['compound'] >= 0.05:
            sentiment = 'positive'
        elif scores['compound'] <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'compound': scores['compound'],
            'positive': scores['pos'],
            'negative': scores['neg'],
            'neutral': scores['neu']
        }
    
    def analyze_documents(self, documents: List[str]) -> Dict[str, Any]:
        """Analyze sentiment for multiple documents."""
        results = []
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for i, doc in enumerate(documents):
            sentiment_result = self.analyze_sentiment(doc)
            sentiment_result['document_id'] = i
            results.append(sentiment_result)
            sentiment_counts[sentiment_result['sentiment']] += 1
        
        # Calculate overall statistics
        compound_scores = [r['compound'] for r in results]
        
        return {
            'individual_results': results,
            'summary': {
                'total_documents': len(documents),
                'sentiment_distribution': sentiment_counts,
                'average_compound': np.mean(compound_scores),
                'sentiment_std': np.std(compound_scores)
            }
        }

class TopicModeler:
    """Perform topic modeling."""
    
    def __init__(self, config: NLPConfig):
        self.config = config
        self.vectorizer = None
        self.lda_model = None
        self.feature_names = None
    
    def fit_topic_model(self, documents: List[str]) -> Dict[str, Any]:
        """Fit LDA topic model."""
        try:
            # Create TF-IDF vectorizer
            self.vectorizer = TfidfVectorizer(
                max_features=self.config.max_features,
                min_df=self.config.min_df,
                max_df=self.config.max_df,
                ngram_range=self.config.ngram_range,
                stop_words=self.config.stop_words
            )
            
            # Fit vectorizer
            doc_term_matrix = self.vectorizer.fit_transform(documents)
            self.feature_names = self.vectorizer.get_feature_names_out()
            
            # Fit LDA model
            self.lda_model = LatentDirichletAllocation(
                n_components=self.config.n_topics,
                random_state=self.config.random_state,
                max_iter=100
            )
            
            self.lda_model.fit(doc_term_matrix)
            
            # Get topics
            topics = self.get_topics()
            
            # Get document-topic distributions
            doc_topic_dist = self.lda_model.transform(doc_term_matrix)
            
            return {
                'success': True,
                'topics': topics,
                'document_topic_distributions': doc_topic_dist.tolist(),
                'model_perplexity': self.lda_model.perplexity(doc_term_matrix),
                'model_log_likelihood': self.lda_model.score(doc_term_matrix)
            }
            
        except Exception as e:
            logger.error(f"Topic modeling failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_topics(self, n_words: int = 10) -> List[Dict[str, Any]]:
        """Extract topics with top words."""
        if self.lda_model is None or self.feature_names is None:
            return []
        
        topics = []
        for topic_idx, topic in enumerate(self.lda_model.components_):
            top_words_idx = topic.argsort()[-n_words:][::-1]
            top_words = [self.feature_names[i] for i in top_words_idx]
            top_weights = [topic[i] for i in top_words_idx]
            
            topics.append({
                'topic_id': topic_idx,
                'words': top_words,
                'weights': top_weights
            })
        
        return topics

class NamedEntityRecognizer:
    """Perform named entity recognition."""
    
    @staticmethod
    def extract_entities(text: str) -> Dict[str, Any]:
        """Extract named entities from text."""
        # Tokenize and tag
        tokens = word_tokenize(text)
        pos_tags = pos_tag(tokens)
        
        # Named entity chunking
        entities = ne_chunk(pos_tags)
        
        # Extract entities
        entity_list = []
        current_entity = []
        current_label = None
        
        for item in entities:
            if hasattr(item, 'label'):  # It's an entity
                if current_label != item.label():
                    if current_entity:
                        entity_list.append({
                            'text': ' '.join(current_entity),
                            'label': current_label
                        })
                    current_entity = [child[0] for child in item]
                    current_label = item.label()
                else:
                    current_entity.extend([child[0] for child in item])
        
        # Add the last entity
        if current_entity:
            entity_list.append({
                'text': ' '.join(current_entity),
                'label': current_label
            })
        
        # Count entity types
        entity_counts = Counter([entity['label'] for entity in entity_list])
        
        return {
            'entities': entity_list,
            'entity_counts': dict(entity_counts),
            'total_entities': len(entity_list)
        }
    
    @staticmethod
    def extract_entities_batch(documents: List[str]) -> Dict[str, Any]:
        """Extract entities from multiple documents."""
        all_entities = []
        all_counts = Counter()
        
        for i, doc in enumerate(documents):
            result = NamedEntityRecognizer.extract_entities(doc)
            for entity in result['entities']:
                entity['document_id'] = i
                all_entities.append(entity)
            
            for entity_type, count in result['entity_counts'].items():
                all_counts[entity_type] += count
        
        return {
            'all_entities': all_entities,
            'entity_type_counts': dict(all_counts),
            'total_entities': len(all_entities)
        }

class TextClassifier:
    """Perform text classification."""
    
    def __init__(self, config: NLPConfig):
        self.config = config
        self.vectorizer = None
        self.models = {}
        self.trained_models = {}
    
    def prepare_features(self, documents: List[str]) -> Any:
        """Prepare features for classification."""
        self.vectorizer = TfidfVectorizer(
            max_features=self.config.max_features,
            min_df=self.config.min_df,
            max_df=self.config.max_df,
            ngram_range=self.config.ngram_range,
            stop_words=self.config.stop_words
        )
        
        return self.vectorizer.fit_transform(documents)
    
    def train_classifiers(self, X: Any, y: np.ndarray) -> Dict[str, Any]:
        """Train multiple classifiers."""
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=self.config.random_state, stratify=y
            )
            
            # Initialize models
            self.models = {
                'logistic_regression': LogisticRegression(random_state=self.config.random_state, max_iter=1000),
                'naive_bayes': MultinomialNB(),
                'svm': SVC(random_state=self.config.random_state, probability=True),
                'random_forest': RandomForestClassifier(random_state=self.config.random_state, n_estimators=100)
            }
            
            results = {}
            
            for name, model in self.models.items():
                # Train model
                model.fit(X_train, y_train)
                self.trained_models[name] = model
                
                # Make predictions
                y_pred = model.predict(X_test)
                
                # Calculate metrics
                accuracy = accuracy_score(y_test, y_pred)
                
                results[name] = {
                    'accuracy': float(accuracy),
                    'model': model
                }
            
            # Find best model
            best_model_name = max(results.keys(), key=lambda k: results[k]['accuracy'])
            
            return {
                'success': True,
                'model_results': {k: {'accuracy': v['accuracy']} for k, v in results.items()},
                'best_model': best_model_name,
                'best_accuracy': results[best_model_name]['accuracy']
            }
            
        except Exception as e:
            logger.error(f"Classification training failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

class TextAnalytics:
    """Comprehensive text analytics."""
    
    @staticmethod
    def analyze_text_statistics(documents: List[str]) -> Dict[str, Any]:
        """Analyze basic text statistics."""
        stats = {
            'document_count': len(documents),
            'total_characters': 0,
            'total_words': 0,
            'total_sentences': 0,
            'avg_chars_per_doc': 0,
            'avg_words_per_doc': 0,
            'avg_sentences_per_doc': 0,
            'vocabulary_size': 0,
            'most_common_words': []
        }
        
        all_words = []
        
        for doc in documents:
            if isinstance(doc, str):
                # Character count
                stats['total_characters'] += len(doc)
                
                # Word count
                words = word_tokenize(doc.lower())
                words = [w for w in words if w.isalpha()]  # Only alphabetic words
                stats['total_words'] += len(words)
                all_words.extend(words)
                
                # Sentence count
                sentences = sent_tokenize(doc)
                stats['total_sentences'] += len(sentences)
        
        # Calculate averages
        if stats['document_count'] > 0:
            stats['avg_chars_per_doc'] = stats['total_characters'] / stats['document_count']
            stats['avg_words_per_doc'] = stats['total_words'] / stats['document_count']
            stats['avg_sentences_per_doc'] = stats['total_sentences'] / stats['document_count']
        
        # Vocabulary analysis
        word_counts = Counter(all_words)
        stats['vocabulary_size'] = len(word_counts)
        stats['most_common_words'] = [{'word': word, 'count': count} for word, count in word_counts.most_common(20)]
        
        return stats

class NLPWorkflow:
    """Main workflow orchestrator for NLP analysis."""
    
    def __init__(self, config: NLPConfig = None):
        self.config = config or NLPConfig()
        self.preprocessor = TextPreprocessor(self.config)
        self.sentiment_analyzer = SentimentAnalyzer()
        self.topic_modeler = TopicModeler(self.config)
        self.ner = NamedEntityRecognizer()
        self.classifier = TextClassifier(self.config)
        self.analytics = TextAnalytics()
        self.results = {}

    def validate_data(self, data: pd.DataFrame, text_column: Optional[str] = None) -> Dict[str, Any]:
        """Validate NLP dataset and determine text column.

        If text_column is not provided, attempt to infer a suitable column by
        selecting the first object/category column. Returns a validation summary
        including the resolved text column or an error with guidance.
        """
        validation = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'recommendations': []
        }

        if data is None or data.empty:
            validation['is_valid'] = False
            validation['errors'].append('Dataset is empty')
            return {
                'validation': validation,
                'summary': {'shape': (0, 0), 'text_column': None}
            }

        # Resolve text column if not provided
        resolved_text_col = text_column
        if not resolved_text_col:
            candidate_cols = data.select_dtypes(include=['object', 'string', 'category']).columns.tolist()
            if candidate_cols:
                resolved_text_col = candidate_cols[0]
                validation['warnings'].append(
                    f"text_column not provided; inferred '{resolved_text_col}'"
                )
            else:
                validation['is_valid'] = False
                validation['errors'].append('No text-like column found. Please select a text column.')

        summary = {
            'shape': data.shape,
            'columns': data.columns.tolist(),
            'text_column': resolved_text_col,
            'missing_values': {k: int(v) for k, v in data.isnull().sum().to_dict().items()},
            'dtypes': {str(k): str(v) for k, v in data.dtypes.to_dict().items()}
        }

        return {
            'validation': validation,
            'summary': summary
        }
    
    def validate_data(self, data: pd.DataFrame, text_column: str) -> Dict[str, Any]:
        """Validate data for NLP analysis."""
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
        
        if text_column not in data.columns:
            validation_results['errors'].append(f"Text column '{text_column}' not found")
            validation_results['is_valid'] = False
            return validation_results
        
        # Check text column
        text_series = data[text_column].dropna()
        if len(text_series) == 0:
            validation_results['errors'].append("No valid text data found")
            validation_results['is_valid'] = False
        
        # Check for minimum text content
        avg_length = text_series.astype(str).str.len().mean()
        if avg_length < 10:
            validation_results['warnings'].append("Very short average text length - results may be limited")
        
        if len(text_series) < 10:
            validation_results['warnings'].append("Small dataset - consider gathering more text samples")
        
        return {
            'validation': validation_results,
            'summary': {
                'total_documents': len(data),
                'valid_text_documents': len(text_series),
                'average_text_length': float(avg_length),
                'text_column': text_column
            }
        }
    
    def analyze_text(self, documents: List[str]) -> Dict[str, Any]:
        """Perform comprehensive text analysis."""
        try:
            results = {}
            
            # Basic text statistics
            text_stats = self.analytics.analyze_text_statistics(documents)
            results['text_statistics'] = text_stats
            
            # Preprocess documents
            processed_docs = self.preprocessor.preprocess_documents(documents)
            results['preprocessing_complete'] = True
            
            # Sentiment analysis
            if self.config.sentiment_analysis:
                sentiment_results = self.sentiment_analyzer.analyze_documents(documents)
                results['sentiment_analysis'] = sentiment_results
            
            # Topic modeling
            if self.config.topic_modeling and len(processed_docs) >= self.config.n_topics:
                topic_results = self.topic_modeler.fit_topic_model(processed_docs)
                results['topic_modeling'] = topic_results
            
            # Named Entity Recognition
            if self.config.named_entity_recognition:
                ner_results = self.ner.extract_entities_batch(documents)
                results['named_entity_recognition'] = ner_results
            
            self.results = results
            
            return {
                'success': True,
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Text analysis failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_insights(self) -> Dict[str, Any]:
        """Generate insights from NLP analysis."""
        try:
            if not self.results:
                return {
                    'success': False,
                    'error': 'No analysis results available'
                }
            
            insights = {
                'text_insights': [],
                'sentiment_insights': [],
                'topic_insights': [],
                'entity_insights': [],
                'recommendations': []
            }
            
            # Text statistics insights
            if 'text_statistics' in self.results:
                stats = self.results['text_statistics']
                if stats['avg_words_per_doc'] < 20:
                    insights['text_insights'].append("Short documents detected - consider combining or collecting longer texts")
                if stats['vocabulary_size'] > 10000:
                    insights['text_insights'].append("Large vocabulary detected - good for comprehensive analysis")
            
            # Sentiment insights
            if 'sentiment_analysis' in self.results:
                sentiment_dist = self.results['sentiment_analysis']['summary']['sentiment_distribution']
                total_docs = sentiment_dist['positive'] + sentiment_dist['negative'] + sentiment_dist['neutral']
                
                if sentiment_dist['positive'] / total_docs > 0.6:
                    insights['sentiment_insights'].append("Predominantly positive sentiment detected")
                elif sentiment_dist['negative'] / total_docs > 0.6:
                    insights['sentiment_insights'].append("Predominantly negative sentiment detected")
                else:
                    insights['sentiment_insights'].append("Balanced sentiment distribution")
            
            # Topic insights
            if 'topic_modeling' in self.results and self.results['topic_modeling']['success']:
                topics = self.results['topic_modeling']['topics']
                insights['topic_insights'].append(f"Identified {len(topics)} distinct topics in the text collection")
            
            # Entity insights
            if 'named_entity_recognition' in self.results:
                entity_counts = self.results['named_entity_recognition']['entity_type_counts']
                if entity_counts:
                    most_common_entity_type = max(entity_counts.keys(), key=lambda k: entity_counts[k])
                    insights['entity_insights'].append(f"Most common entity type: {most_common_entity_type}")
            
            return {
                'success': True,
                'insights': insights
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
