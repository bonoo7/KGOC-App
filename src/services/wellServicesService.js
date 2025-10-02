// Well Services Management Service
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'wellServices';

// Service request statuses
export const SERVICE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold'
};

// Service priorities
export const SERVICE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

// Service types
export const SERVICE_TYPES = [
  'Maintenance',
  'Repair',
  'Inspection',
  'Testing',
  'Cleaning',
  'Installation',
  'Emergency Response',
  'Routine Check'
];

// Create a new service request
export const createServiceRequest = async (serviceData) => {
  try {
    if (db) {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...serviceData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: serviceData.status || SERVICE_STATUS.PENDING
      });
      
      console.log('✅ Service request created with ID:', docRef.id);
      return docRef.id;
    } else {
      // Fallback to localStorage
      const localKey = `serviceRequest_${Date.now()}`;
      const requestWithId = {
        id: localKey,
        ...serviceData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: serviceData.status || SERVICE_STATUS.PENDING
      };
      
      localStorage.setItem(localKey, JSON.stringify(requestWithId));
      console.log('✅ Service request saved to localStorage:', localKey);
      return localKey;
    }
  } catch (error) {
    console.error('❌ Error creating service request:', error);
    throw error;
  }
};

// Get all service requests
export const getAllServiceRequests = async () => {
  try {
    if (db) {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Retrieved ${requests.length} service requests from Firestore`);
      return requests;
    } else {
      // Fallback to localStorage
      const requests = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('serviceRequest_')) {
          try {
            const request = JSON.parse(localStorage.getItem(key));
            requests.push(request);
          } catch (error) {
            console.error('Error parsing service request from localStorage:', error);
          }
        }
      });
      
      // Sort by creation date (newest first)
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`✅ Retrieved ${requests.length} service requests from localStorage`);
      return requests;
    }
  } catch (error) {
    console.error('❌ Error getting service requests:', error);
    throw error;
  }
};

// Get service request by ID
export const getServiceRequestById = async (requestId) => {
  try {
    if (db) {
      const docRef = doc(db, COLLECTION_NAME, requestId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const request = { id: docSnap.id, ...docSnap.data() };
        console.log('✅ Service request retrieved:', requestId);
        return request;
      } else {
        console.log('❌ Service request not found:', requestId);
        return null;
      }
    } else {
      // Fallback to localStorage
      const request = localStorage.getItem(requestId);
      if (request) {
        return JSON.parse(request);
      }
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting service request:', error);
    throw error;
  }
};

// Update service request
export const updateServiceRequest = async (requestId, updates) => {
  try {
    if (db) {
      const docRef = doc(db, COLLECTION_NAME, requestId);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
      
      console.log('✅ Service request updated:', requestId);
    } else {
      // Fallback to localStorage
      const existingRequest = localStorage.getItem(requestId);
      if (existingRequest) {
        const request = JSON.parse(existingRequest);
        const updatedRequest = {
          ...request,
          ...updates,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(requestId, JSON.stringify(updatedRequest));
        console.log('✅ Service request updated in localStorage:', requestId);
      }
    }
  } catch (error) {
    console.error('❌ Error updating service request:', error);
    throw error;
  }
};

// Delete service request
export const deleteServiceRequest = async (requestId) => {
  try {
    if (db) {
      await deleteDoc(doc(db, COLLECTION_NAME, requestId));
      console.log('✅ Service request deleted:', requestId);
    } else {
      // Fallback to localStorage
      localStorage.removeItem(requestId);
      console.log('✅ Service request deleted from localStorage:', requestId);
    }
  } catch (error) {
    console.error('❌ Error deleting service request:', error);
    throw error;
  }
};

// Get service requests by status
export const getServiceRequestsByStatus = async (status) => {
  try {
    if (db) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Retrieved ${requests.length} service requests with status: ${status}`);
      return requests;
    } else {
      // Fallback to localStorage
      const allRequests = await getAllServiceRequests();
      return allRequests.filter(request => request.status === status);
    }
  } catch (error) {
    console.error('❌ Error getting service requests by status:', error);
    throw error;
  }
};

// Get service requests by priority
export const getServiceRequestsByPriority = async (priority) => {
  try {
    if (db) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('priority', '==', priority),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Retrieved ${requests.length} service requests with priority: ${priority}`);
      return requests;
    } else {
      // Fallback to localStorage
      const allRequests = await getAllServiceRequests();
      return allRequests.filter(request => request.priority === priority);
    }
  } catch (error) {
    console.error('❌ Error getting service requests by priority:', error);
    throw error;
  }
};

// Get service requests by well number
export const getServiceRequestsByWell = async (wellNumber) => {
  try {
    if (db) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('wellNumber', '==', wellNumber),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Retrieved ${requests.length} service requests for well: ${wellNumber}`);
      return requests;
    } else {
      // Fallback to localStorage
      const allRequests = await getAllServiceRequests();
      return allRequests.filter(request => request.wellNumber === wellNumber);
    }
  } catch (error) {
    console.error('❌ Error getting service requests by well:', error);
    throw error;
  }
};

// Get recent service requests (last 30 days)
export const getRecentServiceRequests = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateString = cutoffDate.toISOString();
    
    if (db) {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('createdAt', '>=', cutoffDateString),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Retrieved ${requests.length} recent service requests (last ${days} days)`);
      return requests;
    } else {
      // Fallback to localStorage
      const allRequests = await getAllServiceRequests();
      return allRequests.filter(request => new Date(request.createdAt) >= cutoffDate);
    }
  } catch (error) {
    console.error('❌ Error getting recent service requests:', error);
    throw error;
  }
};

// Generate service performance analytics
export const generateServiceAnalytics = async () => {
  try {
    const allRequests = await getAllServiceRequests();
    
    const analytics = {
      totalRequests: allRequests.length,
      byStatus: {},
      byPriority: {},
      byServiceType: {},
      byMonth: {},
      averageCompletionTime: 0,
      completionRate: 0,
      mostCommonService: null,
      criticalRequestsPending: 0
    };
    
    // Initialize counters
    Object.values(SERVICE_STATUS).forEach(status => {
      analytics.byStatus[status] = 0;
    });
    
    Object.values(SERVICE_PRIORITY).forEach(priority => {
      analytics.byPriority[priority] = 0;
    });
    
    SERVICE_TYPES.forEach(type => {
      analytics.byServiceType[type] = 0;
    });
    
    // Process each request
    let totalCompletionTime = 0;
    let completedRequests = 0;
    
    allRequests.forEach(request => {
      // Count by status
      if (analytics.byStatus.hasOwnProperty(request.status)) {
        analytics.byStatus[request.status]++;
      }
      
      // Count by priority
      if (analytics.byPriority.hasOwnProperty(request.priority)) {
        analytics.byPriority[request.priority]++;
      }
      
      // Count by service type
      if (analytics.byServiceType.hasOwnProperty(request.serviceType)) {
        analytics.byServiceType[request.serviceType]++;
      }
      
      // Count by month
      const month = new Date(request.createdAt).toISOString().substring(0, 7); // YYYY-MM
      analytics.byMonth[month] = (analytics.byMonth[month] || 0) + 1;
      
      // Calculate completion time for completed requests
      if (request.status === SERVICE_STATUS.COMPLETED) {
        completedRequests++;
        const createdDate = new Date(request.createdAt);
        const completedDate = new Date(request.lastUpdated);
        const completionTime = completedDate - createdDate;
        totalCompletionTime += completionTime;
      }
      
      // Count critical pending requests
      if (request.priority === SERVICE_PRIORITY.CRITICAL && 
          request.status === SERVICE_STATUS.PENDING) {
        analytics.criticalRequestsPending++;
      }
    });
    
    // Calculate averages and rates
    if (completedRequests > 0) {
      analytics.averageCompletionTime = Math.round(
        totalCompletionTime / completedRequests / (1000 * 60 * 60 * 24)
      ); // days
    }
    
    if (allRequests.length > 0) {
      analytics.completionRate = Math.round(
        (completedRequests / allRequests.length) * 100
      );
    }
    
    // Find most common service type
    let maxCount = 0;
    Object.entries(analytics.byServiceType).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        analytics.mostCommonService = type;
      }
    });
    
    console.log('✅ Service analytics generated:', analytics);
    return analytics;
  } catch (error) {
    console.error('❌ Error generating service analytics:', error);
    throw error;
  }
};

// Search service requests
export const searchServiceRequests = async (searchQuery) => {
  try {
    const allRequests = await getAllServiceRequests();
    
    const filteredRequests = allRequests.filter(request => {
      const searchLower = searchQuery.toLowerCase();
      return (
        request.wellNumber.toLowerCase().includes(searchLower) ||
        request.serviceType.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.requestedBy.toLowerCase().includes(searchLower) ||
        request.status.toLowerCase().includes(searchLower) ||
        request.priority.toLowerCase().includes(searchLower)
      );
    });
    
    console.log(`✅ Search found ${filteredRequests.length} requests for query: "${searchQuery}"`);
    return filteredRequests;
  } catch (error) {
    console.error('❌ Error searching service requests:', error);
    throw error;
  }
};

// Get service requests statistics
export const getServiceStatistics = async () => {
  try {
    const allRequests = await getAllServiceRequests();
    const analytics = await generateServiceAnalytics();
    
    const statistics = {
      total: allRequests.length,
      pending: analytics.byStatus[SERVICE_STATUS.PENDING] || 0,
      inProgress: analytics.byStatus[SERVICE_STATUS.IN_PROGRESS] || 0,
      completed: analytics.byStatus[SERVICE_STATUS.COMPLETED] || 0,
      critical: analytics.byPriority[SERVICE_PRIORITY.CRITICAL] || 0,
      completionRate: analytics.completionRate,
      averageCompletionTime: analytics.averageCompletionTime,
      criticalRequestsPending: analytics.criticalRequestsPending,
      mostCommonService: analytics.mostCommonService,
      thisMonth: Object.entries(analytics.byMonth)
        .filter(([month]) => month === new Date().toISOString().substring(0, 7))
        .reduce((sum, [, count]) => sum + count, 0)
    };
    
    console.log('✅ Service statistics calculated:', statistics);
    return statistics;
  } catch (error) {
    console.error('❌ Error getting service statistics:', error);
    throw error;
  }
};

export default {
  createServiceRequest,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceRequestsByStatus,
  getServiceRequestsByPriority,
  getServiceRequestsByWell,
  getRecentServiceRequests,
  generateServiceAnalytics,
  searchServiceRequests,
  getServiceStatistics,
  SERVICE_STATUS,
  SERVICE_PRIORITY,
  SERVICE_TYPES
};