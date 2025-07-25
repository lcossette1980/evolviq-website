import React from 'react';
import { Brain, MessageSquare, Target, BookOpen, CheckCircle, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { Button, Card } from '../../ui';

const AssessmentIntro = ({ 
  colors, 
  maturityAreas, 
  onStartAssessment, 
  isLoading 
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <Card padding="large" className="text-center" style={{ backgroundColor: colors.pearl }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: colors.chestnut }}>
          <Brain className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 font-serif" style={{ color: colors.charcoal }}>
          AI Knowledge Navigator
        </h1>
        
        <p className="text-lg mb-6" style={{ color: colors.charcoal }}>
          Discover your AI knowledge level and get a personalized learning pathway
        </p>
        
        <div className="flex justify-center space-x-4">
          <div className="inline-block px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: colors.chestnut }}>
            Free Assessment
          </div>
          <div className="inline-block px-4 py-2 rounded text-sm font-medium" style={{ backgroundColor: colors.khaki, color: colors.charcoal }}>
            Premium Features Available
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card padding="large">
        <h2 className="text-2xl font-bold mb-6 text-center font-serif" style={{ color: colors.charcoal }}>
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.pearl }}>
              <MessageSquare className="w-8 h-8" style={{ color: colors.chestnut }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: colors.charcoal }}>Interactive Assessment</h3>
            <p className="text-sm" style={{ color: colors.khaki }}>Intelligent assessment across key AI areas with personalized analysis</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.pearl }}>
              <Target className="w-8 h-8" style={{ color: colors.chestnut }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: colors.charcoal }}>Knowledge Mapping</h3>
            <p className="text-sm" style={{ color: colors.khaki }}>Detailed insights into your strengths and areas for improvement</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.pearl }}>
              <BookOpen className="w-8 h-8" style={{ color: colors.chestnut }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: colors.charcoal }}>Personalized Learning</h3>
            <p className="text-sm" style={{ color: colors.khaki }}>Curated lessons and step-by-step learning plan tailored to your level</p>
          </div>
        </div>
      </Card>

      {/* Assessment Areas */}
      <Card padding="large">
        <h2 className="text-2xl font-bold mb-6 text-center font-serif" style={{ color: colors.charcoal }}>
          Assessment Areas
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {maturityAreas.map((area, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg" style={{ backgroundColor: colors.pearl }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <span className="text-sm font-bold text-white">{index + 1}</span>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal }}>{area.title}</h3>
                <p className="text-sm" style={{ color: colors.khaki }}>{area.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* What You Get */}
      <Card padding="large">
        <h2 className="text-2xl font-bold mb-6 text-center font-serif" style={{ color: colors.charcoal }}>
          What You Get
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6" style={{ borderColor: colors.khaki }}>
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 mr-3" style={{ color: colors.chestnut }} />
              <h3 className="font-bold text-lg" style={{ color: colors.charcoal }}>Free Assessment</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.chestnut }} />
                <span style={{ color: colors.charcoal }}>Complete AI knowledge assessment</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.chestnut }} />
                <span style={{ color: colors.charcoal }}>Overall maturity score</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.chestnut }} />
                <span style={{ color: colors.charcoal }}>Basic strengths and weaknesses</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.chestnut }} />
                <span style={{ color: colors.charcoal }}>General learning recommendations</span>
              </li>
            </ul>
          </div>
          <div className="border rounded-lg p-6 relative" style={{ borderColor: colors.khaki, backgroundColor: colors.bone }}>
            <div className="absolute top-4 right-4">
              <Star className="w-5 h-5" style={{ color: colors.khaki }} />
            </div>
            <div className="flex items-center mb-4">
              <Star className="w-6 h-6 mr-3" style={{ color: colors.khaki }} />
              <h3 className="font-bold text-lg" style={{ color: colors.charcoal }}>Premium Features</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Star className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.khaki }} />
                <span style={{ color: colors.charcoal }}>Detailed domain-specific scores</span>
              </li>
              <li className="flex items-start">
                <Star className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.khaki }} />
                <span style={{ color: colors.charcoal }}>Personalized learning pathway</span>
              </li>
              <li className="flex items-start">
                <Star className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.khaki }} />
                <span style={{ color: colors.charcoal }}>Curated lesson plans</span>
              </li>
              <li className="flex items-start">
                <Star className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" style={{ color: colors.khaki }} />
                <span style={{ color: colors.charcoal }}>Progress tracking and recommendations</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Start Button */}
      <div className="text-center">
        <Button
          variant="primary"
          size="large"
          onClick={onStartAssessment}
          disabled={isLoading}
          loading={isLoading}
          icon={isLoading ? RefreshCw : ArrowRight}
          iconPosition="right"
          className="font-serif"
        >
          {isLoading ? 'Starting Assessment...' : 'Start Assessment'}
        </Button>
        
        <div className="mt-4 text-sm" style={{ color: colors.khaki }}>
          Takes 10-15 minutes to complete
        </div>
      </div>
    </div>
  );
};

export default AssessmentIntro;