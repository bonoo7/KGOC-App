import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'notifications';

class NotificationService {
  static listeners = new Map();

  // Create a new notification
  static async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isRead: false
      };

      if (db) {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), notification);
        console.log('✅ Notification created with ID:', docRef.id);
        return { success: true, id: docRef.id };
      } else {
        // Fallback to localStorage
        const localKey = notification.id;
        localStorage.setItem(`notification_${localKey}`, JSON.stringify(notification));
        console.log('✅ Notification saved to localStorage:', localKey);
        return { success: true, id: localKey };
      }
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 20) {
    try {
      if (db) {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).slice(0, limit);
        
        console.log(`✅ Retrieved ${notifications.length} notifications from Firestore`);
        return { success: true, notifications };
      } else {
        // Fallback to localStorage
        const notifications = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
          if (key.startsWith('notification_')) {
            try {
              const notification = JSON.parse(localStorage.getItem(key));
              if (notification.userId === userId) {
                notifications.push(notification);
              }
            } catch (error) {
              console.error('Error parsing notification from localStorage:', error);
            }
          }
        });
        
        // Sort by creation date (newest first)
        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const limitedNotifications = notifications.slice(0, limit);
        console.log(`✅ Retrieved ${limitedNotifications.length} notifications from localStorage`);
        return { success: true, notifications: limitedNotifications };
      }
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return { success: false, error: error.message, notifications: [] };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      if (db && notificationId) {
        await updateDoc(doc(db, COLLECTION_NAME, notificationId), {
          isRead: true,
          readAt: new Date().toISOString()
        });
        console.log('✅ Notification marked as read:', notificationId);
        return { success: true };
      } else {
        // Fallback to localStorage
        const notification = JSON.parse(localStorage.getItem(`notification_${notificationId}`));
        if (notification) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          localStorage.setItem(`notification_${notificationId}`, JSON.stringify(notification));
          console.log('✅ Notification marked as read in localStorage:', notificationId);
          return { success: true };
        }
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Create system alert
  static async createSystemAlert(title, message, priority = 'medium') {
    const systemNotification = {
      title,
      message,
      priority,
      type: 'system_alert',
      userId: 'system',
      color: priority === 'high' ? '#F44336' : priority === 'medium' ? '#FF9800' : '#4CAF50'
    };

    return await this.createNotification(systemNotification);
  }

  // Subscribe to notifications (for real-time updates)
  static subscribe(userId, callback) {
    this.listeners.set(userId, callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(userId);
    };
  }

  // Notify listeners (used internally)
  static notifyListeners(userId, notifications) {
    const callback = this.listeners.get(userId);
    if (callback) {
      callback(notifications);
    }
  }
}

export default NotificationService;