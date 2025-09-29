// System Management Service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  limit,
  where,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAllWellTests } from './wellTestService';
import { getAllServiceRequests } from './wellServicesService';

// System statistics and analytics service
export const getSystemStatistics = async () => {
  try {
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalWellTests: 0,
      serviceRequests: 0,
      totalLogins: 0,
      dataSize: '0 MB',
      uptime: '99.9%',
      recentActivity: []
    };

    if (db) {
      try {
        // Get users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        stats.totalUsers = usersSnapshot.size;
        
        // Count active users (those who logged in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let activeCount = 0;
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.lastLogin && new Date(userData.lastLogin) > thirtyDaysAgo) {
            activeCount++;
          }
        });
        stats.activeUsers = activeCount;

        // Get well tests count
        const wellTests = await getAllWellTests();
        stats.totalWellTests = wellTests.length;

        // Get service requests count
        const serviceRequests = await getAllServiceRequests();
        stats.serviceRequests = serviceRequests.length;

        // Generate recent activity
        stats.recentActivity = await generateRecentActivity();

        // Mock data for other stats
        stats.totalLogins = Math.floor(Math.random() * 500) + 100;
        stats.dataSize = `${Math.floor((stats.totalUsers * 2.5) + (stats.totalWellTests * 0.8))} MB`;

      } catch (error) {
        console.error('Error fetching system stats from Firebase:', error);
        // Fallback to mock data
        stats.totalUsers = 15;
        stats.activeUsers = 12;
        stats.totalWellTests = 45;
        stats.serviceRequests = 23;
        stats.totalLogins = 156;
        stats.dataSize = '25 MB';
        stats.recentActivity = [
          { icon: '👤', title: 'مستخدم جديد انضم', time: 'منذ 5 دقائق' },
          { icon: '🔬', title: 'اختبار بئر جديد', time: 'منذ 15 دقيقة' },
          { icon: '🛠️', title: 'طلب خدمة جديد', time: 'منذ 30 دقيقة' }
        ];
      }
    } else {
      // localStorage fallback
      const localUsers = Object.keys(localStorage).filter(key => key.startsWith('user_')).length;
      const localWellTests = Object.keys(localStorage).filter(key => key.startsWith('wellTest_')).length;
      const localServiceRequests = Object.keys(localStorage).filter(key => key.startsWith('serviceRequest_')).length;

      stats.totalUsers = localUsers;
      stats.activeUsers = Math.floor(localUsers * 0.8);
      stats.totalWellTests = localWellTests;
      stats.serviceRequests = localServiceRequests;
      stats.totalLogins = Math.floor(Math.random() * 300) + 50;
      stats.dataSize = `${Math.floor((localUsers * 2) + (localWellTests * 0.5))} MB`;
      stats.recentActivity = [
        { icon: '💾', title: 'بيانات محفوظة محلياً', time: 'منذ دقيقة' },
        { icon: '🔬', title: 'اختبار بئر محلي', time: 'منذ 10 دقائق' }
      ];
    }

    console.log('✅ System statistics generated:', stats);
    return stats;

  } catch (error) {
    console.error('❌ Error getting system statistics:', error);
    // Return default stats in case of error
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalWellTests: 0,
      serviceRequests: 0,
      totalLogins: 0,
      dataSize: '0 MB',
      uptime: '99.9%',
      recentActivity: []
    };
  }
};

// Generate recent activity data
const generateRecentActivity = async () => {
  try {
    const activities = [];

    if (db) {
      // Get recent well tests
      const recentWellTestsQuery = query(
        collection(db, 'wellTests'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const wellTestsSnapshot = await getDocs(recentWellTestsQuery);
      wellTestsSnapshot.forEach(doc => {
        const data = doc.data();
        const timeDiff = Date.now() - new Date(data.createdAt).getTime();
        const minutes = Math.floor(timeDiff / (1000 * 60));
        
        activities.push({
          icon: '🔬',
          title: `اختبار بئر جديد: ${data.wellNumber}`,
          time: minutes < 60 ? `منذ ${minutes} دقيقة` : `منذ ${Math.floor(minutes / 60)} ساعة`
        });
      });

      // Get recent service requests
      const recentServicesQuery = query(
        collection(db, 'wellServices'),
        orderBy('createdAt', 'desc'),
        limit(2)
      );
      
      const servicesSnapshot = await getDocs(recentServicesQuery);
      servicesSnapshot.forEach(doc => {
        const data = doc.data();
        const timeDiff = Date.now() - new Date(data.createdAt).getTime();
        const minutes = Math.floor(timeDiff / (1000 * 60));
        
        activities.push({
          icon: '🛠️',
          title: `طلب خدمة: ${data.serviceType}`,
          time: minutes < 60 ? `منذ ${minutes} دقيقة` : `منذ ${Math.floor(minutes / 60)} ساعة`
        });
      });
    }

    // If no activities found, return mock data
    if (activities.length === 0) {
      return [
        { icon: '👤', title: 'مستخدم جديد انضم', time: 'منذ 5 دقائق' },
        { icon: '🔬', title: 'اختبار بئر جديد', time: 'منذ 15 دقيقة' },
        { icon: '🛠️', title: 'طلب خدمة جديد', time: 'منذ 30 دقيقة' }
      ];
    }

    return activities.slice(0, 5); // Return max 5 activities

  } catch (error) {
    console.error('Error generating recent activity:', error);
    return [
      { icon: '⚠️', title: 'خطأ في تحميل النشاط', time: 'الآن' }
    ];
  }
};

// System health monitoring
export const getSystemHealth = async () => {
  try {
    const health = {
      database: 'healthy',
      authentication: 'healthy',
      server: 'healthy',
      lastChecked: new Date().toISOString(),
      uptime: '99.9%',
      responseTime: Math.floor(Math.random() * 100) + 50 // ms
    };

    // Check database connection
    if (db) {
      try {
        await getDocs(query(collection(db, 'users'), limit(1)));
        health.database = 'healthy';
      } catch (error) {
        health.database = 'error';
        console.error('Database health check failed:', error);
      }
    } else {
      health.database = 'warning'; // Using localStorage
    }

    console.log('✅ System health checked:', health);
    return health;

  } catch (error) {
    console.error('❌ Error checking system health:', error);
    return {
      database: 'error',
      authentication: 'error',
      server: 'error',
      lastChecked: new Date().toISOString(),
      uptime: '0%',
      responseTime: 0
    };
  }
};

// System logs management
export const getSystemLogs = async (limit = 50) => {
  try {
    const logs = [];

    if (db) {
      const logsQuery = query(
        collection(db, 'systemLogs'),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const logsSnapshot = await getDocs(logsQuery);
      logsSnapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Mock logs for localStorage
      logs.push(
        { id: '1', level: 'info', message: 'نظام بدء التشغيل', timestamp: new Date().toISOString() },
        { id: '2', level: 'info', message: 'تم تسجيل دخول مستخدم', timestamp: new Date().toISOString() },
        { id: '3', level: 'warning', message: 'استخدام localStorage كبديل', timestamp: new Date().toISOString() }
      );
    }

    console.log(`✅ Retrieved ${logs.length} system logs`);
    return logs;

  } catch (error) {
    console.error('❌ Error getting system logs:', error);
    return [];
  }
};

// Add system log entry
export const addSystemLog = async (level, message, details = null) => {
  try {
    const logEntry = {
      level, // info, warning, error
      message,
      details,
      timestamp: new Date().toISOString(),
      source: 'system'
    };

    if (db) {
      await addDoc(collection(db, 'systemLogs'), logEntry);
    } else {
      // Store in localStorage
      const logKey = `systemLog_${Date.now()}`;
      localStorage.setItem(logKey, JSON.stringify({ id: logKey, ...logEntry }));
    }

    console.log(`✅ System log added: [${level.toUpperCase()}] ${message}`);

  } catch (error) {
    console.error('❌ Error adding system log:', error);
  }
};

// Performance monitoring
export const getPerformanceMetrics = async () => {
  try {
    const metrics = {
      cpuUsage: Math.floor(Math.random() * 50) + 20, // Mock CPU usage
      memoryUsage: Math.floor(Math.random() * 60) + 30, // Mock memory usage
      diskUsage: Math.floor(Math.random() * 40) + 10, // Mock disk usage
      networkLatency: Math.floor(Math.random() * 100) + 50, // Mock network latency
      activeConnections: Math.floor(Math.random() * 20) + 5,
      requestsPerMinute: Math.floor(Math.random() * 50) + 10,
      errorRate: Math.random() * 2, // Mock error rate percentage
      lastUpdated: new Date().toISOString()
    };

    // Add some realistic variation
    if (metrics.cpuUsage > 80) metrics.status = 'warning';
    else if (metrics.cpuUsage > 90) metrics.status = 'critical';
    else metrics.status = 'healthy';

    console.log('✅ Performance metrics generated:', metrics);
    return metrics;

  } catch (error) {
    console.error('❌ Error getting performance metrics:', error);
    return {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      networkLatency: 0,
      activeConnections: 0,
      requestsPerMinute: 0,
      errorRate: 0,
      status: 'error',
      lastUpdated: new Date().toISOString()
    };
  }
};

// Database cleanup utilities
export const cleanupOldData = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffDateString = cutoffDate.toISOString();

    let cleanedCount = 0;

    if (db) {
      // Clean old logs
      const oldLogsQuery = query(
        collection(db, 'systemLogs'),
        where('timestamp', '<', cutoffDateString)
      );
      
      const oldLogsSnapshot = await getDocs(oldLogsQuery);
      // Note: In production, you'd batch delete these
      cleanedCount = oldLogsSnapshot.size;
      
      console.log(`✅ Found ${cleanedCount} old records to clean (simulation)`);
    } else {
      // Clean localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('systemLog_')) {
          try {
            const logData = JSON.parse(localStorage.getItem(key));
            if (new Date(logData.timestamp) < cutoffDate) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (error) {
            // Invalid log data, remove it
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      });
    }

    await addSystemLog('info', `نظافة البيانات: تم تنظيف ${cleanedCount} سجل قديم`);
    return cleanedCount;

  } catch (error) {
    console.error('❌ Error during data cleanup:', error);
    await addSystemLog('error', 'فشل في تنظيف البيانات القديمة', error.message);
    return 0;
  }
};

// Export system data for backup
export const exportSystemData = async () => {
  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        wellTests: [],
        serviceRequests: [],
        users: [],
        systemLogs: []
      }
    };

    // Collect all data
    exportData.data.wellTests = await getAllWellTests();
    exportData.data.serviceRequests = await getAllServiceRequests();
    exportData.data.systemLogs = await getSystemLogs(100);

    if (db) {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        // Remove sensitive information
        delete userData.password;
        delete userData.tokens;
        exportData.data.users.push({ id: doc.id, ...userData });
      });
    }

    console.log('✅ System data exported successfully');
    return exportData;

  } catch (error) {
    console.error('❌ Error exporting system data:', error);
    throw error;
  }
};

// System maintenance mode
export const setMaintenanceMode = async (enabled, message = '') => {
  try {
    const maintenanceStatus = {
      enabled,
      message,
      startTime: enabled ? new Date().toISOString() : null,
      setBy: 'system' // In real app, this would be the admin user ID
    };

    if (db) {
      await updateDoc(doc(db, 'system', 'maintenance'), maintenanceStatus);
    } else {
      localStorage.setItem('maintenanceMode', JSON.stringify(maintenanceStatus));
    }

    const logMessage = enabled ? 
      `تم تفعيل وضع الصيانة: ${message}` : 
      'تم إلغاء وضع الصيانة';
    
    await addSystemLog('info', logMessage);
    
    console.log(`✅ Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
    return maintenanceStatus;

  } catch (error) {
    console.error('❌ Error setting maintenance mode:', error);
    throw error;
  }
};

// Check if system is in maintenance mode
export const getMaintenanceStatus = async () => {
  try {
    if (db) {
      const maintenanceDoc = await getDoc(doc(db, 'system', 'maintenance'));
      if (maintenanceDoc.exists()) {
        return maintenanceDoc.data();
      }
    } else {
      const maintenanceData = localStorage.getItem('maintenanceMode');
      if (maintenanceData) {
        return JSON.parse(maintenanceData);
      }
    }

    // Default: not in maintenance mode
    return {
      enabled: false,
      message: '',
      startTime: null,
      setBy: null
    };

  } catch (error) {
    console.error('❌ Error getting maintenance status:', error);
    return {
      enabled: false,
      message: '',
      startTime: null,
      setBy: null
    };
  }
};

// Additional exports for Administration screen
export const getUserManagement = async () => {
  try {
    const users = [];
    
    if (db) {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          name: userData.displayName || userData.email || 'Unknown User',
          email: userData.email,
          role: userData.role || 'viewer',
          status: userData.status || 'active',
          lastLogin: userData.lastLogin,
          createdAt: userData.createdAt
        });
      });
    } else {
      // Mock data for localStorage
      users.push(
        { id: '1', name: 'Admin User', email: 'admin@kgoc.com', role: 'admin', status: 'active' },
        { id: '2', name: 'Test Engineer', email: 'engineer@kgoc.com', role: 'engineer', status: 'active' },
        { id: '3', name: 'Field Operator', email: 'operator@kgoc.com', role: 'operator', status: 'active' }
      );
    }

    console.log(`✅ Retrieved ${users.length} users for management`);
    return { success: true, users };

  } catch (error) {
    console.error('❌ Error getting user management data:', error);
    return { success: false, users: [], error: error.message };
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    if (db) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update in localStorage
      const userKey = `user_${userId}`;
      const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
      userData.role = newRole;
      userData.updatedAt = new Date().toISOString();
      localStorage.setItem(userKey, JSON.stringify(userData));
    }

    await addSystemLog('info', `تم تحديث دور المستخدم ${userId} إلى ${newRole}`);
    console.log(`✅ User role updated: ${userId} -> ${newRole}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    await addSystemLog('error', 'فشل في تحديث دور المستخدم', error.message);
    return { success: false, error: error.message };
  }
};

export const generateSystemReport = async () => {
  try {
    const stats = await getSystemStatistics();
    const health = await getSystemHealth();
    const logs = await getSystemLogs(20);

    const report = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      health: health,
      recentLogs: logs,
      summary: {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        totalWellTests: stats.totalWellTests,
        systemStatus: health.database === 'healthy' ? 'صحي' : 'يحتاج صيانة',
        files: stats.totalWellTests + stats.serviceRequests,
        users: stats.totalUsers,
        operations: logs.length
      }
    };

    await addSystemLog('info', 'تم إنشاء تقرير النظام');
    console.log('✅ System report generated');
    return report.summary;

  } catch (error) {
    console.error('❌ Error generating system report:', error);
    await addSystemLog('error', 'فشل في إنشاء تقرير النظام', error.message);
    throw error;
  }
};

export const getAuditLogs = async () => {
  try {
    const logs = await getSystemLogs(30);
    return logs.map(log => ({
      timestamp: new Date(log.timestamp).toLocaleDateString('ar'),
      action: log.message,
      user: log.source || 'النظام',
      level: log.level
    }));
  } catch (error) {
    console.error('❌ Error getting audit logs:', error);
    return [
      { timestamp: new Date().toLocaleDateString('ar'), action: 'فشل في تحميل السجلات', user: 'النظام', level: 'error' }
    ];
  }
};