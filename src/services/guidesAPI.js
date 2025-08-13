// Implementation Guides API Service with Firebase integration
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { buildUrl } from '../config/apiConfig';

class GuidesAPI {
  constructor() {
    this.guides = {
      'AIImplementationPlaybook': {
        id: 'AIImplementationPlaybook',
        title: 'AI Implementation Playbook',
        description: 'Comprehensive guide to implementing AI in your organization',
        premium: true,
        estimatedTime: '2-4 hours',
        sections: ['overview', 'assessment', 'planning', 'framework', 'leadership', 'roadmap']
      },
      'AIReadinessAssessment': {
        id: 'AIReadinessAssessment',
        title: 'AI Readiness Assessment',
        description: 'Evaluate your organization\'s AI readiness and capabilities',
        premium: true,
        estimatedTime: '1-2 hours',
        sections: ['current-state', 'capabilities', 'gaps', 'recommendations']
      },
      'AIUseCaseROIToolkit': {
        id: 'AIUseCaseROIToolkit',
        title: 'AI Use Case ROI Toolkit',
        description: 'Calculate and evaluate ROI for AI projects',
        premium: true,
        estimatedTime: '1-3 hours',
        sections: ['evaluation', 'metrics', 'calculator', 'reporting']
      },
      'AIStrategyStarterKit': {
        id: 'AIStrategyStarterKit',
        title: 'AI Strategy Starter Kit',
        description: 'Framework for developing AI strategy',
        premium: true,
        estimatedTime: '2-3 hours',
        sections: ['strategy', 'roadmap', 'governance', 'implementation']
      }
    };
  }

  // Backend registry (for mapping dimensions→sections and future agentic flows)
  async getRegistry() {
    try {
      const res = await fetch(buildUrl('/api/guides/registry'));
      if (!res.ok) throw new Error('Failed to load guide registry');
      const data = await res.json();
      return data.guides || [];
    } catch (e) {
      console.error('Guide registry fetch failed:', e);
      return [];
    }
  }

  // User Progress Management
  async createUserProgress(userId, guideId, initialData = {}) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      
      const progressData = {
        id: guideId,
        userId,
        guideTitle: this.guides[guideId]?.title || 'Unknown Guide',
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        completedSections: [],
        formData: {},
        isCompleted: false,
        completionPercentage: 0,
        timeSpent: 0,
        ...initialData
      };

      await setDoc(progressRef, progressData);
      return progressData;
    } catch (error) {
      console.error('Error creating user progress:', error);
      throw error;
    }
  }

  async getUserProgress(userId, guideId) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        return { id: progressSnap.id, ...progressSnap.data() };
      } else {
        // Create new progress record
        return await this.createUserProgress(userId, guideId);
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(userId, guideId, updateData) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      
      const updates = {
        ...updateData,
        lastAccessedAt: serverTimestamp()
      };

      // Calculate completion percentage if sections are provided
      if (updateData.completedSections && this.guides[guideId]?.sections) {
        const totalSections = this.guides[guideId].sections.length;
        const completedCount = updateData.completedSections.length;
        updates.completionPercentage = Math.round((completedCount / totalSections) * 100);
        updates.isCompleted = completedCount === totalSections;
      }

      await updateDoc(progressRef, updates);
      return updates;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  async getUserGuides(userId, limitCount = 10) {
    try {
      const progressRef = collection(db, 'guideProgress', userId, 'guides');
      const q = query(
        progressRef,
        orderBy('lastAccessedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user guides:', error);
      throw error;
    }
  }

  // Access History Management
  async logGuideAccess(userId, guideId, accessType = 'view') {
    try {
      const sessionId = `${guideId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const accessRef = doc(db, 'guideAccessHistory', userId, 'sessions', sessionId);
      
      await setDoc(accessRef, {
        id: sessionId,
        userId,
        guideId,
        guideTitle: this.guides[guideId]?.title || 'Unknown Guide',
        accessType, // 'view', 'start', 'complete', 'download'
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });

      return sessionId;
    } catch (error) {
      console.error('Error logging guide access:', error);
      throw error;
    }
  }

  async getAccessHistory(userId, guideId = null, limitCount = 20) {
    try {
      const accessRef = collection(db, 'guideAccessHistory', userId, 'sessions');
      let q;
      
      if (guideId) {
        q = query(
          accessRef,
          where('guideId', '==', guideId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          accessRef,
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting access history:', error);
      throw error;
    }
  }

  // Form Data Management
  async saveFormData(userId, guideId, sectionId, formData) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      
      await updateDoc(progressRef, {
        [`formData.${sectionId}`]: formData,
        lastAccessedAt: serverTimestamp()
      });

      return formData;
    } catch (error) {
      console.error('Error saving form data:', error);
      throw error;
    }
  }

  async getFormData(userId, guideId, sectionId = null) {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      
      if (sectionId) {
        return progress.formData?.[sectionId] || {};
      } else {
        return progress.formData || {};
      }
    } catch (error) {
      console.error('Error getting form data:', error);
      throw error;
    }
  }

  // Section Completion Management
  async markSectionComplete(userId, guideId, sectionId) {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      const completedSections = progress.completedSections || [];
      
      if (!completedSections.includes(sectionId)) {
        completedSections.push(sectionId);
        
        await this.updateUserProgress(userId, guideId, {
          completedSections
        });

        // Log completion
        await this.logGuideAccess(userId, guideId, 'section_complete');
      }

      return completedSections;
    } catch (error) {
      console.error('Error marking section complete:', error);
      throw error;
    }
  }

  async markSectionIncomplete(userId, guideId, sectionId) {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      const completedSections = progress.completedSections || [];
      
      const updatedSections = completedSections.filter(id => id !== sectionId);
      
      await this.updateUserProgress(userId, guideId, {
        completedSections: updatedSections
      });

      return updatedSections;
    } catch (error) {
      console.error('Error marking section incomplete:', error);
      throw error;
    }
  }

  // Export and Download Management
  async generateGuideExport(userId, guideId, format = 'pdf') {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      
      // Log export
      await this.logGuideAccess(userId, guideId, 'export');

      // Generate and download the export file
      const guide = this.guides[guideId];
      const exportContent = this.formatExportContent(guide, progress, format);
      this.downloadFile(exportContent, `${guide.title.replace(/\s+/g, '_')}_Export.${format}`, format);
      
      return {
        guideId,
        userId,
        exportFormat: format,
        generatedAt: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error('Error generating guide export:', error);
      throw error;
    }
  }

  formatExportContent(guide, progress, format) {
    const formData = progress.formData || {};
    const completedSections = progress.completedSections || [];
    const timestamp = new Date().toLocaleDateString();
    
    if (format === 'json') {
      return JSON.stringify({
        guide: {
          id: guide.id,
          title: guide.title,
          description: guide.description,
          exportedAt: timestamp
        },
        progress: {
          completedSections,
          completionPercentage: Math.round((completedSections.length / (guide.sections?.length || 5)) * 100)
        },
        formData
      }, null, 2);
    }
    
    // Default to HTML format
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${guide.title} - Export</title>
    <style>
        body {
            font-family: 'Lato', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2A2A2A;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #F5F2EA;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            font-family: 'Playfair Display', serif;
            color: #A44A3F;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        h2 {
            font-family: 'Playfair Display', serif;
            color: #2A2A2A;
            border-bottom: 2px solid #A44A3F;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        h3 {
            color: #A44A3F;
            margin-top: 25px;
        }
        .progress-bar {
            background: #D7CEB2;
            height: 10px;
            border-radius: 5px;
            margin: 20px 0;
            overflow: hidden;
        }
        .progress-fill {
            background: #A44A3F;
            height: 100%;
        }
        .section {
            background: white;
            margin: 20px 0;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .completed {
            border-left: 4px solid #A44A3F;
        }
        .field {
            margin: 15px 0;
        }
        .field-label {
            font-weight: bold;
            color: #2A2A2A;
            margin-bottom: 5px;
        }
        .field-value {
            background: #F5F2EA;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #A59E8C;
            white-space: pre-wrap;
        }
        .export-info {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #D7CEB2;
            border-radius: 10px;
            font-size: 0.9em;
            color: #2A2A2A;
        }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${guide.title}</h1>
        <p>${guide.description}</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.round((completedSections.length / (guide.sections?.length || 5)) * 100)}%"></div>
        </div>
        <p>Progress: ${completedSections.length} of ${guide.sections?.length || 5} sections completed (${Math.round((completedSections.length / (guide.sections?.length || 5)) * 100)}%)</p>
    </div>`;

    // Add form data sections
    Object.entries(formData).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim()) {
        html += `
    <div class="section ${completedSections.includes(key) ? 'completed' : ''}">
        <h3>${this.formatFieldName(key)}</h3>
        <div class="field">
            <div class="field-value">${this.formatFieldValue(value)}</div>
        </div>
    </div>`;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        html += `
    <div class="section ${completedSections.includes(key) ? 'completed' : ''}">
        <h2>${this.formatFieldName(key)}</h2>`;
        
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue && typeof subValue === 'string' && subValue.trim()) {
            html += `
        <div class="field">
            <div class="field-label">${this.formatFieldName(subKey)}</div>
            <div class="field-value">${this.formatFieldValue(subValue)}</div>
        </div>`;
          }
        });
        html += `
    </div>`;
      } else if (Array.isArray(value) && value.length > 0) {
        html += `
    <div class="section ${completedSections.includes(key) ? 'completed' : ''}">
        <h2>${this.formatFieldName(key)}</h2>
        <ul>`;
        value.forEach(item => {
          if (typeof item === 'string' && item.trim()) {
            html += `<li>${this.formatFieldValue(item)}</li>`;
          } else if (typeof item === 'object' && item) {
            html += `<li>`;
            Object.entries(item).forEach(([itemKey, itemValue]) => {
              if (itemValue && typeof itemValue === 'string' && itemValue.trim()) {
                html += `<strong>${this.formatFieldName(itemKey)}:</strong> ${this.formatFieldValue(itemValue)}<br>`;
              }
            });
            html += `</li>`;
          }
        });
        html += `</ul>
    </div>`;
      }
    });

    html += `
    <div class="export-info">
        <p><strong>Exported on:</strong> ${timestamp}</p>
        <p><strong>Generated by:</strong> EvolvIQ AI Implementation Platform</p>
        <p>Visit <a href="https://evolviq.ai" style="color: #A44A3F;">evolviq.ai</a> to continue your AI journey</p>
    </div>
</body>
</html>`;

    return html;
  }

  formatFieldName(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  formatFieldValue(value) {
    if (typeof value !== 'string') return String(value);
    
    // Convert markdown-like formatting to HTML
    return value
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*?)$/gm, '• $1');
  }

  downloadFile(content, filename, format) {
    const mimeTypes = {
      'html': 'text/html',
      'json': 'application/json',
      'txt': 'text/plain'
    };
    
    const blob = new Blob([content], { type: mimeTypes[format] || 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // Real-time Progress Subscription
  subscribeToProgress(userId, guideId, callback) {
    const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
    
    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }

  // Utility Methods
  getGuideInfo(guideId) {
    return this.guides[guideId] || null;
  }

  getAllGuides() {
    return Object.values(this.guides);
  }

  async getGuidesSummary(userId) {
    try {
      const userGuides = await this.getUserGuides(userId);
      const allGuides = this.getAllGuides();
      
      return allGuides.map(guide => {
        const progress = userGuides.find(p => p.id === guide.id);
        
        return {
          ...guide,
          progress: progress ? {
            startedAt: progress.startedAt,
            lastAccessedAt: progress.lastAccessedAt,
            completionPercentage: progress.completionPercentage || 0,
            isCompleted: progress.isCompleted || false,
            timeSpent: progress.timeSpent || 0
          } : null
        };
      });
    } catch (error) {
      console.error('Error getting guides summary:', error);
      throw error;
    }
  }

  // =============================================================================
  // INTELLIGENT GUIDE RECOMMENDATIONS FROM CREWAI ASSESSMENTS  
  // =============================================================================

  /**
   * Generate intelligent guide recommendations based on CrewAI assessment results
   */
  async generateGuideRecommendations(userId, assessmentResults, assessmentType) {
    try {
      const recommendations = [];
      
      if (assessmentType === 'ai_knowledge_navigator') {
        recommendations.push(...this.getAIKnowledgeGuideRecommendations(assessmentResults));
      } else if (assessmentType === 'change_readiness') {
        recommendations.push(...this.getChangeReadinessGuideRecommendations(assessmentResults));
      }
      
      // Sort recommendations by priority and readiness match
      recommendations.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      });
      
      console.log(`🎯 Generated ${recommendations.length} guide recommendations for ${assessmentType}`);
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error generating guide recommendations:', error);
      return [];
    }
  }
  
  /**
   * AI Knowledge Navigator specific guide recommendations
   */
  getAIKnowledgeGuideRecommendations(results) {
    const recommendations = [];
    const maturityScores = results.maturity_scores || results.maturityScores || {};
    const overallScore = results.overall_score || results.overallScore || 3;
    const readinessLevel = results.overall_readiness_level || results.readinessLevel || 'ready_to_learn';
    
    // Strategy Starter Kit - for beginners and those needing strategic direction
    if (overallScore < 3.5 || readinessLevel.includes('foundation') || readinessLevel.includes('learn')) {
      recommendations.push({
        guideId: 'AIStrategyStarterKit',
        guide: this.guides.AIStrategyStarterKit,
        priority: 'high',
        reason: 'Your assessment indicates you would benefit from establishing a strategic foundation for AI initiatives.',
        matchScore: 95,
        expectedBenefits: [
          'Develop AI strategic vision',
          'Create implementation roadmap', 
          'Establish governance framework'
        ],
        recommendedSequence: 1
      });
    }
    
    // Readiness Assessment - for those ready to assess their organization
    if (overallScore >= 2.5 && (readinessLevel.includes('implement') || readinessLevel.includes('ready'))) {
      recommendations.push({
        guideId: 'AIReadinessAssessment',
        guide: this.guides.AIReadinessAssessment,
        priority: overallScore < 3.5 ? 'high' : 'medium',
        reason: 'Your knowledge level suggests you\'re ready to conduct a comprehensive organizational readiness assessment.',
        matchScore: 85,
        expectedBenefits: [
          'Evaluate organizational capabilities',
          'Identify implementation gaps',
          'Generate actionable recommendations'
        ],
        recommendedSequence: 2
      });
    }
    
    // Implementation Playbook - for those ready to implement
    if (overallScore >= 3.5 || readinessLevel.includes('implement') || readinessLevel.includes('lead')) {
      recommendations.push({
        guideId: 'AIImplementationPlaybook',
        guide: this.guides.AIImplementationPlaybook,
        priority: 'high',
        reason: 'Your assessment shows you have the knowledge foundation to begin implementing AI in your organization.',
        matchScore: 90,
        expectedBenefits: [
          'Execute AI implementation plan',
          'Navigate technical challenges',
          'Lead organizational change'
        ],
        recommendedSequence: 3
      });
    }
    
    // ROI Toolkit - for business-focused individuals
    const businessScore = maturityScores['F1.2'] || maturityScores['business_application'] || 3;
    if (businessScore >= 3 || overallScore >= 3) {
      recommendations.push({
        guideId: 'AIUseCaseROIToolkit',
        guide: this.guides.AIUseCaseROIToolkit,
        priority: businessScore >= 4 ? 'high' : 'medium',
        reason: 'Your business application knowledge suggests you\'re ready to evaluate AI project ROI.',
        matchScore: 80,
        expectedBenefits: [
          'Calculate AI project ROI',
          'Evaluate use case viability',
          'Build business cases'
        ],
        recommendedSequence: 4
      });
    }
    
    return recommendations;
  }
  
  /**
   * Change Readiness specific guide recommendations  
   */
  getChangeReadinessGuideRecommendations(results) {
    const recommendations = [];
    const readinessLevel = results.readiness_level || results.readinessLevel || 'prepare_first';
    const scoringBreakdown = results.scoring_breakdown || {};
    const overallScore = scoringBreakdown.overall_score || 50;
    
    // Strategy Starter Kit - always recommended for change readiness
    recommendations.push({
      guideId: 'AIStrategyStarterKit',
      guide: this.guides.AIStrategyStarterKit,
      priority: readinessLevel === 'get_help' ? 'high' : 'medium',
      reason: 'Every successful AI initiative requires a strategic foundation and governance framework.',
      matchScore: 90,
      expectedBenefits: [
        'Strategic AI framework',
        'Change management approach',
        'Leadership alignment'
      ],
      recommendedSequence: 1
    });
    
    // Readiness Assessment - for organizations needing deeper analysis  
    if (readinessLevel === 'prepare_first' || overallScore < 70) {
      recommendations.push({
        guideId: 'AIReadinessAssessment',
        guide: this.guides.AIReadinessAssessment,
        priority: 'high',
        reason: 'Your change readiness assessment indicates you need to address organizational gaps before implementation.',
        matchScore: 95,
        expectedBenefits: [
          'Deep organizational analysis',
          'Capability gap identification',
          'Structured preparation plan'
        ],
        recommendedSequence: 1 // Higher priority than strategy for unprepared orgs
      });
    }
    
    // Implementation Playbook - for ready organizations
    if (readinessLevel === 'ready_to_implement' || overallScore >= 70) {
      recommendations.push({
        guideId: 'AIImplementationPlaybook',
        guide: this.guides.AIImplementationPlaybook,
        priority: 'high',
        reason: 'Your organization shows readiness to begin AI implementation with proper guidance.',
        matchScore: 85,
        expectedBenefits: [
          'Step-by-step implementation',
          'Risk mitigation strategies',
          'Success measurement'
        ],
        recommendedSequence: 2
      });
    }
    
    // ROI Toolkit - based on business readiness
    const processReadiness = scoringBreakdown.process_readiness || 0;
    const leadershipReadiness = scoringBreakdown.leadership_readiness || 0;
    if (processReadiness >= 60 || leadershipReadiness >= 60) {
      recommendations.push({
        guideId: 'AIUseCaseROIToolkit',
        guide: this.guides.AIUseCaseROIToolkit,
        priority: 'medium',
        reason: 'Your process and leadership readiness suggest you can effectively evaluate AI project ROI.',
        matchScore: 75,
        expectedBenefits: [
          'ROI measurement framework',
          'Business case development',
          'Success metrics'
        ],
        recommendedSequence: 3
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get contextual guide recommendations for a user based on all their assessments
   */
  async getPersonalizedGuideRecommendations(userId) {
    try {
      // This would integrate with assessmentAPI to get user's assessment history
      // For now, return basic recommendations
      const allGuides = Object.values(this.guides);
      
      return allGuides.map(guide => ({
        guideId: guide.id,
        guide: guide,
        priority: 'medium',
        reason: 'Recommended based on your AI journey progress.',
        matchScore: 70,
        expectedBenefits: ['Professional development', 'Strategic insights', 'Implementation guidance'],
        recommendedSequence: 1
      }));
      
    } catch (error) {
      console.error('❌ Error getting personalized recommendations:', error);
      return [];
    }
  }
}

export default new GuidesAPI();
