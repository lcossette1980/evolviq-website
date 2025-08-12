import React, { useState, useEffect } from 'react';
import { Brain, Building2, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../services/firebase';
import { buildUrl } from '../../config/apiConfig';
import { Card } from '../ui';

const ProfileCard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Not authenticated');
        }

        const token = await currentUser.getIdToken();
        const response = await fetch(buildUrl('/api/assessments/profile'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Request failed');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <Card className="w-full">
        <Card.Body className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="w-full">
        <Card.Body className="p-6">
          <p className="text-gray-500">Unable to load profile data</p>
        </Card.Body>
      </Card>
    );
  }

  const { ai_knowledge, org_readiness, unified_insights } = profile;

  return (
    <Card className="w-full">
      <Card.Header>
        <div className="flex items-center gap-2 text-base font-semibold">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>AI Capability Profile</span>
        </div>
      </Card.Header>
      <Card.Body className="space-y-6">
        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Capability Level</span>
              <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700">
                {unified_insights?.capability_level || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Readiness Stage</span>
              <span className="px-2 py-0.5 text-xs rounded border border-gray-200 text-gray-700">
                {unified_insights?.readiness_stage || 'N/A'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Alignment Score</span>
              <span className="text-lg font-semibold">{unified_insights?.alignment_score || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${unified_insights?.alignment_score || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Knowledge Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4" />
            AI Knowledge
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Overall Score</span>
                <span className="text-sm font-medium">{ai_knowledge?.overall_score || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded">
                <div
                  className="h-1.5 bg-blue-600 rounded"
                  style={{ width: `${ai_knowledge?.overall_score || 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span className={`px-2 py-0.5 text-xs rounded ${
                ai_knowledge?.level === 'Advanced'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {ai_knowledge?.level || 'N/A'}
              </span>
            </div>
          </div>
          {ai_knowledge?.categories && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(ai_knowledge.categories).slice(0, 4).map(([cat, data]) => (
                <div key={cat} className="text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 truncate">{cat}</span>
                    <span className="font-medium">{data.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Org Readiness Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4" />
            Organizational Readiness
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600">Overall Score</span>
                <span className="text-sm font-medium">{org_readiness?.overall_score || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded">
                <div
                  className="h-1.5 bg-blue-600 rounded"
                  style={{ width: `${org_readiness?.overall_score || 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                {org_readiness?.maturity_level || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {unified_insights?.recommendations && unified_insights.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4" />
              Top Recommendations
            </div>
            <div className="space-y-2">
              {unified_insights.recommendations.slice(0, 2).map((rec, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{rec.area}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{rec.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {unified_insights?.next_steps && unified_insights.next_steps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              Next Steps
            </div>
            <ul className="space-y-1">
              {unified_insights.next_steps.slice(0, 3).map((step, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;
