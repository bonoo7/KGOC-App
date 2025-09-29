// Enhanced Interactive Oil Separator Diagram with Animations and PDF Export
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Animated,
  Dimensions,
  Share
} from 'react-native';

const { width, height } = Dimensions.get('window');

const EnhancedOilSeparatorDiagram = ({ 
  visible = false,
  onClose,
  onSelectionChange,
  selectedParts = []
}) => {
  const [localSelectedParts, setLocalSelectedParts] = useState(selectedParts);
  const [showPartDetails, setShowPartDetails] = useState(false);
  const [selectedPartInfo, setSelectedPartInfo] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Enhanced Oil Separator Parts
  const separatorParts = [
    {
      id: 'inlet_nozzle',
      name: 'Inlet Nozzle',
      nameAr: 'فوهة الدخل',
      description: 'Entry point for oil/gas/water mixture',
      position: { top: 140, left: 10 },
      type: 'inlet',
      icon: '🔵',
      color: '#4CAF50',
      performance: { efficiency: 95, reliability: 88, maintainability: 75 },
      specifications: ['Size: 4-6 inches', 'Material: Carbon Steel'],
      commonProblems: [
        {
          problem: 'Erosion due to high velocity fluids',
          severity: 'high',
          solutions: ['Install erosion-resistant coating', 'Reduce flow velocity']
        }
      ],
      safetyPrecautions: ['Isolate before maintenance', 'Use proper PPE']
    },
    {
      id: 'oil_outlet',
      name: 'Oil Outlet',
      nameAr: 'مخرج النفط',
      description: 'Clean oil discharge point',
      position: { top: 120, right: 10 },
      type: 'outlet',
      icon: '🟢',
      color: '#2196F3',
      performance: { efficiency: 92, reliability: 90, maintainability: 85 }
    },
    {
      id: 'gas_outlet',
      name: 'Gas Outlet',
      nameAr: 'مخرج الغاز',
      description: 'Separated gas discharge point',
      position: { top: 80, right: 50 },
      type: 'outlet',
      icon: '💨',
      color: '#FF9800',
      performance: { efficiency: 94, reliability: 87, maintainability: 80 }
    }
  ];

  useEffect(() => {
    if (animationEnabled) {
      startAnimations();
    }
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [animationEnabled]);

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handlePartPress = (part) => {
    const isSelected = localSelectedParts.some(p => p.id === part.id);
    let newSelection;
    
    if (isSelected) {
      newSelection = localSelectedParts.filter(p => p.id !== part.id);
    } else {
      newSelection = [...localSelectedParts, part];
    }
    
    setLocalSelectedParts(newSelection);
    onSelectionChange && onSelectionChange(newSelection);
    
    setSelectedPartInfo(part);
    setShowPartDetails(true);
  };

  const generateReport = () => {
    if (localSelectedParts.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار مكون واحد على الأقل');
      return;
    }

    const report = {
      title: 'تقرير الفاصل النفطي المتقدم',
      generatedAt: new Date().toLocaleString('ar-SA'),
      components: localSelectedParts,
      reportId: `RPT-${Date.now()}`
    };

    setReportData(report);
    setShowReport(true);
  };

  const exportToPDF = async () => {
    try {
      const result = await Share.share({
        message: `تقرير الفاصل النفطي المتقدم\n\nتم إنشاؤه في: ${reportData.generatedAt}\nالمكونات: ${reportData.components.length}\nرقم التقرير: ${reportData.reportId}`,
        title: 'تقرير الفاصل النفطي'
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('نجح', 'تم تصدير التقرير بنجاح');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تصدير التقرير');
    }
  };

  const renderPart = (part) => {
    const isSelected = localSelectedParts.some(p => p.id === part.id);
    const animatedStyle = isSelected && animationEnabled ? {
      transform: [{ scale: pulseAnim }]
    } : {};

    return (
      <Animated.View
        key={part.id}
        style={[
          styles.separatorPart,
          {
            position: 'absolute',
            ...part.position,
            backgroundColor: isSelected ? part.color + '40' : part.color + '20',
            borderColor: part.color,
            borderWidth: isSelected ? 3 : 1,
          },
          animatedStyle
        ]}
      >
        <TouchableOpacity
          onPress={() => handlePartPress(part)}
          style={styles.partButton}
        >
          <Text style={styles.partIcon}>{part.icon}</Text>
          <Text style={[styles.partName, { color: part.color }]}>
            {part.nameAr}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>الفاصل النفطي المتقدم 🛢️</Text>
          
          <TouchableOpacity 
            onPress={() => setAnimationEnabled(!animationEnabled)}
            style={[styles.controlButton, animationEnabled && styles.activeControl]}
          >
            <Text style={styles.controlIcon}>🎬</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={generateReport}>
            <Text style={styles.actionButtonText}>📊 تقرير متقدم</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, !reportData && styles.disabledButton]} 
            onPress={exportToPDF}
            disabled={!reportData}
          >
            <Text style={styles.actionButtonText}>📄 تصدير PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Main Diagram */}
        <ScrollView style={styles.diagramContainer}>
          <View style={styles.vesselContainer}>
            <View style={styles.vesselBody}>
              {separatorParts.map(renderPart)}
              
              {/* Level Indicators */}
              <View style={styles.levelIndicators}>
                <View style={[styles.levelLine, styles.oilLevel]} />
                <View style={[styles.levelLine, styles.waterLevel]} />
                <Text style={styles.levelLabel}>Oil Level</Text>
                <Text style={[styles.levelLabel, styles.waterLevelLabel]}>Water Level</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Selection Summary */}
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            المكونات المحددة: {localSelectedParts.length}
          </Text>
          {localSelectedParts.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {localSelectedParts.map(part => (
                <View key={part.id} style={styles.selectedPartChip}>
                  <Text style={styles.chipIcon}>{part.icon}</Text>
                  <Text style={styles.chipText}>{part.nameAr}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Part Details Modal */}
        <Modal visible={showPartDetails} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPartInfo?.icon} {selectedPartInfo?.nameAr}
              </Text>
              <TouchableOpacity onPress={() => setShowPartDetails(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPartInfo && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>معلومات أساسية</Text>
                  <Text style={styles.infoText}>النوع: {selectedPartInfo.type}</Text>
                  <Text style={styles.infoText}>الوصف: {selectedPartInfo.description}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>مؤشرات الأداء</Text>
                  <View style={styles.performanceGrid}>
                    <View style={styles.performanceCard}>
                      <Text style={styles.performanceValue}>
                        {selectedPartInfo.performance.efficiency}%
                      </Text>
                      <Text style={styles.performanceLabel}>الكفاءة</Text>
                    </View>
                    <View style={styles.performanceCard}>
                      <Text style={styles.performanceValue}>
                        {selectedPartInfo.performance.reliability}%
                      </Text>
                      <Text style={styles.performanceLabel}>الموثوقية</Text>
                    </View>
                    <View style={styles.performanceCard}>
                      <Text style={styles.performanceValue}>
                        {selectedPartInfo.performance.maintainability}%
                      </Text>
                      <Text style={styles.performanceLabel}>قابلية الصيانة</Text>
                    </View>
                  </View>
                </View>

                {selectedPartInfo.specifications && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>المواصفات التقنية</Text>
                    {selectedPartInfo.specifications.map((spec, index) => (
                      <Text key={index} style={styles.specText}>• {spec}</Text>
                    ))}
                  </View>
                )}

                {selectedPartInfo.commonProblems && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>المشاكل الشائعة</Text>
                    {selectedPartInfo.commonProblems.map((problem, index) => (
                      <View key={index} style={styles.problemCard}>
                        <Text style={styles.problemTitle}>{problem.problem}</Text>
                        <Text style={styles.problemSeverity}>الخطورة: {problem.severity}</Text>
                        {problem.solutions && (
                          <>
                            <Text style={styles.solutionTitle}>الحلول المقترحة:</Text>
                            {problem.solutions.map((solution, idx) => (
                              <Text key={idx} style={styles.solutionText}>• {solution}</Text>
                            ))}
                          </>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {selectedPartInfo.safetyPrecautions && (
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>احتياطات السلامة</Text>
                    {selectedPartInfo.safetyPrecautions.map((precaution, index) => (
                      <Text key={index} style={styles.safetyText}>⚠️ {precaution}</Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </Modal>

        {/* Report Modal */}
        <Modal visible={showReport} animationType="slide" presentationStyle="fullScreen">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowReport(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{reportData?.title}</Text>
              <TouchableOpacity onPress={exportToPDF} style={styles.exportButton}>
                <Text style={styles.exportButtonText}>📄 تصدير</Text>
              </TouchableOpacity>
            </View>

            {reportData && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.reportSection}>
                  <Text style={styles.sectionTitle}>معلومات التقرير</Text>
                  <Text style={styles.infoText}>تاريخ الإنشاء: {reportData.generatedAt}</Text>
                  <Text style={styles.infoText}>رقم التقرير: {reportData.reportId}</Text>
                  <Text style={styles.infoText}>عدد المكونات: {reportData.components.length}</Text>
                </View>

                {reportData.components.map((component, index) => (
                  <View key={component.id} style={styles.reportSection}>
                    <Text style={styles.componentTitle}>
                      {component.icon} {component.nameAr}
                    </Text>
                    <Text style={styles.infoText}>النوع: {component.type}</Text>
                    <Text style={styles.infoText}>الكفاءة: {component.performance.efficiency}%</Text>
                    <Text style={styles.infoText}>الموثوقية: {component.performance.reliability}%</Text>
                    <Text style={styles.infoText}>قابلية الصيانة: {component.performance.maintainability}%</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
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
  closeButton: {
    padding: 8
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center'
  },
  controlButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0'
  },
  activeControl: {
    backgroundColor: '#007AFF'
  },
  controlIcon: {
    fontSize: 16
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  disabledButton: {
    opacity: 0.5
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  diagramContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  vesselContainer: {
    minHeight: height - 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  vesselBody: {
    width: width * 0.8,
    height: height * 0.5,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2196F3',
    position: 'relative'
  },
  separatorPart: {
    padding: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center'
  },
  partButton: {
    alignItems: 'center'
  },
  partIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  partName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  levelIndicators: {
    position: 'absolute',
    right: 10,
    top: '30%',
    height: '40%',
    width: 4
  },
  levelLine: {
    position: 'absolute',
    right: 0,
    width: 20,
    height: 2
  },
  oilLevel: {
    backgroundColor: '#4CAF50',
    top: '30%'
  },
  waterLevel: {
    backgroundColor: '#2196F3',
    bottom: '20%'
  },
  levelLabel: {
    position: 'absolute',
    right: 25,
    fontSize: 10,
    color: '#4CAF50',
    top: '25%'
  },
  waterLevelLabel: {
    color: '#2196F3',
    bottom: '15%'
  },
  selectionSummary: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8
  },
  selectedPartChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 4
  },
  chipText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center'
  },
  modalContent: {
    flex: 1,
    padding: 16
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  reportSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right'
  },
  componentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right'
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'right'
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  performanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666'
  },
  specText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'right'
  },
  problemCard: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8
  },
  problemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right'
  },
  problemSeverity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'right'
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4
  },
  solutionText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16
  }
});

export default EnhancedOilSeparatorDiagram;
    marginBottom: 4,
    textAlign: 'right'
  },
  solutionText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
    textAlign: 'right'
  },
  safetyText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 4,
    textAlign: 'right'
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  }
});

export default EnhancedOilSeparatorDiagram;