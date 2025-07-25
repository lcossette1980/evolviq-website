import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { colors } from '../../../../utils/colors';

/**
 * Modern Assessment Intro Component
 * Engaging introduction that explains the conversational approach
 */
const AssessmentIntro = ({ onStartAssessment, assessmentType, isLoading }) => {
  const getAssessmentConfig = (type) => {
    const configs = {
      ai_knowledge: {
        title: "AI Knowledge Navigator",
        subtitle: "Discover your AI expertise through conversation",
        description: "Have a natural conversation with our AI expert to understand your current knowledge level and identify growth opportunities.",
        features: [
          "Conversational assessment experience",
          "Personalized questions based on your responses", 
          "Real-time analysis and insights",
          "Customized learning recommendations"
        ],
        estimatedTime: "10-15 minutes",
        agent: {
          name: "Alex Chen",
          role: "AI Knowledge Expert",
          specialty: "Machine Learning & AI Applications"
        }
      },
      change_readiness: {
        title: "Change Readiness Assessment", 
        subtitle: "Evaluate your organization's transformation potential",
        description: "Engage in a guided discussion about your organization's readiness for AI-driven change and transformation.",
        features: [
          "Interactive organizational assessment",
          "Leadership and culture evaluation",
          "Change management insights",
          "Strategic implementation roadmap"
        ],
        estimatedTime: "15-20 minutes",
        agent: {
          name: "Morgan Taylor",
          role: "Change Management Expert", 
          specialty: "Organizational Transformation"
        }
      }
    };
    
    return configs[type] || configs.ai_knowledge;
  };

  const config = getAssessmentConfig(assessmentType);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const featureVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="assessment-intro"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="intro-header">
        <motion.div 
          className="hero-icon"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
        >
          <Brain className="w-12 h-12" />
        </motion.div>
        
        <motion.h1 
          className="intro-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {config.title}
        </motion.h1>
        
        <motion.p 
          className="intro-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {config.subtitle}
        </motion.p>
      </div>

      <motion.div 
        className="intro-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="description-section">
          <p className="intro-description">
            {config.description}
          </p>

          <div className="agent-preview">
            <div className="agent-avatar">
              <Brain className="w-6 h-6" />
            </div>
            <div className="agent-info">
              <h4 className="agent-name">{config.agent.name}</h4>
              <p className="agent-role">{config.agent.role}</p>
              <p className="agent-specialty">{config.agent.specialty}</p>
            </div>
          </div>
        </div>

        <div className="features-section">
          <h3 className="features-title">What to expect:</h3>
          <div className="features-list">
            {config.features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-item"
                variants={featureVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <div className="feature-icon">
                  {index === 0 && <MessageSquare className="w-5 h-5" />}
                  {index === 1 && <Zap className="w-5 h-5" />}
                  {index === 2 && <TrendingUp className="w-5 h-5" />}
                  {index === 3 && <Brain className="w-5 h-5" />}
                </div>
                <span className="feature-text">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="action-section">
          <div className="time-estimate">
            <span className="time-icon">⏱️</span>
            <span>Estimated time: {config.estimatedTime}</span>
          </div>

          <motion.button
            className="start-button"
            onClick={onStartAssessment}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                Preparing your assessment...
              </>
            ) : (
              <>
                Start Conversation
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <style jsx>{`
        .assessment-intro {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 24px;
          text-align: center;
        }

        .intro-header {
          margin-bottom: 40px;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${colors.chestnut} 0%, #c55a4f 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 32px rgba(164, 74, 63, 0.3);
        }

        .intro-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: ${colors.charcoal};
          margin: 0 0 12px;
          line-height: 1.2;
        }

        .intro-subtitle {
          font-size: 1.25rem;
          color: ${colors.khaki};
          margin: 0;
          font-weight: 400;
        }

        .intro-content {
          text-align: left;
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid ${colors.pearl};
        }

        .description-section {
          margin-bottom: 32px;
        }

        .intro-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: ${colors.charcoal};
          margin: 0 0 24px;
        }

        .agent-preview {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: ${colors.bone};
          border-radius: 12px;
          border-left: 4px solid ${colors.chestnut};
        }

        .agent-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${colors.chestnut};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .agent-info {
          flex: 1;
        }

        .agent-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 600;
          color: ${colors.charcoal};
          margin: 0 0 4px;
        }

        .agent-role {
          font-size: 0.9rem;
          color: ${colors.khaki};
          font-weight: 500;
          margin: 0 0 2px;
        }

        .agent-specialty {
          font-size: 0.85rem;
          color: ${colors.khaki};
          opacity: 0.8;
          margin: 0;
        }

        .features-section {
          margin-bottom: 32px;
        }

        .features-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${colors.charcoal};
          margin: 0 0 16px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: ${colors.pearl};
          color: ${colors.chestnut};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-text {
          color: ${colors.charcoal};
          font-weight: 500;
        }

        .action-section {
          text-align: center;
        }

        .time-estimate {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          color: ${colors.khaki};
        }

        .start-button {
          background: linear-gradient(135deg, ${colors.chestnut} 0%, #c55a4f 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 auto;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(164, 74, 63, 0.3);
          min-width: 200px;
        }

        .start-button:hover:not(:disabled) {
          box-shadow: 0 6px 24px rgba(164, 74, 63, 0.4);
          transform: translateY(-2px);
        }

        .start-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .assessment-intro {
            padding: 24px 16px;
          }

          .intro-title {
            font-size: 2rem;
          }

          .intro-subtitle {
            font-size: 1.125rem;
          }

          .intro-content {
            padding: 24px;
          }

          .agent-preview {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .features-list {
            gap: 8px;
          }

          .feature-item {
            padding: 8px 0;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AssessmentIntro;