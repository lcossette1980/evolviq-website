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

      <style jsx>{`
        .assessment-results {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .results-header {
          text-align: center;
          background: white;
          border-radius: 20px;
          padding: 40px 32px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .trophy-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);
        }

        .results-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.25rem;
          font-weight: 700;
          color: ${colors.charcoal};
          margin: 0 0 8px;
        }

        .results-subtitle {
          font-size: 1.125rem;
          color: ${colors.khaki};
          margin: 0 0 32px;
        }

        .overall-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.chestnut} 0%, #c55a4f 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(164, 74, 63, 0.3);
        }

        .score-number {
          font-size: 2rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .maturity-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: ${colors.bone};
          border-radius: 20px;
          border: 1px solid ${colors.pearl};
        }

        .maturity-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .maturity-text {
          font-weight: 600;
          color: ${colors.charcoal};
        }

        .scores-section,
        .insights-section,
        .concepts-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: ${colors.charcoal};
          margin: 0 0 24px;
          text-align: center;
        }

        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .score-card {
          padding: 20px;
          background: ${colors.bone};
          border-radius: 12px;
          border: 1px solid ${colors.pearl};
        }

        .score-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .area-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: ${colors.charcoal};
          margin: 0;
        }

        .area-score {
          font-size: 1.25rem;
          font-weight: 700;
          color: ${colors.chestnut};
        }

        .score-bar {
          height: 6px;
          background: rgba(42, 42, 42, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          border-radius: 3px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .insight-card {
          padding: 24px;
          border-radius: 12px;
          border: 2px solid;
        }

        .insight-card.strengths {
          background: #f0fdf4;
          border-color: #22c55e;
        }

        .insight-card.growth {
          background: #fef3c7;
          border-color: #f59e0b;
        }

        .insight-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .insight-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: ${colors.charcoal};
          margin: 0;
        }

        .strengths .insight-header {
          color: #22c55e;
        }

        .growth .insight-header {
          color: #f59e0b;
        }

        .insight-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .insight-list li {
          padding: 8px 0;
          color: ${colors.charcoal};
          position: relative;
          padding-left: 20px;
        }

        .insight-list li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: inherit;
          font-weight: bold;
        }

        .concepts-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }

        .concept-tag {
          padding: 8px 16px;
          background: ${colors.pearl};
          color: ${colors.charcoal};
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid ${colors.khaki};
        }

        .actions-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .actions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background: linear-gradient(135deg, ${colors.chestnut} 0%, #c55a4f 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(164, 74, 63, 0.3);
        }

        .action-button.secondary {
          background: ${colors.khaki};
          color: white;
          box-shadow: 0 4px 16px rgba(165, 158, 140, 0.3);
        }

        .action-button.tertiary {
          background: ${colors.pearl};
          color: ${colors.charcoal};
          border: 1px solid ${colors.khaki};
        }

        .action-button:hover {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .assessment-results {
            padding: 24px 16px;
          }

          .results-header {
            padding: 32px 24px;
          }

          .results-title {
            font-size: 1.875rem;
          }

          .scores-section,
          .insights-section,
          .concepts-section,
          .actions-section {
            padding: 24px;
          }

          .scores-grid,
          .insights-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            flex-direction: column;
          }

          .action-button {
            justify-content: center;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AssessmentResults;