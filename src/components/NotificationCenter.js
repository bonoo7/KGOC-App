// Enhanced Notification Center with Real-time Updates
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { NotificationService } from '../services/notificationService';

const NotificationCenter = ({ visible, onClose, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, system, maintenance

  const filterOptions = [
    { key: 'all', label: '📋 الكل', icon: '📋' },
    { key: 'unread', label: '🔔 غير مقروءة', icon: '🔔' },
    { key: 'system_alert', label: '⚠️ تنبيهات النظام', icon: '⚠️' },
    { key: 'maintenance_reminder', label: '🔧 تذكيرات الصيانة', icon: '🔧' }
  ];

  useEffect(() => {
    if (visible && user) {
      loadNotifications();
      // Set up real-time listener
      const unsubscribe = NotificationService.subscribeToNotifications(
        user.uid,
        (newNotifications) => {
          setNotifications(newNotifications);
          setLoading(false);
        }
      );

      return () => unsubscribe && unsubscribe();
    }
  }, [visible, user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await NotificationService.getUserNotifications(user.uid, 100);  
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('خطأ', 'فشل في تحميل الإشعارات');
    } finally {  
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'حذف الإشعار',
      'هل تريد حذف هذا الإشعار؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.deleteNotification(notificationId);
              setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            } catch (error) {
              Alert.alert('خطأ', 'فشل في حذف الإشعار');
            }
          }
        }
      ]
    );
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = filteredNotifications.filter(notif => !notif.read);
      const promises = unreadNotifications.map(notif => 
        NotificationService.markAsRead(notif.id)
      );
      
      await Promise.all(promises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      
      Alert.alert('تم', 'تم تمييز جميع الإشعارات كمقروءة');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الإشعارات');
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(notif => !notif.read);
    return notifications.filter(notif => notif.type === filter);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(notif => !notif.read).length;

  const getNotificationIcon = (type, priority) => {
    const icons = {
      'service_request': '🔧',
      'maintenance_reminder': '⏰',
      'system_alert': '⚠️',
      'status_update': '📝',
      'emergency': '🚨'
    };
    
    if (priority === 'critical' || priority === 'high') {
      return '🚨';
    }
    
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#4CAF50',
      'medium': '#FF9800',
      'high': '#F44336',
      'critical': '#9C27B0'
    };
    return colors[priority] || '#666';
  };

  const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar-SA');
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => !item.read && markAsRead(item.id)}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIconContainer}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.type, item.priority)}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !item.read && styles.unreadTitle
          ]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={3}>
            {item.message}
          </Text>
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(item.createdAt)}
            </Text>
            {item.priority && (
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) }
              ]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🔔 مركز الإشعارات</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            onPress={markAllAsRead} 
            style={styles.markAllButton}
            disabled={unreadCount === 0}
          >
            <Text style={[
              styles.markAllButtonText,
              unreadCount === 0 && styles.disabledButtonText
            ]}>
              تمييز الكل
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  filter === item.key && styles.activeFilterTab
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text style={[
                  styles.filterTabText,
                  filter === item.key && styles.activeFilterTabText
                ]}>
                  {item.label}
                </Text>
                {item.key === 'unread' && unreadCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Notifications List */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9800" />
              <Text style={styles.loadingText}>جاري تحميل الإشعارات...</Text>
            </View>
          ) : filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptyText}>
                {filter === 'unread' 
                  ? 'جميع الإشعارات مقروءة' 
                  : 'لم يتم العثور على إشعارات'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotificationItem}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#FF9800']}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF9800',
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#ccc',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#FF9800',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterBadge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  notificationIconContainer: {
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationCenter;