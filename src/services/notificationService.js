// Notification Management Service
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

const COLLECTION_NAME = 'notifications';

// Notification types
export const NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  MAINTENANCE: 'maintenance',
  ALERT: 'alert',
  UPDATE: 'update',
  REMINDER: 'reminder',
  WELL_TEST: 'well_test',
  SERVICE_REQUEST: 'service_request',
  PERFORMANCE: 'performance',
  SAFETY: 'safety'
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Enhanced Notification Service Class
export class NotificationService {
  
  // Create a new notification
  static async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        id: notificationData.id || `notif_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
        status: 'active',
        expiresAt: notificationData.expiresAt || null
      };

      if (db) {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), notification);
        console.log('✅ Notification created with ID:', docRef.id);
        return { success: true, id: docRef.id, notification };
      } else {
        // localStorage fallback
        const notifKey = `notification_${notification.id}`;
        localStorage.setItem(notifKey, JSON.stringify(notification));
        console.log('✅ Notification stored locally:', notification.id);
        return { success: true, id: notification.id, notification };
      }

    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all notifications for a user
  static async getUserNotifications(userId, limit = 50) {
    try {
      const notifications = [];

      if (db) {
        const notifQuery = query(
          collection(db, COLLECTION_NAME),
          where('targetUser', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(limit)
        );
        
        const snapshot = await getDocs(notifQuery);
        snapshot.forEach(doc => {
          notifications.push({ id: doc.id, ...doc.data() });
        });
      } else {
        // localStorage fallback
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('notification_')
        );
        
        keys.forEach(key => {
          try {
            const notification = JSON.parse(localStorage.getItem(key));
            if (notification.targetUser === userId) {
              notifications.push(notification);
            }
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });

        // Sort by creation date
        notifications.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      }

      // Filter out expired notifications
      const activeNotifications = notifications.filter(notif => 
        !notif.expiresAt || new Date(notif.expiresAt) > new Date()
      );

      console.log(`✅ Retrieved ${activeNotifications.length} notifications for user ${userId}`);
      return { success: true, notifications: activeNotifications };

    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      return { success: false, notifications: [], error: error.message };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      if (db) {
        const notifRef = doc(db, COLLECTION_NAME, notificationId);
        await updateDoc(notifRef, { 
          isRead: true,
          readAt: new Date().toISOString()
        });
      } else {
        // localStorage fallback
        const notifKey = `notification_${notificationId}`;
        const notification = JSON.parse(localStorage.getItem(notifKey) || '{}');
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        localStorage.setItem(notifKey, JSON.stringify(notification));
      }

      console.log('✅ Notification marked as read:', notificationId);
      return { success: true };

    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      if (db) {
        await deleteDoc(doc(db, COLLECTION_NAME, notificationId));
      } else {
        // localStorage fallback
        const notifKey = `notification_${notificationId}`;
        localStorage.removeItem(notifKey);
      }

      console.log('✅ Notification deleted:', notificationId);
      return { success: true };

    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Create system alert for critical issues
  static async createSystemAlert(title, message, priority = 'high', targetUsers = []) {
    const alertData = {
      type: NOTIFICATION_TYPES.ALERT,
      priority: priority,
      title: title,
      message: message,
      targetUser: 'all', // Broadcast to all users
      targetUsers: targetUsers,
      icon: '⚠️',
      color: this.getPriorityColor(priority),
      requiresAction: true,
      createdBy: 'system'
    };

    return await this.createNotification(alertData);
  }

  // Create maintenance reminder
  static async createMaintenanceReminder(wellNumber, maintenanceType, scheduledDate, targetUser) {
    const reminderData = {
      type: NOTIFICATION_TYPES.MAINTENANCE,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: `Maintenance Reminder - Well ${wellNumber}`,
      message: `${maintenanceType} scheduled for ${scheduledDate}`,
      targetUser: targetUser,
      wellNumber: wellNumber,
      maintenanceType: maintenanceType,
      scheduledDate: scheduledDate,
      icon: '🔧',
      color: '#FF9800',
      requiresAction: false
    };

    return await this.createNotification(reminderData);
  }

  // Create well test notification
  static async createWellTestNotification(wellNumber, testType, result, targetUser) {
    const priority = result === 'anomaly' ? NOTIFICATION_PRIORITIES.HIGH : NOTIFICATION_PRIORITIES.LOW;
    
    const testData = {
      type: NOTIFICATION_TYPES.WELL_TEST,
      priority: priority,
      title: `Well Test ${result === 'completed' ? 'Completed' : 'Alert'} - ${wellNumber}`,
      message: `${testType} test ${result} for well ${wellNumber}`,
      targetUser: targetUser,
      wellNumber: wellNumber,
      testType: testType,
      result: result,
      icon: result === 'anomaly' ? '🚨' : '🔬',
      color: this.getPriorityColor(priority),
      requiresAction: result === 'anomaly'
    };

    return await this.createNotification(testData);
  }

  // Create service request notification
  static async createServiceRequestNotification(requestId, wellNumber, serviceType, status, targetUser) {
    const serviceData = {
      type: NOTIFICATION_TYPES.SERVICE_REQUEST,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: `Service Request ${status} - ${wellNumber}`,
      message: `${serviceType} request ${status} for well ${wellNumber}`,
      targetUser: targetUser,
      requestId: requestId,
      wellNumber: wellNumber,
      serviceType: serviceType,
      status: status,
      icon: '🛠️',
      color: this.getStatusColor(status),
      requiresAction: status === 'approved'
    };

    return await this.createNotification(serviceData);
  }

  // Create performance alert
  static async createPerformanceAlert(wellNumber, metric, value, threshold, targetUser) {
    const alertData = {
      type: NOTIFICATION_TYPES.PERFORMANCE,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: `Performance Alert - ${wellNumber}`,
      message: `${metric} is ${value}, exceeding threshold of ${threshold}`,
      targetUser: targetUser,
      wellNumber: wellNumber,
      metric: metric,
      value: value,
      threshold: threshold,
      icon: '📊',
      color: '#F44336',
      requiresAction: true
    };

    return await this.createNotification(alertData);
  }

  // Send bulk notifications
  static async sendBulkNotifications(notifications) {
    try {
      const results = [];
      
      for (const notificationData of notifications) {
        const result = await this.createNotification(notificationData);
        results.push(result);
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Sent ${successCount}/${notifications.length} bulk notifications`);
      
      return { 
        success: true, 
        results,
        successCount,
        totalCount: notifications.length
      };

    } catch (error) {
      console.error('❌ Error sending bulk notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread notification count for user
  static async getUnreadCount(userId) {
    try {
      const result = await this.getUserNotifications(userId);
      if (result.success) {
        const unreadCount = result.notifications.filter(notif => !notif.isRead).length;
        return { success: true, count: unreadCount };
      }
      return { success: false, count: 0 };

    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return { success: false, count: 0, error: error.message };
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      let cleanedCount = 0;

      if (db) {
        const oldNotifQuery = query(
          collection(db, COLLECTION_NAME),
          where('createdAt', '<', cutoffDate.toISOString())
        );
        
        const snapshot = await getDocs(oldNotifQuery);
        
        // In production, use batch delete
        for (const docSnapshot of snapshot.docs) {
          await deleteDoc(docSnapshot.ref);
          cleanedCount++;
        }
      } else {
        // localStorage cleanup
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('notification_')
        );
        
        keys.forEach(key => {
          try {
            const notification = JSON.parse(localStorage.getItem(key));
            if (new Date(notification.createdAt) < cutoffDate) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          } catch (error) {
            // Invalid notification, remove it
            localStorage.removeItem(key);
            cleanedCount++;
          }
        });
      }

      console.log(`✅ Cleaned up ${cleanedCount} old notifications`);
      return { success: true, cleanedCount };

    } catch (error) {
      console.error('❌ Error cleaning up old notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule periodic notifications
  static async schedulePeriodicNotification(notificationData, intervalDays = 7) {
    try {
      // Create initial notification
      const result = await this.createNotification(notificationData);
      
      if (result.success) {
        // Store schedule info (in real app, would use task scheduler)
        const scheduleData = {
          notificationId: result.id,
          intervalDays: intervalDays,
          nextRun: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          originalData: notificationData
        };

        if (db) {
          await addDoc(collection(db, 'notification_schedules'), scheduleData);
        } else {
          localStorage.setItem(
            `schedule_${result.id}`, 
            JSON.stringify(scheduleData)
          );
        }

        console.log('✅ Periodic notification scheduled:', result.id);
        return { success: true, scheduleId: result.id };
      }

      return result;

    } catch (error) {
      console.error('❌ Error scheduling periodic notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to get priority color
  static getPriorityColor(priority) {
    const colors = {
      [NOTIFICATION_PRIORITIES.LOW]: '#4CAF50',
      [NOTIFICATION_PRIORITIES.MEDIUM]: '#FF9800',
      [NOTIFICATION_PRIORITIES.HIGH]: '#F44336',
      [NOTIFICATION_PRIORITIES.CRITICAL]: '#9C27B0'
    };
    return colors[priority] || '#666';
  }

  // Helper method to get status color
  static getStatusColor(status) {
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      in_progress: '#2196F3',
      completed: '#4CAF50',
      cancelled: '#F44336',
      on_hold: '#9E9E9E'
    };
    return colors[status] || '#666';
  }
}

// Real-time notification system (mock implementation)
export class RealTimeNotificationService {
  
  static listeners = new Map();

  // Subscribe to real-time notifications
  static subscribe(userId, callback) {
    this.listeners.set(userId, callback);
    console.log(`✅ User ${userId} subscribed to real-time notifications`);
    
    // Simulate periodic updates
    const interval = setInterval(async () => {
      const result = await NotificationService.getUserNotifications(userId, 5);
      if (result.success && this.listeners.has(userId)) {
        callback(result.notifications);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      this.listeners.delete(userId);
      console.log(`✅ User ${userId} unsubscribed from real-time notifications`);
    };
  }

  // Broadcast notification to all subscribers
  static async broadcast(notification) {
    const result = await NotificationService.createNotification({
      ...notification,
      targetUser: 'all'
    });

    if (result.success) {
      // Notify all active listeners
      this.listeners.forEach((callback, userId) => {
        callback([result.notification]);
      });
    }

    return result;
  }
}

export default NotificationService;

      if (db) {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), notification);
        console.log('✅ Notification created with ID:', docRef.id);
        return docRef.id;
      } else {
        // Fallback to localStorage
        const localKey = notification.id;
        localStorage.setItem(`notification_${localKey}`, JSON.stringify(notification));
        console.log('✅ Notification saved to localStorage:', localKey);
        return localKey;
      }
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Get all notifications
  static async getAllNotifications() {
    try {
      if (db) {
        const q = query(
          collection(db, COLLECTION_NAME),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`✅ Retrieved ${notifications.length} notifications from Firestore`);
        return notifications;
      } else {
        // Fallback to localStorage
        const notifications = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
          if (key.startsWith('notification_')) {
            try {
              const notification = JSON.parse(localStorage.getItem(key));
              notifications.push(notification);
            } catch (error) {
              console.error('Error parsing notification from localStorage:', error);
            }
          }
        });
        
        // Sort by creation date (newest first)
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        console.log(`✅ Retrieved ${notifications.length} notifications from localStorage`);
        return notifications;
      }
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      throw error;
    }
  }

  // Get notifications for a specific user
  static async getUserNotifications(userId) {
    try {
      const allNotifications = await this.getAllNotifications();
      
      // Filter notifications for this user or system-wide notifications
      const userNotifications = allNotifications.filter(notification => {
        return notification.targetUsers === 'all' || 
               notification.targetUsers === userId ||
               (Array.isArray(notification.targetUsers) && notification.targetUsers.includes(userId));
      });
      
      console.log(`✅ Retrieved ${userNotifications.length} notifications for user: ${userId}`);
      return userNotifications;
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count for user
  static async getUnreadCount(userId) {
    try {
      const userNotifications = await this.getUserNotifications(userId);
      const unreadCount = userNotifications.filter(notification => !notification.isRead).length;
      
      console.log(`✅ User ${userId} has ${unreadCount} unread notifications`);
      return unreadCount;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      if (db) {
        const docRef = doc(db, COLLECTION_NAME, notificationId);
        await updateDoc(docRef, { 
          isRead: true,
          readAt: new Date().toISOString(),
          readBy: userId
        });
        console.log('✅ Notification marked as read:', notificationId);
      } else {
        // Fallback to localStorage
        const notificationKey = `notification_${notificationId}`;
        const existingNotification = localStorage.getItem(notificationKey);
        
        if (existingNotification) {
          const notification = JSON.parse(existingNotification);
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          notification.readBy = userId;
          
          localStorage.setItem(notificationKey, JSON.stringify(notification));
          console.log('✅ Notification marked as read in localStorage:', notificationId);
        }
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId) {
    try {
      if (db) {
        await deleteDoc(doc(db, COLLECTION_NAME, notificationId));
        console.log('✅ Notification deleted:', notificationId);
      } else {
        // Fallback to localStorage
        const notificationKey = `notification_${notificationId}`;
        localStorage.removeItem(notificationKey);
        console.log('✅ Notification deleted from localStorage:', notificationId);
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  // Create system notification
  static async createSystemNotification(title, message, priority = NOTIFICATION_PRIORITIES.MEDIUM) {
    return await this.createNotification({
      title,
      message,
      type: NOTIFICATION_TYPES.SYSTEM,
      priority,
      targetUsers: 'all',
      icon: '🔔',
      action: null
    });
  }

  // Create maintenance notification
  static async createMaintenanceNotification(title, message, scheduledTime) {
    return await this.createNotification({
      title,
      message,
      type: NOTIFICATION_TYPES.MAINTENANCE,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      targetUsers: 'all',
      icon: '🔧',
      scheduledTime,
      action: {
        type: 'maintenance_info',
        data: { scheduledTime }
      }
    });
  }

  // Create alert notification
  static async createAlertNotification(title, message, targetUsers, priority = NOTIFICATION_PRIORITIES.HIGH) {
    return await this.createNotification({
      title,
      message,
      type: NOTIFICATION_TYPES.ALERT,
      priority,
      targetUsers,
      icon: '⚠️',
      action: null
    });
  }

  // Create well test notification
  static async createWellTestNotification(wellNumber, action, targetUsers) {
    const title = action === 'created' ? 'اختبار بئر جديد' : 'تحديث اختبار البئر';
    const message = `${action === 'created' ? 'تم إنشاء' : 'تم تحديث'} اختبار للبئر رقم ${wellNumber}`;
    
    return await this.createNotification({
      title,
      message,
      type: NOTIFICATION_TYPES.WELL_TEST,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      targetUsers,
      icon: '🔬',
      action: {
        type: 'view_well_test',
        data: { wellNumber }
      }
    });
  }

  // Create service request notification
  static async createServiceRequestNotification(serviceType, wellNumber, status, targetUsers) {
    const title = 'تحديث طلب الخدمة';
    const message = `طلب ${serviceType} للبئر ${wellNumber} - الحالة: ${status}`;
    
    return await this.createNotification({
      title,
      message,
      type: NOTIFICATION_TYPES.SERVICE_REQUEST,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      targetUsers,
      icon: '🛠️',
      action: {
        type: 'view_service_request',
        data: { wellNumber, serviceType }
      }
    });
  }

  // Get notifications by type
  static async getNotificationsByType(type) {
    try {
      const allNotifications = await this.getAllNotifications();
      const filteredNotifications = allNotifications.filter(notification => notification.type === type);
      
      console.log(`✅ Retrieved ${filteredNotifications.length} notifications of type: ${type}`);
      return filteredNotifications;
    } catch (error) {
      console.error('❌ Error getting notifications by type:', error);
      throw error;
    }
  }

  // Get notifications by priority
  static async getNotificationsByPriority(priority) {
    try {
      const allNotifications = await this.getAllNotifications();
      const filteredNotifications = allNotifications.filter(notification => notification.priority === priority);
      
      console.log(`✅ Retrieved ${filteredNotifications.length} notifications with priority: ${priority}`);
      return filteredNotifications;
    } catch (error) {
      console.error('❌ Error getting notifications by priority:', error);
      throw error;
    }
  }

  // Send immediate notification (for real-time features)
  static async sendImmediateNotification(userId, title, message, priority = NOTIFICATION_PRIORITIES.MEDIUM) {
    try {
      // Create the notification
      const notificationId = await this.createNotification({
        title,
        message,
        type: NOTIFICATION_TYPES.ALERT,
        priority,
        targetUsers: userId,
        icon: '🔔',
        immediate: true
      });

      // In a real app, this would trigger push notifications, websocket events, etc.
      console.log(`✅ Immediate notification sent to user ${userId}: ${title}`);
      
      return notificationId;
    } catch (error) {
      console.error('❌ Error sending immediate notification:', error);
      throw error;
    }
  }

  // Bulk mark notifications as read
  static async markAllAsRead(userId) {
    try {
      const userNotifications = await this.getUserNotifications(userId);
      const unreadNotifications = userNotifications.filter(notification => !notification.isRead);
      
      for (const notification of unreadNotifications) {
        await this.markAsRead(notification.id, userId);
      }
      
      console.log(`✅ Marked ${unreadNotifications.length} notifications as read for user: ${userId}`);
      return unreadNotifications.length;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Clean old notifications
  static async cleanOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const allNotifications = await this.getAllNotifications();
      const oldNotifications = allNotifications.filter(notification => 
        new Date(notification.createdAt) < cutoffDate
      );
      
      for (const notification of oldNotifications) {
        await this.deleteNotification(notification.id);
      }
      
      console.log(`✅ Cleaned ${oldNotifications.length} old notifications`);
      return oldNotifications.length;
    } catch (error) {
      console.error('❌ Error cleaning old notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  static async getNotificationStatistics() {
    try {
      const allNotifications = await this.getAllNotifications();
      
      const stats = {
        total: allNotifications.length,
        byType: {},
        byPriority: {},
        readCount: 0,
        unreadCount: 0,
        last24Hours: 0,
        thisWeek: 0,
        thisMonth: 0
      };

      // Initialize counters
      Object.values(NOTIFICATION_TYPES).forEach(type => {
        stats.byType[type] = 0;
      });
      
      Object.values(NOTIFICATION_PRIORITIES).forEach(priority => {
        stats.byPriority[priority] = 0;
      });

      // Calculate time thresholds
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Process each notification
      allNotifications.forEach(notification => {
        const createdAt = new Date(notification.createdAt);
        
        // Count by type
        if (stats.byType.hasOwnProperty(notification.type)) {
          stats.byType[notification.type]++;
        }
        
        // Count by priority
        if (stats.byPriority.hasOwnProperty(notification.priority)) {
          stats.byPriority[notification.priority]++;
        }
        
        // Count read/unread
        if (notification.isRead) {
          stats.readCount++;
        } else {
          stats.unreadCount++;
        }
        
        // Count by time periods
        if (createdAt > last24Hours) stats.last24Hours++;
        if (createdAt > thisWeek) stats.thisWeek++;
        if (createdAt > thisMonth) stats.thisMonth++;
      });

      console.log('✅ Notification statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting notification statistics:', error);
      throw error;
    }
  }
}

// Export individual functions for easier imports
export const {
  createNotification,
  getAllNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
  createSystemNotification,
  createMaintenanceNotification,
  createAlertNotification,
  createWellTestNotification,
  createServiceRequestNotification,
  getNotificationsByType,
  getNotificationsByPriority,
  sendImmediateNotification,
  markAllAsRead,
  cleanOldNotifications,
  getNotificationStatistics
} = NotificationService;

export default NotificationService;