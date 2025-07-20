import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Circle, Download, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import guidesAPI from '../../services/guidesAPI';

const GuideTemplate = ({ 
  guideId, 
  title, 
  description, 
  tabs, 
  renderContent, 
  initialFormData = {},
  initialExpandedSections = []
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'overview');
  const [completedSections, setCompletedSections] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(initialExpandedSections));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load user progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const progress = await guidesAPI.getUserProgress(user.uid, guideId);
        
        if (progress.completedSections) {
          setCompletedSections(new Set(progress.completedSections));
        }
        
        if (progress.formData) {
          setFormData(prev => ({ ...prev, ...progress.formData }));
        }

        // Log guide access
        await guidesAPI.logGuideAccess(user.uid, guideId, 'view');
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user, guideId]);

  // Save progress when form data changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!user || isLoading || isSaving) return;
      
      try {
        setIsSaving(true);
        await guidesAPI.updateUserProgress(user.uid, guideId, {
          formData,
          completedSections: Array.from(completedSections)
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const debounceTimer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(debounceTimer);
  }, [formData, completedSections, user, guideId, isLoading, isSaving]);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const markSectionComplete = async (section) => {
    const newCompleted = new Set(completedSections);
    if (newCompleted.has(section)) {
      newCompleted.delete(section);
      try {
        await guidesAPI.markSectionIncomplete(user.uid, guideId, section);
      } catch (error) {
        console.error('Error marking section incomplete:', error);
      }
    } else {
      newCompleted.add(section);
      try {
        await guidesAPI.markSectionComplete(user.uid, guideId, section);
      } catch (error) {
        console.error('Error marking section complete:', error);
      }
    }
    setCompletedSections(newCompleted);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addArrayItem = (section, item) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), item]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const guideHelpers = {
    formData,
    setFormData,
    updateFormData,
    updateNestedFormData,
    addArrayItem,
    removeArrayItem,
    completedSections,
    markSectionComplete,
    expandedSections,
    toggleSection,
    user,
    guideId
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F2EA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#A44A3F' }}></div>
          <p className="text-gray-600">Loading your guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2EA' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#2A2A2A', fontFamily: 'Playfair Display' }}>
                {title}
              </h1>
              <p className="text-gray-600 mt-2">{description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSaving}
                onClick={async () => {
                  if (!user) return;
                  try {
                    setIsSaving(true);
                    await guidesAPI.updateUserProgress(user.uid, guideId, {
                      formData,
                      completedSections: Array.from(completedSections)
                    });
                  } catch (error) {
                    console.error('Error saving progress:', error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#A44A3F' }}
                onClick={async () => {
                  if (!user) return;
                  try {
                    const exportData = await guidesAPI.generateGuideExport(user.uid, guideId, 'pdf');
                    console.log('Export data:', exportData);
                    // Handle export download
                  } catch (error) {
                    console.error('Error exporting guide:', error);
                  }
                }}
              >
                <Download size={16} />
                <span>Export Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold mb-4">Guide Sections</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isCompleted = completedSections.has(tab.id);
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#A44A3F' : 'transparent'
                      }}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{tab.label}</span>
                      {isCompleted && (
                        <CheckCircle 
                          size={16} 
                          className={isActive ? 'text-white' : 'text-green-600'} 
                        />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(completedSections.size / tabs.length) * 100}%`,
                        backgroundColor: '#A44A3F'
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round((completedSections.size / tabs.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {renderContent(activeTab, guideHelpers)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideTemplate;