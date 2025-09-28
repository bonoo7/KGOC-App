// Well Test Service - Firebase integration
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

// Collection name for well tests
const WELL_TESTS_COLLECTION = 'wellTests';

// Helper function to handle Firestore errors
const handleFirestoreError = (error, operation) => {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error.code === 'permission-denied') {
    return {
      success: false,
      error: 'permission-denied',
      message: 'Access denied. Please check your permissions.'
    };
  }
  
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

// Create a new well test
export const createWellTest = async (wellTestData) => {
  try {
    console.log('🔬 Creating new well test in Firebase...');
    
    if (!wellTestData.wellNumber || !wellTestData.api) {
      throw new Error('Well Number and API are required');
    }

    // Prepare the data with timestamps and artificial lift type
    const dataToSave = {
      ...wellTestData,
      artificialLiftType: wellTestData.artificialLiftType || 'Natural Flow', // Ensure default value
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      version: 1
    };

    // Add the document to Firestore
    const wellTestRef = await addDoc(collection(db, WELL_TESTS_COLLECTION), dataToSave);
    
    console.log('✅ Well test created successfully with ID:', wellTestRef.id);
    
    // Also save to localStorage as backup
    try {
      const localData = {
        ...dataToSave,
        id: wellTestRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const existingTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      existingTests.push(localData);
      localStorage.setItem('wellTests', JSON.stringify(existingTests));
      console.log('✅ Well test also saved to localStorage');
    } catch (localError) {
      console.warn('⚠️ Failed to save to localStorage:', localError);
    }

    return {
      success: true,
      id: wellTestRef.id,
      message: 'Well test created successfully!',
      data: dataToSave
    };

  } catch (error) {
    console.error('❌ Error creating well test:', error);
    
    // Fallback to localStorage if Firebase fails
    if (wellTestData.wellNumber && wellTestData.api) {
      try {
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const localData = {
          ...wellTestData,
          id: localId,
          artificialLiftType: wellTestData.artificialLiftType || 'Natural Flow',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active',
          version: 1,
          isLocal: true
        };
        
        const existingTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
        existingTests.push(localData);
        localStorage.setItem('wellTests', JSON.stringify(existingTests));
        
        console.log('⚠️ Well test saved to localStorage as fallback');
        
        return {
          success: true,
          id: localId,
          message: 'Well test saved locally (Firebase unavailable)',
          data: localData,
          fallback: true
        };
      } catch (localError) {
        console.error('❌ localStorage fallback also failed:', localError);
      }
    }
    
    return handleFirestoreError(error, 'createWellTest');
  }
};

// Get all well tests
export const getAllWellTests = async (limitCount = 100) => {
  try {
    console.log('📋 Fetching all well tests from Firebase...');
    
    const q = query(
      collection(db, WELL_TESTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const wellTests = [];

    querySnapshot.forEach((doc) => {
      wellTests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Loaded ${wellTests.length} well tests from Firebase`);
    
    // Also save to localStorage for offline access
    try {
      localStorage.setItem('wellTests', JSON.stringify(wellTests));
    } catch (localError) {
      console.warn('⚠️ Failed to cache to localStorage:', localError);
    }

    return {
      success: true,
      data: wellTests,
      count: wellTests.length,
      source: 'firebase'
    };

  } catch (error) {
    console.error('❌ Error fetching well tests from Firebase:', error);
    
    // Fallback to localStorage
    try {
      const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      console.log(`⚠️ Using localStorage fallback: ${localTests.length} well tests`);
      
      return {
        success: true,
        data: localTests,
        count: localTests.length,
        source: 'localStorage',
        fallback: true
      };
    } catch (localError) {
      console.error('❌ localStorage fallback also failed:', localError);
      
      return {
        success: true,
        data: [],
        count: 0,
        source: 'empty',
        fallback: true
      };
    }
  }
};

// Get well test by ID
export const getWellTestById = async (wellTestId) => {
  try {
    console.log('🔍 Fetching well test by ID:', wellTestId);
    
    const wellTestRef = doc(db, WELL_TESTS_COLLECTION, wellTestId);
    const wellTestSnap = await getDoc(wellTestRef);

    if (wellTestSnap.exists()) {
      const wellTestData = {
        id: wellTestSnap.id,
        ...wellTestSnap.data()
      };
      
      console.log('✅ Well test found in Firebase');
      
      return {
        success: true,
        data: wellTestData,
        source: 'firebase'
      };
    } else {
      // Try localStorage fallback
      const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      const localTest = localTests.find(test => test.id === wellTestId);
      
      if (localTest) {
        console.log('⚠️ Well test found in localStorage fallback');
        return {
          success: true,
          data: localTest,
          source: 'localStorage'
        };
      }
      
      return {
        success: false,
        message: 'Well test not found'
      };
    }

  } catch (error) {
    console.error('❌ Error fetching well test:', error);
    
    // Try localStorage fallback
    try {
      const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      const localTest = localTests.find(test => test.id === wellTestId);
      
      if (localTest) {
        console.log('⚠️ Using localStorage fallback for well test');
        return {
          success: true,
          data: localTest,
          source: 'localStorage',
          fallback: true
        };
      }
    } catch (localError) {
      console.error('❌ localStorage fallback failed:', localError);
    }
    
    return handleFirestoreError(error, 'getWellTestById');
  }
};

// Update well test
export const updateWellTest = async (wellTestId, updateData) => {
  try {
    console.log('🔄 Updating well test:', wellTestId);
    
    if (!wellTestId) {
      throw new Error('Well test ID is required');
    }

    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
      version: (updateData.version || 1) + 1
    };

    const wellTestRef = doc(db, WELL_TESTS_COLLECTION, wellTestId);
    await updateDoc(wellTestRef, dataToUpdate);
    
    console.log('✅ Well test updated successfully in Firebase');
    
    // Also update localStorage
    try {
      const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      const testIndex = localTests.findIndex(test => test.id === wellTestId);
      
      if (testIndex !== -1) {
        localTests[testIndex] = {
          ...localTests[testIndex],
          ...updateData,
          updatedAt: new Date(),
          version: (localTests[testIndex].version || 1) + 1
        };
        localStorage.setItem('wellTests', JSON.stringify(localTests));
        console.log('✅ Well test also updated in localStorage');
      }
    } catch (localError) {
      console.warn('⚠️ Failed to update localStorage:', localError);
    }

    return {
      success: true,
      message: 'Well test updated successfully!',
      data: dataToUpdate
    };

  } catch (error) {
    console.error('❌ Error updating well test:', error);
    
    // Fallback to localStorage update
    if (wellTestId && updateData) {
      try {
        const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
        const testIndex = localTests.findIndex(test => test.id === wellTestId);
        
        if (testIndex !== -1) {
          localTests[testIndex] = {
            ...localTests[testIndex],
            ...updateData,
            updatedAt: new Date(),
            version: (localTests[testIndex].version || 1) + 1,
            isLocal: true
          };
          localStorage.setItem('wellTests', JSON.stringify(localTests));
          
          console.log('⚠️ Well test updated in localStorage as fallback');
          
          return {
            success: true,
            message: 'Well test updated locally (Firebase unavailable)',
            data: localTests[testIndex],
            fallback: true
          };
        }
      } catch (localError) {
        console.error('❌ localStorage fallback failed:', localError);
      }
    }
    
    return handleFirestoreError(error, 'updateWellTest');
  }
};

// Delete well test
export const deleteWellTest = async (wellTestId) => {
  try {
    console.log('🗑️ Deleting well test:', wellTestId);
    
    if (!wellTestId) {
      throw new Error('Well test ID is required');
    }

    const wellTestRef = doc(db, WELL_TESTS_COLLECTION, wellTestId);
    await deleteDoc(wellTestRef);
    
    console.log('✅ Well test deleted successfully from Firebase');
    
    // Also remove from localStorage
    try {
      const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      const filteredTests = localTests.filter(test => test.id !== wellTestId);
      localStorage.setItem('wellTests', JSON.stringify(filteredTests));
      console.log('✅ Well test also removed from localStorage');
    } catch (localError) {
      console.warn('⚠️ Failed to remove from localStorage:', localError);
    }

    return {
      success: true,
      message: 'Well test deleted successfully!'
    };

  } catch (error) {
    console.error('❌ Error deleting well test:', error);
    
    // Fallback to localStorage deletion
    if (wellTestId) {
      try {
        const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
        const filteredTests = localTests.filter(test => test.id !== wellTestId);
        localStorage.setItem('wellTests', JSON.stringify(filteredTests));
        
        console.log('⚠️ Well test removed from localStorage as fallback');
        
        return {
          success: true,
          message: 'Well test deleted locally (Firebase unavailable)',
          fallback: true
        };
      } catch (localError) {
        console.error('❌ localStorage fallback failed:', localError);
      }
    }
    
    return handleFirestoreError(error, 'deleteWellTest');
  }
};

// Get well tests by user (for user-specific data)
export const getWellTestsByUser = async (userId, limitCount = 50) => {
  try {
    console.log('👤 Fetching well tests for user:', userId);
    
    const q = query(
      collection(db, WELL_TESTS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const wellTests = [];

    querySnapshot.forEach((doc) => {
      wellTests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Loaded ${wellTests.length} well tests for user ${userId}`);

    return {
      success: true,
      data: wellTests,
      count: wellTests.length,
      source: 'firebase'
    };

  } catch (error) {
    console.error('❌ Error fetching user well tests:', error);
    
    // Fallback to localStorage with filtering
    try {
      const localTests = JSON.parse(localStorage.getItem('wellTests') || '[]');
      const userTests = localTests.filter(test => test.createdBy === userId);
      
      console.log(`⚠️ Using localStorage fallback: ${userTests.length} well tests for user`);
      
      return {
        success: true,
        data: userTests,
        count: userTests.length,
        source: 'localStorage',
        fallback: true
      };
    } catch (localError) {
      console.error('❌ localStorage fallback failed:', localError);
      
      return {
        success: true,
        data: [],
        count: 0,
        source: 'empty',
        fallback: true
      };
    }
  }
};

// Search well tests by well number or API
export const searchWellTests = async (searchTerm) => {
  try {
    console.log('🔍 Searching well tests for:', searchTerm);
    
    if (!searchTerm.trim()) {
      return getAllWellTests();
    }

    // For now, get all and filter locally (Firestore doesn't support text search easily)
    const allTestsResult = await getAllWellTests();
    
    if (allTestsResult.success) {
      const filteredTests = allTestsResult.data.filter(test => 
        test.wellNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.api?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.wellType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.artificialLiftType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return {
        success: true,
        data: filteredTests,
        count: filteredTests.length,
        searchTerm: searchTerm
      };
    }
    
    return allTestsResult;

  } catch (error) {
    console.error('❌ Error searching well tests:', error);
    return handleFirestoreError(error, 'searchWellTests');
  }
};

// Get well tests by well number (for loading previous data)
export const getWellTestsByWellNumber = async (wellNumber) => {
  try {
    console.log('🔍 Getting well tests for well number:', wellNumber);
    
    if (!wellNumber.trim()) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    // Get all tests and filter by well number
    const allTestsResult = await getAllWellTests();
    
    if (allTestsResult.success) {
      const wellTests = allTestsResult.data.filter(test => 
        test.wellNumber?.toLowerCase() === wellNumber.toLowerCase()
      );
      
      // Sort by creation date (newest first)
      wellTests.sort((a, b) => {
        const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
        const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
        return dateB - dateA;
      });
      
      console.log(`✅ Found ${wellTests.length} tests for well ${wellNumber}`);
      
      return {
        success: true,
        data: wellTests,
        count: wellTests.length,
        wellNumber: wellNumber
      };
    }
    
    return allTestsResult;

  } catch (error) {
    console.error('❌ Error getting well tests by well number:', error);
    return handleFirestoreError(error, 'getWellTestsByWellNumber');
  }
};

// Get well test statistics
export const getWellTestStats = async () => {
  try {
    console.log('📊 Calculating well test statistics...');
    
    const allTestsResult = await getAllWellTests();
    
    if (!allTestsResult.success) {
      return allTestsResult;
    }
    
    const wellTests = allTestsResult.data;
    
    const stats = {
      totalTests: wellTests.length,
      oilWells: wellTests.filter(test => test.wellType === 'Oil').length,
      gasWells: wellTests.filter(test => test.wellType === 'Gas').length,
      waterWells: wellTests.filter(test => test.wellType === 'Water').length,
      injectionWells: wellTests.filter(test => test.wellType === 'Injection').length,
      averageFlowRate: 0,
      averageGasRate: 0,
      averageWaterCut: 0,
      totalFlowRate: 0,
      totalGasRate: 0
    };
    
    if (wellTests.length > 0) {
      const totalFlow = wellTests.reduce((sum, test) => sum + (test.flowRate || 0), 0);
      const totalGas = wellTests.reduce((sum, test) => sum + (test.gasRate || 0), 0);
      const totalWaterCut = wellTests.reduce((sum, test) => sum + (test.waterCut || 0), 0);
      
      stats.averageFlowRate = totalFlow / wellTests.length;
      stats.averageGasRate = totalGas / wellTests.length;
      stats.averageWaterCut = totalWaterCut / wellTests.length;
      stats.totalFlowRate = totalFlow;
      stats.totalGasRate = totalGas;
    }
    
    console.log('✅ Well test statistics calculated');
    
    return {
      success: true,
      data: stats
    };

  } catch (error) {
    console.error('❌ Error calculating statistics:', error);
    return handleFirestoreError(error, 'getWellTestStats');
  }
};

export default {
  createWellTest,
  getAllWellTests,
  getWellTestById,
  updateWellTest,
  deleteWellTest,
  getWellTestsByUser,
  searchWellTests,
  getWellTestsByWellNumber,
  getWellTestStats
};