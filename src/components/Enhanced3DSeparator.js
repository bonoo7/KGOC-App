// Enhanced 3D Interactive Oil Separator with Training System
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
  PanResponder,
  ActivityIndicator
} from 'react-native';

const { width, height } = Dimensions.get('window');

const Enhanced3DSeparator = ({ 
  visible = false,
  onClose,
  onSelectionChange,
  selectedParts = [],
  trainingMode = false
}) => {
  const [localSelectedParts, setLocalSelectedParts] = useState(selectedParts);
  const [showPartDetails, setShowPartDetails] = useState(false);
  const [selectedPartInfo, setSelectedPartInfo] = useState(null);
  const [show3DView, setShow3DView] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTraining, setShowTraining] = useState(false);
  const [currentTrainingStep, setCurrentTrainingStep] = useState(0);
  const [trainingScore, setTrainingScore] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [problemsDatabase, setProblemsDatabase] = useState([]);

  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;

  // Enhanced 3D Separator Parts with detailed specifications
  const separator3DParts = [
    {
      id: 'inlet_nozzle_3d',
      name: 'Inlet Nozzle 3D',
      nameAr: 'فوهة الدخل ثلاثية الأبعاد',
      description: 'High-velocity inlet with advanced erosion protection',
      position: { top: 120, left: 20, depth: 50 },
      type: 'inlet',
      icon: '🔵',
      color: '#4CAF50',
      size: { width: 40, height: 20, depth: 30 },
      material: 'Duplex Stainless Steel',
      specifications: {
        diameter: '6 inches',
        pressureRating: '900 PSI',
        temperature: '250°F',
        flowCapacity: '10,000 bbl/day'
      },
      performance: { 
        efficiency: 95, 
        reliability: 88, 
        maintainability: 75,
        corrosionResistance: 92
      },
      maintenanceSchedule: {
        inspection: '3 months',
        cleaning: '1 month',
        replacement: '5 years'
      },
      commonProblems: [
        {
          problem: 'Erosion due to high velocity fluids',
          severity: 'high',
          frequency: 'monthly',
          solution: 'Install erosion-resistant liner',
          cost: '$5,000',
          downtime: '4 hours'
        },
        {
          problem: 'Corrosion from H2S/CO2',
          severity: 'medium',
          frequency: 'quarterly',
          solution: 'Apply corrosion inhibitor coating',
          cost: '$2,500',
          downtime: '6 hours'
        }
      ],
      trainingQuestions: [
        {
          question: 'What is the recommended inspection interval for the inlet nozzle?',
          options: ['1 month', '3 months', '6 months', '1 year'],
          correct: 1,
          explanation: 'The inlet nozzle should be inspected every 3 months due to high erosion potential.'
        }
      ]
    },
    {
      id: 'gas_boot_3d',
      name: 'Gas Boot 3D',
      nameAr: 'حذاء الغاز ثلاثي الأبعاد',
      description: 'Advanced gas separation chamber with mist eliminator',
      position: { top: 50, left: 200, depth: 40 },
      type: 'separation',
      icon: '💨',
      color: '#2196F3',
      size: { width: 60, height: 80, depth: 50 },
      material: 'Carbon Steel with SS Internals',
      specifications: {
        capacity: '50 MMSCFD',
        efficiency: '99.5%',
        dropletSize: '10 microns',
        pressureDrop: '2 PSI'
      },
      performance: { 
        efficiency: 98, 
        reliability: 92, 
        maintainability: 85,
        separationEfficiency: 99.5
      },
      commonProblems: [
        {
          problem: 'Mist carryover in gas stream',
          severity: 'medium',
          frequency: 'monthly',
          solution: 'Replace demister pads',
          cost: '$3,000',
          downtime: '8 hours'
        }
      ]
    },
    {
      id: 'oil_weir_3d',
      name: 'Oil Weir 3D',
      nameAr: 'حاجز النفط ثلاثي الأبعاد',
      description: 'Adjustable weir plate for oil level control',
      position: { top: 160, left: 150, depth: 30 },
      type: 'control',
      icon: '🛢️',
      color: '#FF9800',
      size: { width: 80, height: 15, depth: 25 },
      material: 'Stainless Steel 316L',
      specifications: {
        adjustmentRange: '12 inches',
        accuracy: '±0.5 inches',
        material: 'SS 316L',
        thickness: '0.5 inches'
      },
      performance: { 
        efficiency: 94, 
        reliability: 96, 
        maintainability: 90,
        levelAccuracy: 95
      }
    },
    {
      id: 'water_boot_3d',
      name: 'Water Boot 3D',
      nameAr: 'حذاء الماء ثلاثي الأبعاد',
      description: 'Water collection and discharge system',
      position: { top: 220, left: 180, depth: 35 },
      type: 'discharge',
      icon: '💧',
      color: '#00BCD4',
      size: { width: 40, height: 60, depth: 40 },
      material: 'Carbon Steel with Corrosion Protection',
      specifications: {
        capacity: '5,000 bbl/day',
        drainValve: '4 inch',
        levelControl: 'Automatic',
        material: 'Epoxy Lined CS'
      },
      performance: { 
        efficiency: 90, 
        reliability: 88, 
        maintainability: 80,
        drainageEfficiency: 92
      }
    },
    {
      id: 'demister_pads_3d',
      name: 'Demister Pads 3D',
      nameAr: 'وسائد إزالة الضباب ثلاثية الأبعاد',
      description: 'High-efficiency mist elimination system',
      position: { top: 80, left: 120, depth: 45 },
      type: 'internal',
      icon: '🕸️',
      color: '#9C27B0',
      size: { width: 100, height: 20, depth: 60 },
      material: 'Stainless Steel Mesh',
      specifications: {
        efficiency: '99.9%',
        voidFraction: '99%',
        pressureDrop: '1 PSI',
        velocity: '12 ft/sec'
      },
      performance: { 
        efficiency: 99, 
        reliability: 85, 
        maintainability: 70,
        mistRemoval: 99.9
      }
    }
  ];

  // Training curriculum
  const trainingSteps = [
    {
      title: 'مقدمة عن الفاصل',
      description: 'تعرف على مكونات الفاصل الأساسية',
      duration: '5 دقائق',
      type: 'introduction'
    },
    {
      title: 'مبدأ الفصل',
      description: 'كيف يعمل الفاصل في فصل النفط والغاز والماء',
      duration: '10 دقائق',
      type: 'theory'
    },
    {
      title: 'التفاعل مع المكونات',
      description: 'تعلم كيفية التعامل مع كل مكون',
      duration: '15 دقائق',
      type: 'interactive'
    },
    {
      title: 'حل المشاكل الشائعة',
      description: 'تدريب على حل المشاكل العملية',
      duration: '20 دقائق',
      type: 'problem_solving'
    },
    {
      title: 'اختبار نهائي',
      description: 'اختبار شامل للمهارات المكتسبة',
      duration: '10 دقائق',
      type: 'assessment'
    }
  ];

  // Problems database for training
  const problemsDb = [
    {
      id: 'prob_001',
      title: 'انخفاض كفاءة الفصل',
      symptoms: ['زيادة المحتوى المائي في النفط', 'انخفاض جودة الغاز'],
      possibleCauses: [
        'تلف وسائد إزالة الضباب',
        'عدم ضبط مستوى الزيت',
        'انسداد فوهة الدخل'
      ],
      solutions: [
        'استبدال وسائد إزالة الضباب',
        'ضبط حاجز النفط',
        'تنظيف فوهة الدخل'
      ],
      difficulty: 'متوسط',
      timeToSolve: '30 دقيقة'
    },
    {
      id: 'prob_002',
      title: 'تآكل في فوهة الدخل',
      symptoms: ['تآكل واضح', 'انخفاض الضغط', 'اهتزاز غير طبيعي'],
      possibleCauses: [
        'سرعة السوائل العالية',
        'وجود الرمل والشوائب',
        'التآكل الكيميائي'
      ],
      solutions: [
        'تركيب بطانة مقاومة للتآكل',
        'تقليل سرعة التدفق',
        'استخدام مواد مقاومة للتآكل'
      ],
      difficulty: 'صعب',
      timeToSolve: '45 دقيقة'
    }
  ];

  useEffect(() => {
    setProblemsDatabase(problemsDb);
    if (trainingMode) {
      setShowTraining(true);
    }
  }, [trainingMode]);

  // 3D rotation animation
  useEffect(() => {
    if (show3DView) {
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();
      return () => rotationAnimation.stop();
    }
  }, [show3DView, rotateAnim]);

  // Flow simulation animation
  const startFlowSimulation = () => {
    setSimulationRunning(true);
    
    const flowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    );

    flowAnimation.start();

    // Stop simulation after 30 seconds
    setTimeout(() => {
      flowAnimation.stop();
      setSimulationRunning(false);
      setShowSimulation(false);
    }, 30000);
  };

  // Pan responder for 3D interaction
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const newRotation = rotationAngle + gestureState.dx * 0.5;
      setRotationAngle(newRotation);
      
      const newZoom = Math.max(0.5, Math.min(2, zoomLevel + gestureState.dy * 0.01));
      setZoomLevel(newZoom);
    },
  });

  const handlePartPress3D = (part) => {
    // 3D interaction feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    if (localSelectedParts.includes(part.id)) {
      setLocalSelectedParts(prev => prev.filter(id => id !== part.id));
    } else {
      setLocalSelectedParts(prev => [...prev, part.id]);
    }

    setSelectedPartInfo(part);
    setShowPartDetails(true);
  };

  const render3DSeparator = () => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.separator3DContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.separator3D,
            {
              transform: [
                { rotateY: rotation },
                { rotateX: `${rotationAngle * 0.3}deg` },
                { scale: zoomLevel }
              ]
            }
          ]}
        >
          {/* 3D Vessel Body */}
          <View style={styles.vessel3D}>
            <View style={[styles.vesselTop, { backgroundColor: '#E0E0E0' }]} />
            <View style={[styles.vesselBody, { backgroundColor: '#BDBDBD' }]} />
            <View style={[styles.vesselBottom, { backgroundColor: '#9E9E9E' }]} />
          </View>

          {/* 3D Parts */}
          {separator3DParts.map((part) => (
            <TouchableOpacity
              key={part.id}
              style={[
                styles.part3D,
                {
                  top: part.position.top,
                  left: part.position.left,
                  width: part.size.width,
                  height: part.size.height,
                  backgroundColor: localSelectedParts.includes(part.id) ? 
                    part.color : `${part.color}80`,
                  borderColor: part.color,
                  transform: [{ translateZ: part.position.depth }]
                }
              ]}
              onPress={() => handlePartPress3D(part)}
            >
              <Text style={styles.part3DIcon}>{part.icon}</Text>
              <Text style={styles.part3DName}>{part.name}</Text>
              
              {/* Flow animation for simulation */}
              {simulationRunning && (
                <Animated.View
                  style={[
                    styles.flowParticle,
                    {
                      opacity: flowAnim,
                      transform: [{
                        translateX: flowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, part.type === 'inlet' ? 50 : 
                                      part.type === 'outlet' ? -50 : 0],
                        })
                      }]
                    }
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* 3D Controls */}
        <View style={styles.controls3D}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
          >
            <Text style={styles.controlButtonText}>🔍+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
          >
            <Text style={styles.controlButtonText}>🔍-</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              setZoomLevel(1);
              setRotationAngle(0);
            }}
          >
            <Text style={styles.controlButtonText}>🎯</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTrainingModule = () => {
    const currentStep = trainingSteps[currentTrainingStep];
    
    return (
      <View style={styles.trainingModule}>
        <View style={styles.trainingHeader}>
          <Text style={styles.trainingTitle}>نظام التدريب التفاعلي</Text>
          <Text style={styles.trainingProgress}>
            الخطوة {currentTrainingStep + 1} من {trainingSteps.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentTrainingStep + 1) / trainingSteps.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.trainingContent}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepDescription}>{currentStep.description}</Text>
          <Text style={styles.stepDuration}>المدة المتوقعة: {currentStep.duration}</Text>
          
          {currentStep.type === 'interactive' && render3DSeparator()}
          
          {currentStep.type === 'problem_solving' && (
            <View style={styles.problemSolvingSection}>
              <Text style={styles.problemTitle}>مشكلة للحل:</Text>
              {problemsDatabase[0] && (
                <View style={styles.problemCard}>
                  <Text style={styles.problemCardTitle}>{problemsDatabase[0].title}</Text>
                  <Text style={styles.problemSymptoms}>
                    الأعراض: {problemsDatabase[0].symptoms.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.trainingActions}>
          {currentTrainingStep > 0 && (
            <TouchableOpacity
              style={styles.trainingButton}
              onPress={() => setCurrentTrainingStep(prev => prev - 1)}
            >
              <Text style={styles.trainingButtonText}>السابق</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.trainingButton, styles.primaryButton]}
            onPress={() => {
              if (currentTrainingStep < trainingSteps.length - 1) {
                setCurrentTrainingStep(prev => prev + 1);
                setTrainingScore(prev => prev + 20);
              } else {
                Alert.alert(
                  'تهانينا!',
                  `لقد أكملت التدريب بنجاح!\nالنتيجة: ${trainingScore + 20}/100`,
                  [{ text: 'إنهاء', onPress: () => setShowTraining(false) }]
                );
              }
            }}
          >
            <Text style={styles.trainingButtonText}>
              {currentTrainingStep < trainingSteps.length - 1 ? 'التالي' : 'إنهاء'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAdvancedFeatures = () => (
    <View style={styles.advancedFeatures}>
      <TouchableOpacity
        style={styles.featureButton}
        onPress={() => setShow3DView(!show3DView)}
      >
        <Text style={styles.featureButtonText}>
          {show3DView ? '📱 عرض 2D' : '🎲 عرض 3D'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.featureButton}
        onPress={() => setShowSimulation(true)}
      >
        <Text style={styles.featureButtonText}>🌊 محاكاة التدفق</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.featureButton}
        onPress={() => setShowTraining(true)}
      >
        <Text style={styles.featureButtonText}>🎓 نظام التدريب</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الفاصل التفاعلي المتقدم</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => Alert.alert('تصدير', 'سيتم إضافة ميزة التصدير قريباً')}
          >
            <Text style={styles.exportButtonText}>📄 PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.content}>
          {showTraining ? renderTrainingModule() : 
           show3DView ? render3DSeparator() : 
           renderAdvancedFeatures()}

          {/* Selected Parts Summary */}
          {localSelectedParts.length > 0 && !showTraining && (
            <View style={styles.selectionSummary}>
              <Text style={styles.summaryTitle}>
                المكونات المحددة ({localSelectedParts.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {localSelectedParts.map(partId => {
                  const part = separator3DParts.find(p => p.id === partId);
                  return part ? (
                    <View key={partId} style={styles.selectedPartChip}>
                      <Text style={styles.selectedPartIcon}>{part.icon}</Text>
                      <Text style={styles.selectedPartName}>{part.nameAr}</Text>
                    </View>
                  ) : null;
                })}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        {!showTraining && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onSelectionChange && onSelectionChange({
                  selectedParts: localSelectedParts,
                  selectedData: separator3DParts.filter(p => 
                    localSelectedParts.includes(p.id)
                  )
                });
                Alert.alert('تم', 'تم حفظ التحديد بنجاح');
              }}
            >
              <Text style={styles.actionButtonText}>💾 حفظ التحديد</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={() => setLocalSelectedParts([])}
            >
              <Text style={styles.actionButtonText}>🗑️ مسح الكل</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Part Details Modal */}
        <Modal
          visible={showPartDetails}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.detailsModal}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                {selectedPartInfo?.nameAr || selectedPartInfo?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeDetailsButton}
                onPress={() => setShowPartDetails(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContent}>
              {selectedPartInfo && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>المواصفات التقنية</Text>
                    {Object.entries(selectedPartInfo.specifications || {}).map(([key, value]) => (
                      <Text key={key} style={styles.detailText}>
                        {key}: {value}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>مؤشرات الأداء</Text>
                    {Object.entries(selectedPartInfo.performance || {}).map(([key, value]) => (
                      <View key={key} style={styles.performanceBar}>
                        <Text style={styles.performanceLabel}>{key}</Text>
                        <View style={styles.performanceBarContainer}>
                          <View 
                            style={[
                              styles.performanceBarFill, 
                              { width: `${value}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.performanceValue}>{value}%</Text>
                      </View>
                    ))}
                  </View>

                  {selectedPartInfo.commonProblems && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>المشاكل الشائعة</Text>
                      {selectedPartInfo.commonProblems.map((problem, index) => (
                        <View key={index} style={styles.problemItem}>
                          <Text style={styles.problemTitle}>{problem.problem}</Text>
                          <Text style={styles.problemSolution}>الحل: {problem.solution}</Text>
                          <Text style={styles.problemCost}>التكلفة: {problem.cost}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Flow Simulation Modal */}
        <Modal
          visible={showSimulation}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.simulationModal}>
            <View style={styles.simulationContent}>
              <Text style={styles.simulationTitle}>محاكاة التدفق</Text>
              <Text style={styles.simulationDescription}>
                مشاهدة تدفق السوائل خلال الفاصل
              </Text>
              
              {simulationRunning ? (
                <View style={styles.simulationRunning}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.simulationRunningText}>المحاكاة جارية...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startSimulationButton}
                  onPress={startFlowSimulation}
                >
                  <Text style={styles.startSimulationText}>▶️ بدء المحاكاة</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeSimulationButton}
                onPress={() => setShowSimulation(false)}
              >
                <Text style={styles.closeSimulationText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  separator3DContainer: {
    height: 400,
    backgroundColor: '#000',
    borderRadius: 12,
    margin: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  separator3D: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vessel3D: {
    position: 'absolute',
    width: 200,
    height: 300,
  },
  vesselTop: {
    width: '100%',
    height: 30,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  vesselBody: {
    width: '100%',
    height: 240,
  },
  vesselBottom: {
    width: '100%',
    height: 30,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  part3D: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  part3DIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  part3DName: {
    fontSize: 8,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  flowParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  controls3D: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonText: {
    fontSize: 18,
  },
  trainingModule: {
    flex: 1,
    padding: 20,
  },
  trainingHeader: {
    marginBottom: 30,
  },
  trainingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  trainingProgress: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  trainingContent: {
    flex: 1,
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 10,
  },
  stepDuration: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 20,
  },
  problemSolvingSection: {
    marginTop: 20,
  },
  problemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  problemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  problemCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  problemSymptoms: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  trainingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  trainingButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  trainingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  advancedFeatures: {
    padding: 20,
    gap: 15,
  },
  featureButton: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectionSummary: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selectedPartChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedPartIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  selectedPartName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeDetailsButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 25,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  performanceBar: {
    marginBottom: 15,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  performanceBarContainer: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  performanceBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  performanceValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  problemItem: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  problemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 5,
  },
  problemSolution: {
    fontSize: 13,
    color: '#333',
    marginBottom: 3,
  },
  problemCost: {
    fontSize: 12,
    color: '#666',
  },
  simulationModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulationContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  simulationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  simulationDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  simulationRunning: {
    alignItems: 'center',
    marginBottom: 20,
  },
  simulationRunningText: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 10,
  },
  startSimulationButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  startSimulationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeSimulationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeSimulationText: {
    color: '#666',
    fontSize: 14,
  },
});

export default Enhanced3DSeparator;