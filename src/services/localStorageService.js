// Local Storage Service - Works without Firestore
// This ensures the app works perfectly even without Firestore connection

// Helper function to generate IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get current timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Create or update user profile
export const createUserProfile = async (userId, profileData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const dataToSave = {
      ...profileData,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
      id: userId
    };

    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(dataToSave));

    return {
      success: true,
      message: 'Profile created successfully! (Local Storage)',
      data: dataToSave
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to save profile locally'
    };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const stored = localStorage.getItem(`userProfile_${userId}`);
    
    if (stored) {
      const data = JSON.parse(stored);
      return {
        success: true,
        data: data
      };
    } else {
      return {
        success: false,
        message: 'No profile data found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to load profile'
    };
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const existing = localStorage.getItem(`userProfile_${userId}`);
    let currentData = {};
    
    if (existing) {
      currentData = JSON.parse(existing);
    }

    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: getTimestamp(),
      id: userId
    };

    localStorage.setItem(`userProfile_${userId}`, JSON.stringify(updatedData));

    return {
      success: true,
      message: 'Profile updated successfully! (Local Storage)',
      data: updatedData
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to update profile'
    };
  }
};

// Delete user profile
export const deleteUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    localStorage.removeItem(`userProfile_${userId}`);

    return {
      success: true,
      message: 'Profile deleted successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to delete profile'
    };
  }
};

// Save user settings
export const saveUserSettings = async (userId, settings) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const dataToSave = {
      ...settings,
      updatedAt: getTimestamp(),
      id: userId
    };

    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(dataToSave));

    return {
      success: true,
      message: 'Settings saved successfully! (Local Storage)',
      data: dataToSave
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to save settings'
    };
  }
};

// Get user settings
export const getUserSettings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const stored = localStorage.getItem(`userSettings_${userId}`);
    
    if (stored) {
      const data = JSON.parse(stored);
      return {
        success: true,
        data: data
      };
    } else {
      // Return default settings
      const defaultSettings = {
        notifications: true,
        darkMode: false,
        language: 'en',
        id: userId,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp()
      };
      
      // Save defaults
      localStorage.setItem(`userSettings_${userId}`, JSON.stringify(defaultSettings));
      
      return {
        success: true,
        data: defaultSettings
      };
    }
  } catch (error) {
    // Return defaults on error
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
};

// Add activity log
export const addActivityLog = async (userId, activity) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get existing activities
    const existing = localStorage.getItem(`userActivities_${userId}`);
    let activities = [];
    
    if (existing) {
      activities = JSON.parse(existing);
    }

    // Add new activity
    const newActivity = {
      id: generateId(),
      userId,
      ...activity,
      timestamp: getTimestamp()
    };

    activities.unshift(newActivity); // Add to beginning
    
    // Keep only last 50 activities to avoid storage bloat
    if (activities.length > 50) {
      activities = activities.slice(0, 50);
    }

    localStorage.setItem(`userActivities_${userId}`, JSON.stringify(activities));

    return {
      success: true,
      message: 'Activity logged successfully! (Local Storage)',
      data: newActivity
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to log activity'
    };
  }
};

// Get user activities
export const getUserActivities = async (userId, limitCount = 10) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const stored = localStorage.getItem(`userActivities_${userId}`);
    
    if (stored) {
      const activities = JSON.parse(stored);
      const limited = activities.slice(0, limitCount);
      
      return {
        success: true,
        data: limited
      };
    } else {
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to load activities'
    };
  }
};

// Clear all user data (for testing/logout)
export const clearUserData = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    localStorage.removeItem(`userProfile_${userId}`);
    localStorage.removeItem(`userSettings_${userId}`);
    localStorage.removeItem(`userActivities_${userId}`);

    return {
      success: true,
      message: 'All user data cleared successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to clear user data'
    };
  }
};

// Get storage stats
export const getStorageStats = () => {
  try {
    let totalSize = 0;
    let itemCount = 0;
    const items = {};

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        const size = new Blob([value]).size;
        totalSize += size;
        itemCount++;
        
        if (key.startsWith('user')) {
          items[key] = {
            size: size,
            preview: value.substring(0, 50) + '...'
          };
        }
      }
    }

    return {
      success: true,
      data: {
        totalSize: totalSize,
        itemCount: itemCount,
        items: items,
        availableSpace: 'Unlimited (localStorage)',
        lastChecked: getTimestamp()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'local-storage-error',
      message: error.message || 'Failed to get storage stats'
    };
  }
};