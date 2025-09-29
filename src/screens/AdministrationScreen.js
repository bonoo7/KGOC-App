import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { 
  getSystemStatistics, 
  getSystemHealth, 
  getUserManagement,
  updateUserRole,
  generateSystemReport,
  getAuditLogs 
} from '../services/systemService';
import { AdvancedReportsService } from '../services/advancedReportsService';
import { NotificationService } from '../services/notificationService';

const { width } = Dimensions.get('window');

const AdministrationScreen = ({ navigation, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAIAnalytics, setShowAIAnalytics] = useState(false);
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAdvancedReports, setShowAdvancedReports] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadAdministrationData();
  }, []);

  const loadAdministrationData = async () => {
    try {
      setLoading(true);
      const [stats, health, userMgmt, logs] = await Promise.all([
        getSystemStatistics(),
        getSystemHealth(),
        getUserManagement(),
        getAuditLogs()
      ]);
      
      setSystemStats(stats);
      setSystemHealth(health);
      setUsers(userMgmt.users || []);
      setAuditLogs(logs || []);
    } catch (error) {
      console.error('Error loading administration data:', error);
      Alert.alert('خطأ', 'فشل في تحميل بيانات الإدارة');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdministrationData();
    setRefreshing(false);
  };

  const handleBack = () => {
    if (navigation?.navigate) {
      navigation.navigate('Dashboard');
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      Alert.alert('نجح', 'تم تحديث دور المستخدم بنجاح');
      loadAdministrationData();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث دور المستخدم');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      // Generate comprehensive system report
      const report = await generateSystemReport();
      
      // Generate AI analytics
      const aiReport = await AdvancedReportsService.generateWellTestInsights();
      
      const enhancedReport = {
        ...report,
        aiInsights: aiReport,
        generatedAt: new Date().toLocaleString('ar'),
        reportType: 'نظام شامل',
        sections: {
          systemHealth: 'حالة النظام',
          userActivity: 'نشاط المستخدمين',
          performance: 'مؤشرات الأداء',
          aiAnalytics: 'التحليلات الذكية'
        }
      };
      
      setReportData(enhancedReport);
      setShowAdvancedReports(true);
      
      Alert.alert(
        'تم إنشاء التقرير',
        `تقرير النظام الشامل\nالملفات: ${report.files}\nالمستخدمون: ${report.users}\nالعمليات: ${report.operations}`,
        [
          { text: 'عرض التقرير', onPress: () => setShowAdvancedReports(true) },
          { text: 'حسناً' }
        ]
      );
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إنشاء التقرير');
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalytics = async () => {
    try {
      setLoading(true);
      
      const analytics = await AdvancedReportsService.generateWellTestInsights();
      setAiAnalytics(analytics);
      setShowAIAnalytics(true);
      
    } catch (error) {
      console.error('Error generating AI analytics:', error);
      Alert.alert('خطأ', 'فشل في إنشاء التحليلات الذكية');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const result = await NotificationService.getUserNotifications(user?.uid || 'admin', 30);
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const sendSystemNotification = async (title, message, priority = 'medium') => {
    try {
      await NotificationService.createSystemAlert(title, message, priority);
      Alert.alert('تم', 'تم إرسال الإشعار بنجاح');
      loadNotifications();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إرسال الإشعار');
    }
  };

  const exportReportToPDF = async () => {
    try {
      if (!reportData) {
        Alert.alert('خطأ', 'لا يوجد تقرير للتصدير');
        return;
      }
      
      const result = await AdvancedReportsService.exportToPDF(reportData, 'system');
      
      if (result.success) {
        Alert.alert(
          'تم التصدير',
          `تم تصدير التقرير بنجاح\nاسم الملف: ${result.filename}`
        );
      } else {
        Alert.alert('خطأ', 'فشل في تصدير التقرير');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('خطأ', 'فشل في تصدير التقرير');
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>المستخدمون النشطون</Text>
          <Text style={styles.statValue}>{systemStats?.activeUsers || 0}</Text>
          <Text style={styles.statIcon}>👥</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>الطلبات اليومية</Text>
          <Text style={styles.statValue}>{systemStats?.dailyRequests || 0}</Text>
          <Text style={styles.statIcon}>📊</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>حالة الخادم</Text>
          <Text style={[styles.statValue, { color: systemHealth?.status === 'healthy' ? '#4CAF50' : '#F44336' }]}>
            {systemHealth?.status === 'healthy' ? 'سليم' : 'مشكلة'}
          </Text>
          <Text style={styles.statIcon}>🖥️</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>الذاكرة المستخدمة</Text>
          <Text style={styles.statValue}>{systemHealth?.memoryUsage || '0%'}</Text>
          <Text style={styles.statIcon}>💾</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport}>
          <Text style={styles.actionButtonText}>📋 تقرير النظام الشامل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={generateAIAnalytics}>
          <Text style={styles.actionButtonText}>🤖 التحليلات الذكية</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('users')}>
          <Text style={styles.actionButtonText}>👥 إدارة المستخدمين</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          loadNotifications();
          setShowNotificationCenter(true);
        }}>
          <Text style={styles.actionButtonText}>🔔 مركز الإشعارات</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('logs')}>
          <Text style={styles.actionButtonText}>📄 سجلات التدقيق</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]} 
          onPress={() => sendSystemNotification('اختبار النظام', 'هذا إشعار تجريبي من لوحة الإدارة')}
        >
          <Text style={styles.actionButtonText}>📢 إرسال إشعار تجريبي</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUsersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>إدارة المستخدمين</Text>
      {users.map((user, index) => (
        <View key={index} style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userRole}>الدور: {user.role}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setSelectedUser(user);
              setModalVisible(true);
            }}
          >
            <Text style={styles.editButtonText}>تعديل</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderLogsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>سجلات التدقيق</Text>
      {auditLogs.map((log, index) => (
        <View key={index} style={styles.logCard}>
          <Text style={styles.logTime}>{log.timestamp}</Text>
          <Text style={styles.logAction}>{log.action}</Text>
          <Text style={styles.logUser}>المستخدم: {log.user}</Text>
        </View>
      ))}
    </View>
  );

  const renderUserModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>تعديل دور المستخدم</Text>
          {selectedUser && (
            <>
              <Text style={styles.modalUserName}>{selectedUser.name}</Text>
              <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
              
              <View style={styles.rolesContainer}>
                {['admin', 'manager', 'operator', 'viewer', 'engineer', 'technician'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      selectedUser.role === role && styles.selectedRoleButton
                    ]}
                    onPress={() => handleUserRoleUpdate(selectedUser.id, role)}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      selectedUser.role === role && styles.selectedRoleButtonText
                    ]}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>جاري تحميل بيانات الإدارة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← العودة</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>لوحة الإدارة</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            نظرة عامة
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            المستخدمون
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            السجلات
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'logs' && renderLogsTab()}
      </ScrollView>

      {renderUserModal()}

      {/* AI Analytics Modal */}
      <Modal
        visible={showAIAnalytics}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🤖 التحليلات الذكية</Text>
            
            <ScrollView style={styles.analyticsContent}>
              {aiAnalytics && (
                <>
                  <View style={styles.analyticsSection}>
                    <Text style={styles.analyticsSectionTitle}>📊 الإحصائيات العامة</Text>
                    <Text style={styles.analyticsText}>إجمالي الاختبارات: {aiAnalytics.totalTests}</Text>
                    <Text style={styles.analyticsText}>متوسط معدل التدفق: {aiAnalytics.averageFlowRate} برميل/يوم</Text>
                    <Text style={styles.analyticsText}>متوسط معدل الغاز: {aiAnalytics.averageGasRate} قدم³/يوم</Text>
                    <Text style={styles.analyticsText}>متوسط نسبة الماء: {aiAnalytics.averageWaterCut}%</Text>
                  </View>

                  <View style={styles.analyticsSection}>
                    <Text style={styles.analyticsSectionTitle}>📈 التوجهات</Text>
                    {aiAnalytics.trends.map((trend, index) => (
                      <View key={index} style={styles.trendItem}>
                        <Text style={styles.trendIcon}>{trend.icon}</Text>
                        <View style={styles.trendInfo}>
                          <Text style={styles.trendMetric}>{trend.metric}</Text>
                          <Text style={styles.trendDirection}>{trend.trend} ({trend.change}%)</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.analyticsSection}>
                    <Text style={styles.analyticsSectionTitle}>💡 التوصيات الذكية</Text>
                    {aiAnalytics.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Text style={styles.recommendationIcon}>{rec.icon}</Text>
                        <View style={styles.recommendationInfo}>
                          <Text style={styles.recommendationTitle}>{rec.title}</Text>
                          <Text style={styles.recommendationDescription}>{rec.description}</Text>
                          <Text style={styles.recommendationAction}>الإجراء: {rec.action}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAIAnalytics(false)}
            >
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notification Center Modal */}
      <Modal
        visible={showNotificationCenter}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔔 مركز الإشعارات</Text>
            
            <ScrollView style={styles.notificationsContent}>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotifications}>
                  <Text style={styles.emptyNotificationsText}>لا توجد إشعارات</Text>
                </View>
              ) : (
                notifications.map((notification, index) => (
                  <View key={index} style={[
                    styles.notificationItem,
                    !notification.isRead && styles.unreadNotification
                  ]}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationTime}>
                        {new Date(notification.createdAt).toLocaleDateString('ar')}
                      </Text>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <View style={styles.notificationPriority}>
                      <Text style={[
                        styles.priorityBadge,
                        { backgroundColor: notification.color || '#666' }
                      ]}>
                        {notification.priority || 'متوسط'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowNotificationCenter(false)}
            >
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Advanced Reports Modal */}
      <Modal
        visible={showAdvancedReports}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.reportHeader}>
              <Text style={styles.modalTitle}>📊 التقرير الشامل</Text>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={exportReportToPDF}
              >
                <Text style={styles.exportButtonText}>📄 تصدير PDF</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.reportContent}>
              {reportData && (
                <>
                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>📋 معلومات التقرير</Text>
                    <Text style={styles.reportText}>تاريخ الإنشاء: {reportData.generatedAt}</Text>
                    <Text style={styles.reportText}>نوع التقرير: {reportData.reportType}</Text>
                  </View>

                  <View style={styles.reportSection}>
                    <Text style={styles.reportSectionTitle}>📊 الإحصائيات الأساسية</Text>
                    <Text style={styles.reportText}>المستخدمون: {reportData.users}</Text>
                    <Text style={styles.reportText}>الملفات: {reportData.files}</Text>
                    <Text style={styles.reportText}>العمليات: {reportData.operations}</Text>
                  </View>

                  {reportData.aiInsights && (
                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>🤖 التحليلات الذكية</Text>
                      <Text style={styles.reportText}>
                        إجمالي الاختبارات: {reportData.aiInsights.totalTests}
                      </Text>
                      <Text style={styles.reportText}>
                        التوصيات: {reportData.aiInsights.recommendations?.length || 0}
                      </Text>
                      <Text style={styles.reportText}>
                        الشذوذات المكتشفة: {reportData.aiInsights.anomalies?.length || 0}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAdvancedReports(false)}
            >
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FF9800',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF9800',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: width * 0.43,
    marginBottom: 15,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    }),
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 30,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }
    }),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }
    }),
  },
  logTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logAction: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  logUser: {
    fontSize: 12,
    color: '#FF9800',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 5,
  },
  selectedRoleButton: {
    backgroundColor: '#FF9800',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedRoleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#666',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New styles for advanced features
  analyticsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analyticsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  analyticsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  analyticsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  trendIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  trendInfo: {
    flex: 1,
  },
  trendMetric: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  trendDirection: {
    fontSize: 12,
    color: '#666',
  },
  recommendationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recommendationAction: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  notificationsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#666',
  },
  notificationItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationPriority: {
    alignSelf: 'flex-start',
  },
  priorityBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    textAlign: 'center',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reportSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  reportSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  reportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default AdministrationScreen;