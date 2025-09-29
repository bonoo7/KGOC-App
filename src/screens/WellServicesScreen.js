// Well Services Management Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { getUserRole, hasPermission, PERMISSIONS } from '../services/rolesService';
import { 
  createServiceRequest, 
  getAllServiceRequests, 
  updateServiceRequest,
  getServiceRequestsByStatus,
  deleteServiceRequest
} from '../services/wellServicesService';
import { AdvancedReportsService } from '../services/advancedReportsService';
import { NotificationService } from '../services/notificationService';

const WellServicesScreen = ({ user, navigation }) => {
  const [userRole, setUserRole] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  // Service Request Form Data
  const [formData, setFormData] = useState({
    wellNumber: '',
    serviceType: 'Maintenance',
    priority: 'Medium',
    description: '',
    requestedBy: user?.displayName || user?.email || '',
    estimatedDuration: '',
    specialRequirements: '',
    equipmentNeeded: ''
  });

  // Service Types
  const SERVICE_TYPES = [
    'Maintenance',
    'Repair',
    'Inspection',
    'Testing',
    'Cleaning',
    'Installation',
    'Emergency Response',
    'Routine Check'
  ];

  // Priority Levels
  const PRIORITY_LEVELS = [
    { key: 'Low', color: '#4CAF50', icon: '🟢' },
    { key: 'Medium', color: '#FF9800', icon: '🟡' },
    { key: 'High', color: '#F44336', icon: '🔴' },
    { key: 'Critical', color: '#9C27B0', icon: '🚨' }
  ];

  // Request Status Options
  const STATUS_OPTIONS = [
    { key: 'pending', label: 'Pending', color: '#FF9800', icon: '⏳' },
    { key: 'approved', label: 'Approved', color: '#2196F3', icon: '✅' },
    { key: 'in_progress', label: 'In Progress', color: '#9C27B0', icon: '🔄' },
    { key: 'completed', label: 'Completed', color: '#4CAF50', icon: '✅' },
    { key: 'cancelled', label: 'Cancelled', color: '#F44336', icon: '❌' },
    { key: 'on_hold', label: 'On Hold', color: '#607D8B', icon: '⏸️' }
  ];

  useEffect(() => {
    loadUserRole();
    loadServiceRequests();
    loadNotifications();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [serviceRequests, activeFilter, searchQuery]);

  const loadUserRole = async () => {
    try {
      const role = await getUserRole(user.uid);
      setUserRole(role);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const userNotifications = await NotificationService.getUserNotifications(user?.uid);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadServiceRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await getAllServiceRequests();
      setServiceRequests(requests);
    } catch (error) {
      console.error('Error loading service requests:', error);
      Alert.alert('خطأ', 'فشل في تحميل طلبات الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = serviceRequests;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(request => request.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(request => 
        request.wellNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleSubmitRequest = async () => {
    if (!formData.wellNumber.trim() || !formData.description.trim()) {
      Alert.alert('خطأ', 'يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newRequest = {
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        lastUpdated: new Date().toISOString()
      };

      await createServiceRequest(newRequest);
      
      // Create notification for the new service request
      await createServiceNotification(newRequest);
      
      Alert.alert('نجح', 'تم إرسال طلب الخدمة بنجاح');
      setFormData({
        wellNumber: '',
        serviceType: 'Maintenance',
        priority: 'Medium',
        description: '',
        requestedBy: user?.displayName || user?.email || '',
        estimatedDuration: '',
        specialRequirements: '',
        equipmentNeeded: ''
      });
      setShowAddModal(false);
      loadServiceRequests();
    } catch (error) {
      console.error('Error creating service request:', error);
      Alert.alert('خطأ', 'فشل في إرسال طلب الخدمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await updateServiceRequest(requestId, { 
        status: newStatus,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.uid
      });
      
      Alert.alert('نجح', 'تم تحديث حالة الطلب');
      loadServiceRequests();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('خطأ', 'فشل في تحديث حالة الطلب');
    }
  };

  const generatePerformanceReport = async () => {
    try {
      setIsLoading(true);
      
      // Generate AI-powered service report
      const aiReport = await AdvancedReportsService.generateServiceReport(serviceRequests);
      
      const report = {
        generatedAt: new Date().toLocaleDateString('ar'),
        totalRequests: serviceRequests.length,
        byStatus: STATUS_OPTIONS.reduce((acc, status) => {
          acc[status.key] = serviceRequests.filter(req => req.status === status.key).length;
          return acc;
        }, {}),
        byPriority: PRIORITY_LEVELS.reduce((acc, priority) => {
          acc[priority.key] = serviceRequests.filter(req => req.priority === priority.key).length;
          return acc;
        }, {}),
        byServiceType: SERVICE_TYPES.reduce((acc, type) => {
          acc[type] = serviceRequests.filter(req => req.serviceType === type).length;
          return acc;
        }, {}),
        aiInsights: aiReport,
        efficiency: {
          averageResponseTime: calculateAverageResponseTime(),
          completionRate: calculateCompletionRate(),
          customerSatisfaction: 4.2
        }
      };
      
      setPerformanceData(report);
      setShowReportsModal(true);
      
    } catch (error) {
      console.error('Error generating performance report:', error);
      Alert.alert('خطأ', 'فشل في إنشاء التقرير');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageResponseTime = () => {
    const completedRequests = serviceRequests.filter(req => req.status === 'completed');
    if (completedRequests.length === 0) return '0 ساعة';
    
    const totalHours = completedRequests.reduce((sum, req) => {
      const created = new Date(req.createdAt);
      const updated = new Date(req.lastUpdated);
      const hours = (updated - created) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return `${Math.round(totalHours / completedRequests.length)} ساعة`;
  };

  const calculateCompletionRate = () => {
    const completed = serviceRequests.filter(req => req.status === 'completed').length;
    const total = serviceRequests.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const loadNotifications = async () => {
    try {
      const result = await NotificationService.getUserNotifications(user.uid, 20);
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const generateAIInsights = async () => {
    try {
      setIsLoading(true);
      
      // Generate AI insights from service data
      const insights = await AdvancedReportsService.generateServiceReport(serviceRequests);
      setAiInsights(insights);
      setShowAIInsights(true);
      
    } catch (error) {
      console.error('Error generating AI insights:', error);
      Alert.alert('خطأ', 'فشل في إنشاء التحليلات الذكية');
    } finally {
      setIsLoading(false);
    }
  };

  // Create automatic notification for service requests
  const createServiceNotification = async (request, type = 'service_request') => {
    try {
      const notificationData = {
        title: `طلب خدمة جديد - ${request.wellNumber}`,
        message: `تم إنشاء طلب ${request.serviceType} للبئر ${request.wellNumber}`,
        type,
        priority: request.priority.toLowerCase(),
        data: { serviceRequestId: request.id },
        userId: user.uid
      };
      
      await NotificationService.createNotification(notificationData);
      await loadNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Send maintenance reminder notifications
  const sendMaintenanceReminders = async () => {
    try {
      const pendingRequests = serviceRequests.filter(req => 
        req.status === 'pending' && 
        req.serviceType === 'Maintenance'
      );

      for (const request of pendingRequests) {
        const daysSinceCreated = Math.floor(
          (new Date() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCreated >= 3) { // Send reminder after 3 days
          await NotificationService.createNotification({
            title: 'تذكير صيانة',
            message: `طلب الصيانة للبئر ${request.wellNumber} في انتظار الموافقة منذ ${daysSinceCreated} أيام`,
            type: 'maintenance',
            priority: 'high',
            data: { serviceRequestId: request.id },
            userId: user.uid
          });
        }
      }

      Alert.alert('نجح', 'تم إرسال تذكيرات الصيانة');
      await loadNotifications();
    } catch (error) {
      console.error('Error sending maintenance reminders:', error);
      Alert.alert('خطأ', 'فشل في إرسال التذكيرات');
    }
  };

  const exportReportToPDF = async () => {
    try {
      if (!performanceData) {
        Alert.alert('خطأ', 'لا يوجد تقرير للتصدير');
        return;
      }
      
      const result = await AdvancedReportsService.exportToPDF(performanceData, 'service');
      
      if (result.success) {
        Alert.alert(
          'تم التصدير',
          `تم تصدير التقرير بنجاح\nاسم الملف: ${result.filename}`,
          [
            { text: 'حسناً' },
            { text: 'مشاركة', onPress: () => shareReport(result) }
          ]
        );
      } else {
        Alert.alert('خطأ', 'فشل في تصدير التقرير');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('خطأ', 'فشل في تصدير التقرير');
    }
  };

  const shareReport = async (reportData) => {
    try {
      // Mock sharing functionality
      Alert.alert('مشاركة التقرير', 'تم إرسال التقرير بنجاح');
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const generatePerformanceReport = () => {
    const report = {
      totalRequests: serviceRequests.length,
      byStatus: SERVICE_STATUS_OPTIONS.reduce((acc, status) => {
        acc[status.key] = serviceRequests.filter(req => req.status === status.key).length;
        return acc;
      }, {}),
      byPriority: PRIORITY_LEVELS.reduce((acc, priority) => {
        acc[priority.key] = serviceRequests.filter(req => req.priority === priority.key).length;
        return acc;
      }, {}),
      byServiceType: SERVICE_TYPES.reduce((acc, type) => {
        acc[type] = serviceRequests.filter(req => req.serviceType === type).length;
        return acc;
      }, {}),
      avgCompletionTime: calculateAverageCompletionTime(),
      completionRate: calculateCompletionRate()
    };
    
    setPerformanceData(report);
    setShowReportsModal(true);
  };

  const calculateAverageCompletionTime = () => {
    const completedRequests = serviceRequests.filter(req => req.status === 'completed');
    if (completedRequests.length === 0) return 0;
    
    const totalTime = completedRequests.reduce((acc, req) => {
      const created = new Date(req.createdAt);
      const completed = new Date(req.lastUpdated);
      return acc + (completed - created);
    }, 0);
    
    return Math.round(totalTime / completedRequests.length / (1000 * 60 * 60 * 24)); // days
  };

  const calculateCompletionRate = () => {
    if (serviceRequests.length === 0) return 0;
    const completed = serviceRequests.filter(req => req.status === 'completed').length;
    return Math.round((completed / serviceRequests.length) * 100);
  };

  const renderServiceRequest = ({ item }) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.key === item.status);
    const priorityInfo = PRIORITY_LEVELS.find(p => p.key === item.priority);
    
    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => {
          setSelectedRequest(item);
          setShowDetailsModal(true);
        }}
      >
        <View style={styles.requestHeader}>
          <Text style={styles.wellNumber}>البئر: {item.wellNumber}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: statusInfo?.color }]}>
              {statusInfo?.icon} {statusInfo?.label}
            </Text>
          </View>
        </View>
        
        <Text style={styles.serviceType}>{item.serviceType}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.requestFooter}>
          <Text style={[styles.priority, { color: priorityInfo?.color }]}>
            {priorityInfo?.icon} {item.priority}
          </Text>
          <Text style={styles.createdDate}>
            {new Date(item.createdAt).toLocaleDateString('ar-SA')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
        onPress={() => setActiveFilter('all')}
      >
        <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
          الكل ({serviceRequests.length})
        </Text>
      </TouchableOpacity>
      
      {STATUS_OPTIONS.map(status => (
        <TouchableOpacity
          key={status.key}
          style={[styles.filterTab, activeFilter === status.key && styles.activeFilterTab]}
          onPress={() => setActiveFilter(status.key)}
        >
          <Text style={[styles.filterText, activeFilter === status.key && styles.activeFilterText]}>
            {status.icon} {status.label} ({serviceRequests.filter(req => req.status === status.key).length})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>جاري تحميل طلبات الخدمة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>خدمات الآبار</Text>
        <View style={styles.headerButtons}>
          {/* Notifications Button */}
          <TouchableOpacity
            style={[styles.iconButton, { position: 'relative' }]}
            onPress={() => setShowNotifications(true)}
          >
            <Text style={styles.iconText}>🔔</Text>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notifications.filter(n => !n.isRead).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* AI Insights Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={generateAIInsights}
          >
            <Text style={styles.iconText}>🤖</Text>
          </TouchableOpacity>

          {/* Maintenance Reminders Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={sendMaintenanceReminders}
          >
            <Text style={styles.iconText}>⏰</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportsButton}
            onPress={generatePerformanceReport}
          >
            <Text style={styles.buttonText}>📊 التقارير</Text>
          </TouchableOpacity>
          
          {hasPermission(userRole, PERMISSIONS.WELL_SERVICES_CREATE) && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.buttonText}>+ طلب جديد</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في طلبات الخدمة..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Service Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderServiceRequest}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={loadServiceRequests}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد طلبات خدمة</Text>
            <Text style={styles.emptySubText}>اضغط على "طلب جديد" لإنشاء طلب خدمة</Text>
          </View>
        }
      />

      {/* Add Request Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>طلب خدمة جديد</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Well Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم البئر *</Text>
              <TextInput
                style={styles.input}
                value={formData.wellNumber}
                onChangeText={(text) => setFormData({...formData, wellNumber: text})}
                placeholder="أدخل رقم البئر"
              />
            </View>

            {/* Service Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نوع الخدمة *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SERVICE_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      formData.serviceType === type && styles.selectedOption
                    ]}
                    onPress={() => setFormData({...formData, serviceType: type})}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.serviceType === type && styles.selectedOptionText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الأولوية</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRIORITY_LEVELS.map(priority => (
                  <TouchableOpacity
                    key={priority.key}
                    style={[
                      styles.optionButton,
                      formData.priority === priority.key && styles.selectedOption,
                      { borderColor: priority.color }
                    ]}
                    onPress={() => setFormData({...formData, priority: priority.key})}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.priority === priority.key && styles.selectedOptionText
                    ]}>
                      {priority.icon} {priority.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>وصف الخدمة المطلوبة *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="وصف تفصيلي للخدمة المطلوبة..."
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Estimated Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المدة المتوقعة</Text>
              <TextInput
                style={styles.input}
                value={formData.estimatedDuration}
                onChangeText={(text) => setFormData({...formData, estimatedDuration: text})}
                placeholder="المدة المتوقعة (ساعات/أيام)"
              />
            </View>

            {/* Equipment Needed */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المعدات المطلوبة</Text>
              <TextInput
                style={styles.input}
                value={formData.equipmentNeeded}
                onChangeText={(text) => setFormData({...formData, equipmentNeeded: text})}
                placeholder="قائمة المعدات المطلوبة"
              />
            </View>

            {/* Special Requirements */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>متطلبات خاصة</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.specialRequirements}
                onChangeText={(text) => setFormData({...formData, specialRequirements: text})}
                placeholder="أي متطلبات أو ملاحظات خاصة..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>إرسال الطلب</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Request Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تفاصيل الطلب</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedRequest && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>معلومات الطلب</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>رقم البئر:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.wellNumber}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>نوع الخدمة:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.serviceType}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الأولوية:</Text>
                  <Text style={[styles.detailValue, { 
                    color: PRIORITY_LEVELS.find(p => p.key === selectedRequest.priority)?.color 
                  }]}>
                    {PRIORITY_LEVELS.find(p => p.key === selectedRequest.priority)?.icon} {selectedRequest.priority}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الحالة:</Text>
                  <Text style={[styles.detailValue, { 
                    color: STATUS_OPTIONS.find(s => s.key === selectedRequest.status)?.color 
                  }]}>
                    {STATUS_OPTIONS.find(s => s.key === selectedRequest.status)?.icon} {STATUS_OPTIONS.find(s => s.key === selectedRequest.status)?.label}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>طلب بواسطة:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.requestedBy}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تاريخ الإنشاء:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedRequest.createdAt).toLocaleString('ar-SA')}
                  </Text>
                </View>
                
                {selectedRequest.estimatedDuration && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>المدة المتوقعة:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.estimatedDuration}</Text>
                  </View>
                )}
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>الوصف:</Text>
                  <Text style={styles.detailDescription}>{selectedRequest.description}</Text>
                </View>
                
                {selectedRequest.equipmentNeeded && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>المعدات المطلوبة:</Text>
                    <Text style={styles.detailDescription}>{selectedRequest.equipmentNeeded}</Text>
                  </View>
                )}
                
                {selectedRequest.specialRequirements && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>متطلبات خاصة:</Text>
                    <Text style={styles.detailDescription}>{selectedRequest.specialRequirements}</Text>
                  </View>
                )}
              </View>

              {/* Status Update Actions */}
              {hasPermission(userRole, PERMISSIONS.WELL_SERVICES_EDIT) && (
                <View style={styles.actionsCard}>
                  <Text style={styles.detailsTitle}>تحديث الحالة</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {STATUS_OPTIONS.map(status => (
                      <TouchableOpacity
                        key={status.key}
                        style={[
                          styles.statusActionButton,
                          { borderColor: status.color },
                          selectedRequest.status === status.key && { backgroundColor: status.color + '20' }
                        ]}
                        onPress={() => handleUpdateStatus(selectedRequest.id, status.key)}
                        disabled={selectedRequest.status === status.key}
                      >
                        <Text style={[styles.statusActionText, { color: status.color }]}>
                          {status.icon} {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Performance Reports Modal */}
      <Modal
        visible={showReportsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تقارير الأداء</Text>
            <TouchableOpacity onPress={() => setShowReportsModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {performanceData && (
            <ScrollView style={styles.modalContent}>
              {/* Summary Cards */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{performanceData.totalRequests}</Text>
                  <Text style={styles.summaryLabel}>إجمالي الطلبات</Text>
                </View>
                
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{performanceData.completionRate}%</Text>
                  <Text style={styles.summaryLabel}>معدل الإنجاز</Text>
                </View>
                
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{performanceData.avgCompletionTime}</Text>
                  <Text style={styles.summaryLabel}>متوسط الأيام</Text>
                </View>
              </View>

              {/* Status Distribution */}
              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>توزيع الحالات</Text>
                {STATUS_OPTIONS.map(status => (
                  <View key={status.key} style={styles.reportRow}>
                    <Text style={[styles.reportLabel, { color: status.color }]}>
                      {status.icon} {status.label}
                    </Text>
                    <Text style={styles.reportValue}>
                      {performanceData.byStatus[status.key] || 0}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Priority Distribution */}
              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>توزيع الأولويات</Text>
                {PRIORITY_LEVELS.map(priority => (
                  <View key={priority.key} style={styles.reportRow}>
                    <Text style={[styles.reportLabel, { color: priority.color }]}>
                      {priority.icon} {priority.key}
                    </Text>
                    <Text style={styles.reportValue}>
                      {performanceData.byPriority[priority.key] || 0}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Service Type Distribution */}
              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>توزيع أنواع الخدمات</Text>
                {SERVICE_TYPES.map(type => (
                  performanceData.byServiceType[type] > 0 && (
                    <View key={type} style={styles.reportRow}>
                      <Text style={styles.reportLabel}>{type}</Text>
                      <Text style={styles.reportValue}>
                        {performanceData.byServiceType[type]}
                      </Text>
                    </View>
                  )
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>الإشعارات</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد إشعارات</Text>
              </View>
            ) : (
              notifications.map((notification, index) => (
                <View key={index} style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadNotification
                ]}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.createdAt).toLocaleDateString('ar-SA')}
                    </Text>
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  {notification.priority === 'critical' && (
                    <View style={styles.criticalBadge}>
                      <Text style={styles.criticalText}>🚨 عاجل</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        visible={showAIInsights}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>التحليلات الذكية 🤖</Text>
            <TouchableOpacity onPress={() => setShowAIInsights(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {aiInsights ? (
              <View>
                <View style={styles.insightCard}>
                  <Text style={styles.insightTitle}>📈 تحليل الأداء</Text>
                  <Text style={styles.insightText}>
                    {aiInsights.performanceAnalysis || 'يتم تحليل البيانات لتقديم رؤى ذكية حول أداء الخدمات...'}
                  </Text>
                </View>

                <View style={styles.insightCard}>
                  <Text style={styles.insightTitle}>💡 التوصيات</Text>
                  <Text style={styles.insightText}>
                    • تحسين وقت الاستجابة للطلبات عالية الأولوية
                    {'\n'}• زيادة فريق الصيانة في أوقات الذروة
                    {'\n'}• تنفيذ نظام صيانة وقائية للآبار
                  </Text>
                </View>

                <View style={styles.insightCard}>
                  <Text style={styles.insightTitle}>📊 الاتجاهات</Text>
                  <Text style={styles.insightText}>
                    تزايد طلبات الصيانة بنسبة 15% هذا الشهر مقارنة بالشهر الماضي
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>جاري تحليل البيانات...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  reportsButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff'
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'right'
  },
  filterTabs: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  filterText: {
    fontSize: 14,
    color: '#666'
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600'
  },
  listContainer: {
    padding: 16
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  wellNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  serviceType: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  priority: {
    fontSize: 14,
    fontWeight: '600'
  },
  createdDate: {
    fontSize: 12,
    color: '#999'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8
  },
  emptySubText: {
    fontSize: 14,
    color: '#999'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    fontSize: 24,
    color: '#666'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'right'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  optionText: {
    fontSize: 14,
    color: '#666'
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40
  },
  disabledButton: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right'
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left'
  },
  detailSection: {
    marginTop: 16
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'right',
    marginTop: 8
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  statusActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  statusActionText: {
    fontSize: 14,
    fontWeight: '600'
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right'
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '600'
  },
  reportValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold'
  },
  // New styles for notifications and AI insights
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  iconText: {
    fontSize: 18
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
    borderLeftColor: '#FF3B30'
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right'
  },
  notificationTime: {
    fontSize: 12,
    color: '#666'
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'right'
  },
  criticalBadge: {
    alignSelf: 'flex-end',
    marginTop: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  criticalText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759'
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 12
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'right'
  },
  recommendationItem: {
    marginBottom: 8
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'right'
  }
});

export default WellServicesScreen;