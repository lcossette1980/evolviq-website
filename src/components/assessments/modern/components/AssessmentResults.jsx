import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  BookOpen, 
  RefreshCw, 
  Home,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { colors } from '../../../../utils/colors';
import './AssessmentResults.css';

/**
 * Modern Assessment Results Component
 * Beautiful, engaging results display with smooth animations
 */
const AssessmentResults = ({ 
  results, 
  onRetakeAssessment, 
  onComplete, 
  onNavigateHome 
}) => {
  const getMaturityLevelText = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate', 
      4: 'Advanced',
      5: 'Expert'
    };
    return levels[level] || 'Intermediate';
  };

  const getMaturityLevelColor = (level) => {
    const colors = {
      1: '#ef4444',
      2: '#f97316',
      3: '#eab308',
      4: '#22c55e', 
      5: '#16a34a'
    };
    return colors[level] || '#eab308';
  };

  const containerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const scoreVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: "spring", delay: 0.3 }
  };

  return (
    <motion.div 
      className="assessment-results"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header with Overall Score */}
      <motion.div 
        className="results-header"
        variants={cardVariants}
        transition={{ delay: 0.1 }}
      >
        <motion.div 
          className="trophy-icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
        >
          <Trophy className="w-8 h-8" />
        </motion.div>
        
        <h1 className="results-title">Assessment Complete!</h1>
        <p className="results-subtitle">
          Here's your personalized AI knowledge analysis
        </p>

        <motion.div 
          className="overall-score"
          variants={scoreVariants}
        >
          <div className="score-circle">
            <div className="score-number">{results.overallScore}%</div>
            <div className="score-label">Overall Score</div>
          </div>
          
          <div className="maturity-badge">
            <div 
              className="maturity-indicator"
              style={{ backgroundColor: getMaturityLevelColor(results.maturityLevel) }}
            />
            <span className="maturity-text">
              {getMaturityLevelText(results.maturityLevel)} Level
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* Detailed Scores */}
      <motion.div 
        className="scores-section"
        variants={cardVariants}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-title">Knowledge Areas</h2>
        <div className="scores-grid">
          {Object.entries(results.maturityScores || {}).map(([area, score], index) => (
            <motion.div
              key={area}
              className="score-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
            >
              <div className="score-header">
                <h3 className="area-name">
                  {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h3>
                <div className="area-score">{score}%</div>
              </div>
              
              <div className="score-bar">
                <motion.div
                  className="score-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + (index * 0.1) }}
                  style={{ backgroundColor: getMaturityLevelColor(Math.floor(score / 20) + 1) }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div 
        className="insights-section"
        variants={cardVariants}
        transition={{ delay: 0.3 }}
      >
        <h2 className="section-title">Your AI Journey Insights</h2>
        
        <div className="insights-grid">
          {/* Strengths */}
          <div className="insight-card strengths">
            <div className="insight-header">
              <CheckCircle className="w-6 h-6" />
              <h3>Key Strengths</h3>
            </div>
            <ul className="insight-list">
              {(results.basicInsights?.strengths || []).map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                >
                  {strength}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Growth Areas */}
          <div className="insight-card growth">
            <div className="insight-header">
              <Target className="w-6 h-6" />
              <h3>Growth Opportunities</h3>
            </div>
            <ul className="insight-list">
              {(results.basicInsights?.growthAreas || []).map((area, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1) }}
                >
                  {area}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Detected Concepts */}
      {results.conceptAnalysis?.detected_concepts && (
        <motion.div 
          className="concepts-section"
          variants={cardVariants}
          transition={{ delay: 0.4 }}
        >
          <h2 className="section-title">AI Concepts You Know</h2>
          <div className="concepts-cloud">
            {results.conceptAnalysis.detected_concepts.map((concept, index) => (
              <motion.span
                key={index}
                className="concept-tag"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + (index * 0.05) }}
              >
                {concept}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div 
        className="actions-section"
        variants={cardVariants}
        transition={{ delay: 0.5 }}
      >
        <div className="actions-grid">
          <motion.button
            className="action-button primary"
            onClick={onComplete}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="w-5 h-5" />
            View Learning Plan
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.button
            className="action-button secondary"
            onClick={onRetakeAssessment}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Retake Assessment
          </motion.button>

          <motion.button
            className="action-button tertiary"
            onClick={onNavigateHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </motion.button>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default AssessmentResults;