import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  Circle,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useDashboardStore } from '../../../store/dashboardStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { colors } from '../../../utils/colors';

/**
 * Learning Plan Tab Component
 * Displays personalized learning plan generated from assessment results
 */
const LearningPlanTab = () => {
  const { user } = useAuth();
  const { userAssessments } = useDashboardStore();
  const [learningPlan, setLearningPlan] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLearningPlan();
    }
  }, [user, userAssessments]);

  const loadLearningPlan = async () => {
    try {
      setLoading(true);
      
      // Check if user has completed assessments
      const completedAssessments = userAssessments.filter(a => a.isComplete);
      
      if (completedAssessments.length === 0) {
        setLearningPlan(null);
        setLoading(false);
        return;
      }

      // Load learning plan from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.learningPlan) {
        setLearningPlan(userData.learningPlan);
        setProgress(userData.learningPlanProgress || {});
      } else {
        // Generate learning plan from latest assessment
        const latestAssessment = completedAssessments.sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        )[0];
        
        if (latestAssessment.learningPlan) {
          setLearningPlan(latestAssessment.learningPlan);
          // Save to user document
          await updateDoc(doc(db, 'users', user.uid), {
            learningPlan: latestAssessment.learningPlan,
            learningPlanProgress: {}
          });
        }
      }
    } catch (error) {
      console.error('Error loading learning plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemComplete = async (itemId) => {
    const newProgress = {
      ...progress,
      [itemId]: !progress[itemId]
    };
    
    setProgress(newProgress);
    
    // Save progress to Firestore
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        learningPlanProgress: newProgress
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const calculateOverallProgress = () => {
    if (!learningPlan?.basicRecommendations) return 0;
    const total = learningPlan.basicRecommendations.length;
    const completed = Object.values(progress).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chestnut"></div>
      </div>
    );
  }

  if (!learningPlan) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-charcoal mb-2">
          No Learning Plan Yet
        </h3>
        <p className="text-charcoal/70 mb-6">
          Complete an assessment to generate your personalized learning plan
        </p>
        <button
          onClick={() => window.location.href = '/tools/ai-knowledge-navigator'}
          className="bg-chestnut text-white px-6 py-2 rounded-lg font-medium hover:bg-chestnut/90"
        >
          Take AI Knowledge Assessment
        </button>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const phases = learningPlan.progressTracking?.phases || [];

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              Your AI Learning Journey
            </h2>
            <p className="text-charcoal/70">
              Personalized plan based on your assessment results
            </p>
          </div>
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#F5F5F5"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={colors.chestnut}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(overallProgress / 100) * 251} 251`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-charcoal">{overallProgress}%</span>
              </div>
            </div>
            <p className="text-sm text-charcoal/60 mt-2">Overall Progress</p>
          </div>
        </div>

        {/* Learning Phases */}
        {phases.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-charcoal mb-4">Learning Phases</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {phases.map((phase, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    phase.status === 'recommended' ? 'border-chestnut bg-chestnut/5' :
                    phase.status === 'upcoming' ? 'border-gray-300 bg-gray-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-charcoal">{phase.name}</h4>
                    {phase.status === 'recommended' && (
                      <span className="text-xs bg-chestnut text-white px-2 py-0.5 rounded-full">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal/60">Duration: {phase.duration}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-charcoal/60 mt-4">
              <Calendar className="w-4 h-4 inline mr-1" />
              Estimated completion: {learningPlan.progressTracking?.estimatedCompletion || '3-4 months'}
            </p>
          </div>
        )}
      </div>

      {/* Learning Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">
          Recommended Learning Steps
        </h3>
        
        <div className="space-y-4">
          {learningPlan.basicRecommendations?.map((item, idx) => {
            const itemId = `rec_${idx}`;
            const isCompleted = progress[itemId];
            
            return (
              <div 
                key={idx}
                className={`border rounded-lg p-4 transition-all ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <button
                    onClick={() => toggleItemComplete(itemId)}
                    className="mt-1 mr-3 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-chestnut" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium mb-1 ${
                      isCompleted ? 'text-green-800 line-through' : 'text-charcoal'
                    }`}>
                      {item.title || `Learning Step ${idx + 1}`}
                    </h4>
                    <p className={`text-sm mb-2 ${
                      isCompleted ? 'text-green-700' : 'text-charcoal/70'
                    }`}>
                      {item.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs">
                      {item.priority && (
                        <span className={`px-2 py-1 rounded ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.priority.toUpperCase()} PRIORITY
                        </span>
                      )}
                      {item.estimatedTime && (
                        <span className="flex items-center text-charcoal/60">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.estimatedTime}
                        </span>
                      )}
                      {item.targetScore && (
                        <span className="flex items-center text-charcoal/60">
                          <Target className="w-3 h-3 mr-1" />
                          Target: {item.targetScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Section */}
      {overallProgress >= 25 && (
        <div className="bg-gradient-to-r from-chestnut/10 to-khaki/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                Great Progress!
              </h3>
              <p className="text-charcoal/70">
                You're {overallProgress}% through your learning journey. Keep it up!
              </p>
            </div>
            <Award className="w-12 h-12 text-chestnut" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanTab;