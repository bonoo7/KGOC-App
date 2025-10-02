// Advanced Reports Modal with Interactive Charts and AI Analytics
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { AdvancedReportsService } from '../services/advancedReportsService';

const { width } = Dimensions.get('window');

const AdvancedReportsModal = ({ 
  visible, 
  onClose, 
  serviceRequests, 
  performanceData 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAnalytics, setAiAnalytics] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const generateAIAnalytics = async () => {
    try {
      setIsGeneratingAI(true);
      const aiReport = await AdvancedReportsService.generateServiceReport(serviceRequests);
      setAiAnalytics(aiReport);
      setActiveTab('ai_analytics');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إنشاء التحليلات الذكية');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const reportData = aiAnalytics || performanceData;
      const pdfContent = await AdvancedReportsService.exportReportToPDF(
        reportData, 
        'تقرير أداء خدمات الآبار'
      );
      
      // Simulate PDF export with Share
      const shareContent = `
${pdfContent.title}
تاريخ الإنشاء: ${pdfContent.generatedAt}

=== ملخص تنفيذي ===
إجمالي الطلبات: ${reportData.summary?.totalRequests || performanceData?.totalRequests || 0}
الطلبات المكتملة: ${reportData.summary?.completedRequests || 0}
متوسط وقت الاستجابة: ${reportData.summary?.avgResponseTime || 'غير متاح'} ساعة
نسبة الكفاءة: ${reportData.summary?.efficiencyScore || 'غير متاح'}%

=== التوصيات ===
${reportData.recommendations?.map(rec => `• ${rec.title}: ${rec.description}`).join('\n') || 'لا توجد توصيات متاحة'}
      `;

      await Share.share({
        message: shareContent,
        title: 'تقرير أداء خدمات الآبار'
      });
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تصدير التقرير');
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>📊 ملخص عام</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{performanceData?.totalRequests || 0}</Text>
            <Text style={styles.statLabel}>إجمالي الطلبات</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {performanceData?.byStatus?.completed || 0}
            </Text>
            <Text style={styles.statLabel}>مكتملة</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {performanceData?.byStatus?.pending || 0}
            </Text>
            <Text style={styles.statLabel}>قيد الانتظار</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {performanceData?.completionRate || 0}%
            </Text>
            <Text style={styles.statLabel}>نسبة الإنجاز</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>🎯 توزيع الأولوية</Text>
        {performanceData?.byPriority && Object.entries(performanceData.byPriority).map(([priority, count]) => (
          <View key={priority} style={styles.priorityItem}>
            <Text style={styles.priorityLabel}>{priority}</Text>
            <View style={styles.priorityBar}>
              <View 
                style={[
                  styles.priorityFill, 
                  { 
                    width: `${(count / performanceData.totalRequests) * 100}%`,
                    backgroundColor: getPriorityColor(priority)
                  }
                ]} 
              />
            </View>
            <Text style={styles.priorityCount}>{count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>🔧 أنواع الخدمات</Text>
        {performanceData?.byServiceType && Object.entries(performanceData.byServiceType)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([service, count]) => (
            <View key={service} style={styles.serviceItem}>
              <Text style={styles.serviceLabel}>{service}</Text>
              <Text style={styles.serviceCount}>{count} طلب</Text>
            </View>
          ))}
      </View>
    </ScrollView>
  );

  const renderAIAnalyticsTab = () => (
    <ScrollView style={styles.tabContent}>
      {!aiAnalytics ? (
        <View style={styles.aiPrompt}>
          <Text style={styles.aiPromptIcon}>🤖</Text>
          <Text style={styles.aiPromptTitle}>التحليلات الذكية</Text>
          <Text style={styles.aiPromptText}>
            احصل على تحليلات متقدمة وتوقعات ذكية لأداء خدمات الآبار
          </Text>
          <TouchableOpacity 
            style={styles.generateAIButton} 
            onPress={generateAIAnalytics}
            disabled={isGeneratingAI}
          >
            <Text style={styles.generateAIButtonText}>
              {isGeneratingAI ? 'جاري الإنشاء...' : '🚀 إنشاء التحليلات الذكية'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* AI Trends */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>📈 التوجهات والاتجاهات</Text>
            {aiAnalytics.trends && (
              <>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>الاتجاه الأسبوعي:</Text>
                  <Text style={styles.trendValue}>
                    {aiAnalytics.trends.weeklyTrend?.totalRequests || 0} طلب
                  </Text>
                  <Text style={styles.trendChange}>
                    {aiAnalytics.trends.weeklyTrend?.changeFromPrevious > 0 ? '📈' : '📉'}
                    {Math.abs(aiAnalytics.trends.weeklyTrend?.changeFromPrevious || 0).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>الخدمة الأكثر طلباً:</Text>
                  <Text style={styles.trendValue}>
                    {aiAnalytics.trends.weeklyTrend?.mostRequestedService || 'غير محدد'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* AI Predictions */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>🔮 التوقعات الذكية</Text>
            {aiAnalytics.predictions && (
              <>
                <View style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>🗓️ طلبات الأسبوع القادم:</Text>
                  <Text style={styles.predictionValue}>
                    {aiAnalytics.predictions.nextWeekRequests || 'غير متاح'} طلب متوقع
                  </Text>
                </View>
                <View style={styles.predictionItem}>
                  <Text style={styles.predictionLabel}>🔧 احتياجات الصيانة:</Text>
                  <Text style={styles.predictionValue}>
                    {aiAnalytics.predictions.maintenanceSchedule?.recommendedSchedule || 'غير متاح'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* AI Recommendations */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>💡 التوصيات الذكية</Text>
            {aiAnalytics.recommendations?.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <View style={[
                    styles.priorityBadge, 
                    { backgroundColor: getPriorityColor(rec.priority) }
                  ]}>
                    <Text style={styles.priorityBadgeText}>{rec.priority}</Text>
                  </View>
                </View>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
                <Text style={styles.recommendationAction}>📋 {rec.action}</Text>
              </View>
            ))}
          </View>

          {/* Potential Issues */}
          {aiAnalytics.predictions?.potentialIssues?.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>⚠️ تحذيرات ومشاكل محتملة</Text>
              {aiAnalytics.predictions.potentialIssues.map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <Text style={styles.issueTitle}>{issue.description}</Text>
                  <Text style={styles.issueAction}>{issue.action}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#4CAF50',
      'Medium': '#FF9800', 
      'High': '#F44336',
      'Critical': '#9C27B0',
      'low': '#4CAF50',
      'medium': '#FF9800',
      'high': '#F44336'
    };
    return colors[priority] || '#666';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 التقارير المتقدمة</Text>
          <TouchableOpacity onPress={exportToPDF} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>📄 تصدير</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              📈 نظرة عامة
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ai_analytics' && styles.activeTab]}
            onPress={() => setActiveTab('ai_analytics')}
          >
            <Text style={[styles.tabText, activeTab === 'ai_analytics' && styles.activeTabText]}>
              🤖 التحليلات الذكية
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'overview' ? renderOverviewTab() : renderAIAnalyticsTab()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FF9800',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityLabel: {
    width: 80,
    fontSize: 14,
    color: '#333',
  },
  priorityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  priorityFill: {
    height: '100%',
    borderRadius: 4,
  },
  priorityCount: {
    width: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceLabel: {
    fontSize: 14,
    color: '#333',
  },
  serviceCount: {
    fontSize: 12,
    color: '#666',
  },
  aiPrompt: {
    alignItems: 'center',
    padding: 40,
  },
  aiPromptIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  aiPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  aiPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  generateAIButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  generateAIButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trendLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  trendValue: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: 'bold',
    marginRight: 10,
  },
  trendChange: {
    fontSize: 12,
    color: '#666',
  },
  predictionItem: {
    marginBottom: 15,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  predictionValue: {
    fontSize: 13,
    color: '#666',
    paddingLeft: 20,
  },
  recommendationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  recommendationAction: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  issueItem: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  issueAction: {
    fontSize: 12,
    color: '#856404',
  },
});

export default AdvancedReportsModal;