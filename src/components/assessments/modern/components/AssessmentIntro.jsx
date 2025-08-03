import React from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import './AssessmentIntro.css';

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

    </motion.div>
  );
};

export default AssessmentIntro;