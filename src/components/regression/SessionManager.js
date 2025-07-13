import React, { useState, useEffect } from 'react';
import regressionAPI from '../../services/regressionAPI';
import { useAuth } from '../../contexts/AuthContext';

const SessionManager = ({ sessionId, onNewSession, isLoading }) => {
  const { user } = useAuth();
  const [userSessions, setUserSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showSessionsList, setShowSessionsList] = useState(false);

  useEffect(() => {
    if (user && showSessionsList) {
      loadUserSessions();
    }
  }, [user, showSessionsList]);

  const loadUserSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const sessions = await regressionAPI.getUserSessions(user.uid, 10);
      setUserSessions(sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId) => {
    try {
      // This would require implementing session restoration in the parent component
      // For now, we'll just close the list
      setShowSessionsList(false);
      console.log('Selected session:', selectedSessionId);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'models_trained': return 'text-green-600 bg-green-100';
      case 'data_preprocessed': return 'text-blue-600 bg-blue-100';
      case 'data_validated': return 'text-yellow-600 bg-yellow-100';
      case 'data_uploaded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'models_trained': return 'Complete';
      case 'data_preprocessed': return 'Preprocessed';
      case 'data_validated': return 'Validated';
      case 'data_uploaded': return 'Data Uploaded';
      case 'created': return 'Created';
      default: return 'Unknown';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-medium text-charcoal">Current Session</h3>
            <p className="text-sm text-charcoal/60">
              ID: {sessionId ? sessionId.slice(-8) : 'None'}
            </p>
          </div>
          
          {sessionId && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-charcoal/70">Active</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={() => setShowSessionsList(!showSessionsList)}
              className="text-charcoal/60 hover:text-charcoal transition-colors text-sm"
            >
              View Past Sessions
            </button>
          )}
          
          <button
            onClick={onNewSession}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-chestnut text-white hover:bg-chestnut/90'
            }`}
          >
            {isLoading ? 'Creating...' : 'New Session'}
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {showSessionsList && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-md font-medium text-charcoal mb-3">Recent Sessions</h4>
          
          {isLoadingSessions ? (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-chestnut border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-charcoal/60">Loading sessions...</p>
            </div>
          ) : userSessions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-charcoal/60">No previous sessions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSessionSelect(session.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-charcoal text-sm">
                        {session.name || 'Untitled Session'}
                      </h5>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(session.status)}`}>
                        {getStatusLabel(session.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-charcoal/60">
                      <span>Created: {formatDate(session.createdAt)}</span>
                      <span>Updated: {formatDate(session.updatedAt)}</span>
                      <span>ID: {session.id.slice(-8)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {session.hasData && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="Has data"></div>
                    )}
                    {session.isProcessed && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Processed"></div>
                    )}
                    {session.isTrained && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Trained"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionManager;