import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Save assessment results to Firebase
 * @param {string} userId - User ID
 * @param {Object} assessmentData - Assessment data including type, responses, results
 * @returns {Promise<string>} - Document ID
 */
export const saveAssessmentResults = async (userId, assessmentData) => {
  try {
    const assessmentId = `${assessmentData.type}_${Date.now()}`;
    const docRef = doc(db, 'users', userId, 'assessments', assessmentId);
    
    await setDoc(docRef, {
      ...assessmentData,
      userId,
      createdAt: serverTimestamp(),
      version: '2.0'
    });
    
    // Also save a summary in the user's main document for quick access
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const assessmentSummaries = userDoc.data().assessmentSummaries || {};
      assessmentSummaries[assessmentData.type] = {
        lastCompleted: new Date().toISOString(),
        score: assessmentData.results.overall_score,
        readinessLevel: assessmentData.results.readiness_level,
        assessmentId
      };
      
      await setDoc(userRef, { assessmentSummaries }, { merge: true });
    }
    
    return assessmentId;
  } catch (error) {
    console.error('Error saving assessment results:', error);
    throw error;
  }
};

/**
 * Get assessment results by ID
 * @param {string} userId - User ID
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<Object>} - Assessment data
 */
export const getAssessmentResults = async (userId, assessmentId) => {
  try {
    const docRef = doc(db, 'users', userId, 'assessments', assessmentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Assessment not found');
    }
  } catch (error) {
    console.error('Error getting assessment results:', error);
    throw error;
  }
};

/**
 * Get all assessments for a user
 * @param {string} userId - User ID
 * @param {string} type - Optional assessment type filter
 * @returns {Promise<Array>} - Array of assessments
 */
export const getUserAssessments = async (userId, type = null) => {
  try {
    const assessmentsRef = collection(db, 'users', userId, 'assessments');
    let q = assessmentsRef;
    
    if (type) {
      q = query(assessmentsRef, where('type', '==', type), orderBy('createdAt', 'desc'));
    } else {
      q = query(assessmentsRef, orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const assessments = [];
    
    querySnapshot.forEach((doc) => {
      assessments.push({ id: doc.id, ...doc.data() });
    });
    
    return assessments;
  } catch (error) {
    console.error('Error getting user assessments:', error);
    throw error;
  }
};

/**
 * Get the latest assessment of a specific type
 * @param {string} userId - User ID
 * @param {string} type - Assessment type
 * @returns {Promise<Object|null>} - Latest assessment or null
 */
export const getLatestAssessment = async (userId, type) => {
  try {
    const assessmentsRef = collection(db, 'users', userId, 'assessments');
    const q = query(
      assessmentsRef, 
      where('type', '==', type), 
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest assessment:', error);
    throw error;
  }
};

/**
 * Generate shareable assessment report URL
 * @param {string} userId - User ID
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<string>} - Shareable URL
 */
export const generateShareableReport = async (userId, assessmentId) => {
  try {
    // Create a shareable link document
    const shareId = `${userId}_${assessmentId}_${Date.now()}`;
    const shareRef = doc(db, 'sharedReports', shareId);
    
    await setDoc(shareRef, {
      userId,
      assessmentId,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      viewCount: 0
    });
    
    return `${window.location.origin}/shared/assessment/${shareId}`;
  } catch (error) {
    console.error('Error generating shareable report:', error);
    throw error;
  }
};

/**
 * Track assessment progress (for multi-page assessments)
 * @param {string} userId - User ID
 * @param {string} type - Assessment type
 * @param {Object} progress - Progress data
 */
export const saveAssessmentProgress = async (userId, type, progress) => {
  try {
    const progressRef = doc(db, 'users', userId, 'assessmentProgress', type);
    
    await setDoc(progressRef, {
      ...progress,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving assessment progress:', error);
    throw error;
  }
};

/**
 * Get assessment progress
 * @param {string} userId - User ID
 * @param {string} type - Assessment type
 * @returns {Promise<Object|null>} - Progress data or null
 */
export const getAssessmentProgress = async (userId, type) => {
  try {
    const progressRef = doc(db, 'users', userId, 'assessmentProgress', type);
    const docSnap = await getDoc(progressRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting assessment progress:', error);
    throw error;
  }
};

/**
 * Clear assessment progress (when completed or abandoned)
 * @param {string} userId - User ID
 * @param {string} type - Assessment type
 */
export const clearAssessmentProgress = async (userId, type) => {
  try {
    const progressRef = doc(db, 'users', userId, 'assessmentProgress', type);
    await setDoc(progressRef, { cleared: true, clearedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error clearing assessment progress:', error);
    throw error;
  }
};