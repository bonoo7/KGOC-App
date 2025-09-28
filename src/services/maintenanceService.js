// Maintenance Service - Firebase integration for maintenance requests
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

// Collection name for maintenance requests
const MAINTENANCE_REQUESTS_COLLECTION = 'maintenanceRequests';

// Well parts for maintenance blueprint
export const WELL_PARTS = {
  // Surface Equipment
  WELLHEAD: {
    id: 'wellhead',
    name: 'Wellhead',
    category: 'Surface Equipment',
    description: 'Main wellhead assembly',
    position: { x: 50, y: 20 }
  },
  CHRISTMAS_TREE: {
    id: 'christmas_tree',
    name: 'Christmas Tree',
    category: 'Surface Equipment',
    description: 'Valve assembly on wellhead',
    position: { x: 50, y: 35 }
  },
  CHOKE: {
    id: 'choke',
    name: 'Choke',
    category: 'Flow Control',
    description: 'Flow control device',
    position: { x: 70, y: 35 }
  },
  FLOWLINE: {
    id: 'flowline',
    name: 'Flowline',
    category: 'Surface Equipment',
    description: 'Production flowline',
    position: { x: 85, y: 35 }
  },
  
  // Downhole Equipment
  TUBING: {
    id: 'tubing',
    name: 'Production Tubing',
    category: 'Downhole Equipment',
    description: 'Production tubing string',
    position: { x: 45, y: 50 }
  },
  PACKER: {
    id: 'packer',
    name: 'Packer',
    category: 'Downhole Equipment',
    description: 'Isolation packer',
    position: { x: 45, y: 65 }
  },
  PERFORATIONS: {
    id: 'perforations',
    name: 'Perforations',
    category: 'Completion',
    description: 'Well perforations',
    position: { x: 45, y: 80 }
  },
  
  // Artificial Lift Equipment
  SUCKER_ROD: {
    id: 'sucker_rod',
    name: 'Sucker Rod',
    category: 'Artificial Lift',
    description: 'Sucker rod string',
    position: { x: 30, y: 50 }
  },
  PUMP: {
    id: 'pump',
    name: 'Downhole Pump',
    category: 'Artificial Lift',
    description: 'Downhole pump assembly',
    position: { x: 30, y: 75 }
  },
  MOTOR: {
    id: 'motor',
    name: 'Surface Motor',
    category: 'Artificial Lift',
    description: 'Surface driving motor',
    position: { x: 15, y: 20 }
  },
  
  // Monitoring Equipment
  PRESSURE_GAUGE: {
    id: 'pressure_gauge',
    name: 'Pressure Gauge',
    category: 'Instrumentation',
    description: 'Wellhead pressure monitoring',
    position: { x: 65, y: 20 }
  },
  TEMPERATURE_SENSOR: {
    id: 'temperature_sensor',
    name: 'Temperature Sensor',
    category: 'Instrumentation',
    description: 'Temperature monitoring',
    position: { x: 80, y: 20 }
  }
};

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

// Create maintenance request
export const createMaintenanceRequest = async (requestData) => {
  try {
    console.log('🔧 Creating maintenance request in Firebase...');
    
    if (!requestData.wellNumber || !requestData.partId) {
      throw new Error('Well Number and Part ID are required');
    }

    // Prepare the data with timestamps
    const dataToSave = {
      ...requestData,
      partInfo: WELL_PARTS[requestData.partId] || null,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      priority: requestData.priority || 'medium'
    };

    // Add the document to Firestore
    const requestRef = await addDoc(collection(db, MAINTENANCE_REQUESTS_COLLECTION), dataToSave);
    
    console.log('✅ Maintenance request created successfully with ID:', requestRef.id);
    
    // Also save to localStorage as backup
    try {
      const localData = {
        ...dataToSave,
        id: requestRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const existingRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      existingRequests.push(localData);
      localStorage.setItem('maintenanceRequests', JSON.stringify(existingRequests));
      console.log('✅ Maintenance request also saved to localStorage');
    } catch (localError) {
      console.warn('⚠️ Failed to save to localStorage:', localError);
    }

    return {
      success: true,
      id: requestRef.id,
      message: 'Maintenance request created successfully!',
      data: dataToSave
    };

  } catch (error) {
    console.error('❌ Error creating maintenance request:', error);
    
    // Fallback to localStorage if Firebase fails
    if (requestData.wellNumber && requestData.partId) {
      try {
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const localData = {
          ...requestData,
          id: localId,
          partInfo: WELL_PARTS[requestData.partId] || null,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          priority: requestData.priority || 'medium',
          isLocal: true
        };
        
        const existingRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
        existingRequests.push(localData);
        localStorage.setItem('maintenanceRequests', JSON.stringify(existingRequests));
        
        console.log('⚠️ Maintenance request saved to localStorage as fallback');
        
        return {
          success: true,
          id: localId,
          message: 'Maintenance request saved locally (Firebase unavailable)',
          data: localData,
          fallback: true
        };
      } catch (localError) {
        console.error('❌ localStorage fallback also failed:', localError);
      }
    }
    
    return handleFirestoreError(error, 'createMaintenanceRequest');
  }
};

// Get all maintenance requests
export const getAllMaintenanceRequests = async (limitCount = 100) => {
  try {
    console.log('📋 Fetching all maintenance requests from Firebase...');
    
    const q = query(
      collection(db, MAINTENANCE_REQUESTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const requests = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Loaded ${requests.length} maintenance requests from Firebase`);
    
    // Also save to localStorage for offline access
    try {
      localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
    } catch (localError) {
      console.warn('⚠️ Failed to cache to localStorage:', localError);
    }

    return {
      success: true,
      data: requests,
      count: requests.length,
      source: 'firebase'
    };

  } catch (error) {
    console.error('❌ Error fetching maintenance requests from Firebase:', error);
    
    // Fallback to localStorage
    try {
      const localRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      console.log(`⚠️ Using localStorage fallback: ${localRequests.length} maintenance requests`);
      
      return {
        success: true,
        data: localRequests,
        count: localRequests.length,
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

// Get maintenance requests by well number
export const getMaintenanceRequestsByWell = async (wellNumber) => {
  try {
    console.log('🔍 Getting maintenance requests for well:', wellNumber);
    
    if (!wellNumber.trim()) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    // Get all requests and filter by well number
    const allRequestsResult = await getAllMaintenanceRequests();
    
    if (allRequestsResult.success) {
      const wellRequests = allRequestsResult.data.filter(request => 
        request.wellNumber?.toLowerCase() === wellNumber.toLowerCase()
      );
      
      // Sort by creation date (newest first)
      wellRequests.sort((a, b) => {
        const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
        const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
        return dateB - dateA;
      });
      
      console.log(`✅ Found ${wellRequests.length} maintenance requests for well ${wellNumber}`);
      
      return {
        success: true,
        data: wellRequests,
        count: wellRequests.length,
        wellNumber: wellNumber
      };
    }
    
    return allRequestsResult;

  } catch (error) {
    console.error('❌ Error getting maintenance requests by well:', error);
    return handleFirestoreError(error, 'getMaintenanceRequestsByWell');
  }
};

// Update maintenance request status
export const updateMaintenanceRequestStatus = async (requestId, status, notes = '') => {
  try {
    console.log('🔄 Updating maintenance request status:', requestId, status);
    
    if (!requestId) {
      throw new Error('Request ID is required');
    }

    const updateData = {
      status: status,
      updatedAt: serverTimestamp(),
      statusNotes: notes,
      statusUpdatedAt: serverTimestamp()
    };

    const requestRef = doc(db, MAINTENANCE_REQUESTS_COLLECTION, requestId);
    await updateDoc(requestRef, updateData);
    
    console.log('✅ Maintenance request status updated successfully in Firebase');
    
    // Also update localStorage
    try {
      const localRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
      const requestIndex = localRequests.findIndex(request => request.id === requestId);
      
      if (requestIndex !== -1) {
        localRequests[requestIndex] = {
          ...localRequests[requestIndex],
          status: status,
          statusNotes: notes,
          updatedAt: new Date(),
          statusUpdatedAt: new Date()
        };
        localStorage.setItem('maintenanceRequests', JSON.stringify(localRequests));
        console.log('✅ Maintenance request also updated in localStorage');
      }
    } catch (localError) {
      console.warn('⚠️ Failed to update localStorage:', localError);
    }

    return {
      success: true,
      message: 'Maintenance request status updated successfully!',
      data: updateData
    };

  } catch (error) {
    console.error('❌ Error updating maintenance request status:', error);
    return handleFirestoreError(error, 'updateMaintenanceRequestStatus');
  }
};

export default {
  createMaintenanceRequest,
  getAllMaintenanceRequests,
  getMaintenanceRequestsByWell,
  updateMaintenanceRequestStatus,
  WELL_PARTS
};