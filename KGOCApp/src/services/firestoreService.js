// Firestore database service
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper function to handle Firestore errors
const handleFirestoreError = (error, operation) => {
  console.error(`Firestore ${operation} error:`, error);
  
  // Check if it's a permissions error
  if (error.code === 'permission-denied') {
    return {
      success: false,
      error: 'permission-denied',
      message: 'Database access denied. Please check Firestore security rules.'
    };
  }
  
  // Check if it's a network error
  if (error.code === 'unavailable' || error.message.includes('400')) {
    return {
      success: false,
      error: 'network-error',
      message: 'Network connection issue. Please try again later.'
    };
  }
  
  return {
    success: false,
    error: error.code || 'unknown',
    message: error.message || 'An unknown error occurred'
  };
};

// Create or update user profile
export const createUserProfile = async (userId, profileData) => {
  try {
    // First, try to use localStorage as fallback
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also save to localStorage as backup
    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profileData));

    return {
      success: true,
      message: 'User profile created successfully!'
    };
  } catch (error) {
    // Fallback to localStorage if Firestore fails
    if (userId && profileData) {
      localStorage.setItem(`userProfile_${userId}`, JSON.stringify({
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      return {
        success: true,
        message: 'Profile saved locally (Firestore unavailable)',
        fallback: true
      };
    }
    
    return handleFirestoreError(error, 'createUserProfile');
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        success: true,
        data: userSnap.data()
      };
    } else {
      // Try localStorage fallback
      const localData = localStorage.getItem(`userProfile_${userId}`);
      if (localData) {
        return {
          success: true,
          data: JSON.parse(localData),
          fallback: true
        };
      }
      
      return {
        success: false,
        message: 'User profile not found'
      };
    }
  } catch (error) {
    // Fallback to localStorage
    if (userId) {
      const localData = localStorage.getItem(`userProfile_${userId}`);
      if (localData) {
        return {
          success: true,
          data: JSON.parse(localData),
          fallback: true
        };
      }
    }
    
    return handleFirestoreError(error, 'getUserProfile');
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    // Also update localStorage
    const existingData = localStorage.getItem(`userProfile_${userId}`);
    if (existingData) {
      const parsed = JSON.parse(existingData);
      localStorage.setItem(`userProfile_${userId}`, JSON.stringify({
        ...parsed,
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    }

    return {
      success: true,
      message: 'Profile updated successfully!'
    };
  } catch (error) {
    // Fallback to localStorage
    if (userId && updates) {
      const existingData = localStorage.getItem(`userProfile_${userId}`);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        localStorage.setItem(`userProfile_${userId}`, JSON.stringify({
          ...parsed,
          ...updates,
          updatedAt: new Date().toISOString()
        }));
        
        return {
          success: true,
          message: 'Profile updated locally (Firestore unavailable)',
          fallback: true
        };
      }
    }
    
    return handleFirestoreError(error, 'updateUserProfile');
  }
};

// Delete user profile
export const deleteUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // Also remove from localStorage
    localStorage.removeItem(`userProfile_${userId}`);

    return {
      success: true,
      message: 'Profile deleted successfully!'
    };
  } catch (error) {
    // At least remove from localStorage
    if (userId) {
      localStorage.removeItem(`userProfile_${userId}`);
    }
    
    return handleFirestoreError(error, 'deleteUserProfile');
  }
};

// Save user settings
export const saveUserSettings = async (userId, settings) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const settingsRef = doc(db, 'userSettings', userId);
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Also save to localStorage
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));

    return {
      success: true,
      message: 'Settings saved successfully!'
    };
  } catch (error) {
    // Fallback to localStorage
    if (userId && settings) {
      localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
      
      return {
        success: true,
        message: 'Settings saved locally (Firestore unavailable)',
        fallback: true
      };
    }
    
    return handleFirestoreError(error, 'saveUserSettings');
  }
};

// Get user settings
export const getUserSettings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const settingsRef = doc(db, 'userSettings', userId);
    const settingsSnap = await getDoc(settingsRef);

    if (settingsSnap.exists()) {
      return {
        success: true,
        data: settingsSnap.data()
      };
    } else {
      // Try localStorage fallback
      const localSettings = localStorage.getItem(`userSettings_${userId}`);
      if (localSettings) {
        return {
          success: true,
          data: JSON.parse(localSettings),
          fallback: true
        };
      }
      
      // Return default settings if none exist
      const defaultSettings = {
        notifications: true,
        darkMode: false,
        language: 'en'
      };
      
      return {
        success: true,
        data: defaultSettings
      };
    }
  } catch (error) {
    // Fallback to localStorage or defaults
    if (userId) {
      const localSettings = localStorage.getItem(`userSettings_${userId}`);
      if (localSettings) {
        return {
          success: true,
          data: JSON.parse(localSettings),
          fallback: true
        };
      }
    }
    
    // Return default settings on error
    return {
      success: true,
      data: {
        notifications: true,
        darkMode: false,
        language: 'en'
      },
      fallback: true
    };
  }
};

// Add activity log (simplified - mainly for localStorage)
export const addActivityLog = async (userId, activity) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Try Firestore first
    const activityRef = collection(db, 'activities');
    await addDoc(activityRef, {
      userId,
      ...activity,
      timestamp: serverTimestamp()
    });

    return {
      success: true,
      message: 'Activity logged successfully!'
    };
  } catch (error) {
    // For now, just log to console as fallback
    console.log('Activity (local):', { userId, ...activity, timestamp: new Date() });
    
    return {
      success: true,
      message: 'Activity logged locally',
      fallback: true
    };
  }
};

// Get user activities (simplified)
export const getUserActivities = async (userId, limitCount = 10) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const activities = [];

    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: activities
    };
  } catch (error) {
    // Return empty array on error
    return {
      success: true,
      data: [],
      fallback: true
    };
  }
};