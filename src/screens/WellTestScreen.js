import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { getUserRole, hasPermission, PERMISSIONS, ROLE_INFO } from '../services/rolesService';
import { ProtectedComponent } from '../components/RoleBasedAccess';
import WellNumberInput from '../components/WellNumberInput';
import OilSeparatorDiagram from '../components/OilSeparatorDiagram';
import EnhancedOilSeparatorDiagram from '../components/EnhancedOilSeparatorDiagram';
import { 
  createWellTest, 
  getAllWellTests, 
  updateWellTest, 
  deleteWellTest,
  getWellTestById
} from '../services/wellTestService';

const WellTestScreen = ({ user, navigation }) => {
  const [userRole, setUserRole] = useState(null);
  const [wellTests, setWellTests] = useState([]);
  const [allWellTests, setAllWellTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWell, setSelectedWell] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('readings');
  const [selectedWellNumber, setSelectedWellNumber] = useState('');
  const [reportWellData, setReportWellData] = useState(null);
  const [showSeparatorDiagram, setShowSeparatorDiagram] = useState(false);
  const [showEnhancedSeparator, setShowEnhancedSeparator] = useState(false);
  const [selectedSeparatorParts, setSelectedSeparatorParts] = useState([]);

  // Form state for new/edit well test
  const [formData, setFormData] = useState({
    wellNumber: '',
    wellType: 'Oil',
    artificialLiftType: 'Natural Flow',
    api: '',
    flowRate: '',
    gasRate: '',
    waterCut: '',
    h2s: '',
    co2: '',
    salinity: '',
    wellheadPressure: '',
    wellheadTemperature: '',
    chokeSize: '',
    testDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    loadUserRole();
    loadAllWellTestsForSuggestions();
  }, [user]);

  const loadUserRole = async () => {
    if (user?.uid) {
      try {
        const roleResult = await getUserRole(user.uid);
        if (roleResult.success) {
          setUserRole(roleResult.role);
          console.log('✅ User role loaded for Well Test:', roleResult.role);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    }
  };

  const loadAllWellTestsForSuggestions = async () => {
    try {
      const result = await getAllWellTests();
      if (result.success) {
        setAllWellTests(result.data);
        console.log('✅ Loaded all well tests for suggestions:', result.data.length);
      }
    } catch (error) {
      console.error('Error loading well tests for suggestions:', error);
    }
  };

  const loadWellTestsForWell = async (wellNumber) => {
    if (!wellNumber.trim()) {
      setWellTests([]);
      return;
    }

    try {
      setIsLoading(true);
      const result = await getAllWellTests();
      
      if (result.success) {
        const filteredTests = result.data.filter(test => 
          test.wellNumber.toLowerCase() === wellNumber.toLowerCase()
        );
        
        filteredTests.sort((a, b) => {
          const dateA = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
          const dateB = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
          return dateB - dateA;
        });
        
        setWellTests(filteredTests);
        console.log('✅ Well tests loaded for well:', wellNumber, filteredTests.length);
      } else {
        Alert.alert('Error', 'Failed to load well tests');
      }
    } catch (error) {
      console.error('Error loading well tests:', error);
      Alert.alert('Error', 'Failed to load well tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWellNumberSelect = (wellNumber) => {
    setSelectedWellNumber(wellNumber);
    setWellTests([]);
    
    if (wellNumber.trim()) {
      loadWellTestsForWell(wellNumber);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    if (selectedWellNumber && tab === 'readings') {
      loadWellTestsForWell(selectedWellNumber);
    }
  };

  const resetForm = () => {
    setFormData({
      wellNumber: '',
      wellType: 'Oil',
      artificialLiftType: 'Natural Flow',
      api: '',
      flowRate: '',
      gasRate: '',
      waterCut: '',
      h2s: '',
      co2: '',
      salinity: '',
      wellheadPressure: '',
      wellheadTemperature: '',
      chokeSize: '',
      testDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.wellNumber.trim()) {
      Alert.alert('Validation Error', 'Well Number is required');
      return false;
    }
    if (!formData.api.trim()) {
      Alert.alert('Validation Error', 'API is required');
      return false;
    }
    return true;
  };

  const handleSubmitWellTest = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const wellTestData = {
        ...formData,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName || user.email,
        userRole: userRole,
        flowRate: parseFloat(formData.flowRate) || 0,
        gasRate: parseFloat(formData.gasRate) || 0,
        waterCut: parseFloat(formData.waterCut) || 0,
        h2s: parseFloat(formData.h2s) || 0,
        co2: parseFloat(formData.co2) || 0,
        salinity: parseFloat(formData.salinity) || 0,
        wellheadPressure: parseFloat(formData.wellheadPressure) || 0,
        wellheadTemperature: parseFloat(formData.wellheadTemperature) || 0,
        chokeSize: parseFloat(formData.chokeSize) || 0
      };

      let result;
      if (selectedWell) {
        result = await updateWellTest(selectedWell.id, wellTestData);
      } else {
        result = await createWellTest(wellTestData);
      }

      if (result.success) {
        Alert.alert(
          'Success', 
          selectedWell ? 'Well test updated successfully!' : 'Well test created successfully!'
        );
        setShowAddModal(false);
        resetForm();
        setSelectedWell(null);
        
        if (selectedWellNumber) {
          await loadWellTestsForWell(selectedWellNumber);
        }
        
        await loadAllWellTestsForSuggestions();
      } else {
        Alert.alert('Error', result.message || 'Failed to save well test');
      }
    } catch (error) {
      console.error('Error submitting well test:', error);
      Alert.alert('Error', 'Failed to save well test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWell = (well) => {
    setSelectedWell(well);
    setFormData({
      wellNumber: well.wellNumber || '',
      wellType: well.wellType || 'Oil',
      artificialLiftType: well.artificialLiftType || 'Natural Flow',
      api: well.api || '',
      flowRate: well.flowRate?.toString() || '',
      gasRate: well.gasRate?.toString() || '',
      waterCut: well.waterCut?.toString() || '',
      h2s: well.h2s?.toString() || '',
      co2: well.co2?.toString() || '',
      salinity: well.salinity?.toString() || '',
      wellheadPressure: well.wellheadPressure?.toString() || '',
      wellheadTemperature: well.wellheadTemperature?.toString() || '',
      chokeSize: well.chokeSize?.toString() || '',
      testDate: well.testDate || new Date().toISOString().split('T')[0],
      notes: well.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteWell = (well) => {
    Alert.alert(
      'Delete Well Test',
      `Are you sure you want to delete well test for ${well.wellNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteWellTest(well.id);
              if (result.success) {
                Alert.alert('Success', 'Well test deleted successfully');
                if (selectedWellNumber) {
                  await loadWellTestsForWell(selectedWellNumber);
                }
              } else {
                Alert.alert('Error', result.message || 'Failed to delete well test');
              }
            } catch (error) {
              console.error('Error deleting well test:', error);
              Alert.alert('Error', 'Failed to delete well test');
            }
          }
        }
      ]
    );
  };

  const handleViewWell = (well) => {
    setSelectedWell(well);
    setShowViewModal(true);
  };

  const handleGenerateReport = (well) => {
    setReportWellData(well);
    setActiveTab('maintenance');
  };

  const handleSeparatorSelection = (selectionData) => {
    setSelectedSeparatorParts(selectionData.selectedParts);
    Alert.alert(
      'Separator Components Added',
      `${selectionData.selectedParts.length} components have been added to your report.`,
      [
        { text: 'View Report', onPress: () => console.log('Selected components:', selectionData.selectedData) },
        { text: 'OK' }
      ]
    );
  };

  const renderWellTestItem = ({ item }) => (
    <View style={styles.wellCard}>
      <View style={styles.wellCardHeader}>
        <View style={styles.wellInfo}>
          <Text style={styles.wellNumber}>Well #{item.wellNumber}</Text>
          <Text style={styles.wellType}>{item.wellType} Well</Text>
          <Text style={styles.wellDate}>Test Date: {item.testDate}</Text>
        </View>
        <View style={styles.wellActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleViewWell(item)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => handleGenerateReport(item)}
          >
            <Text style={styles.reportButtonText}>Report</Text>
          </TouchableOpacity>
          
          <ProtectedComponent
            userRole={userRole}
            requiredPermission={PERMISSIONS.WELL_TEST_EDIT}
            fallback={null}
          >
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditWell(item)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </ProtectedComponent>

          <ProtectedComponent
            userRole={userRole}
            requiredPermission={PERMISSIONS.WELL_TEST_DELETE}
            fallback={null}
          >
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteWell(item)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </ProtectedComponent>
        </View>
      </View>
      
      <View style={styles.wellSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>API:</Text>
          <Text style={styles.summaryValue}>{item.api}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Artificial Lift:</Text>
          <Text style={styles.summaryValue}>{item.artificialLiftType || 'Natural Flow'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Flow Rate:</Text>
          <Text style={styles.summaryValue}>{item.flowRate} bbl/day</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gas Rate:</Text>
          <Text style={styles.summaryValue}>{item.gasRate} scf/day</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Water Cut:</Text>
          <Text style={styles.summaryValue}>{item.waterCut}%</Text>
        </View>
      </View>
      
      <Text style={styles.createdBy}>
        Created by: {item.createdByName} ({ROLE_INFO[item.userRole]?.name || item.userRole})
      </Text>
    </View>
  );

  if (isLoading && selectedWellNumber) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading well tests...</Text>
      </View>
    );
  }

  return (
    <ProtectedComponent
      userRole={userRole}
      requiredPermission={PERMISSIONS.WELL_TEST_VIEW}
      fallback={
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedIcon}>🚫</Text>
          <Text style={styles.accessDeniedText}>
            Access Denied: Well Test Module
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            Your role ({ROLE_INFO[userRole]?.name || 'Unknown'}) does not have permission to access Well Test services.
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            Contact your administrator to request access.
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Well Operations Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage well test data and parameters
          </Text>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'readings' && styles.activeTab]}
              onPress={() => handleTabChange('readings')}
            >
              <Text style={[styles.tabText, activeTab === 'readings' && styles.activeTabText]}>
                🔬 Well Test Readings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'maintenance' && styles.activeTab]}
              onPress={() => handleTabChange('maintenance')}
            >
              <Text style={[styles.tabText, activeTab === 'maintenance' && styles.activeTabText]}>
                📊 Report Builder
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content based on selected tab */}
        <View style={styles.content}>
          {activeTab === 'readings' ? (
            <View style={styles.readingsContent}>
              {/* Well Number Selection - Only in readings tab */}
              <View style={styles.wellNumberSection}>
                <Text style={styles.wellNumberLabel}>Select Well Number:</Text>
                <WellNumberInput
                  value={selectedWellNumber}
                  onWellNumberSelect={handleWellNumberSelect}
                  placeholder="Enter well number (e.g., KGC-001)"
                  suggestionSources={[allWellTests]}
                  showSuggestions={true}
                />
              </View>

              {!selectedWellNumber ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>🎯</Text>
                  <Text style={styles.emptyStateText}>Select a Well Number</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Enter a well number above to view test readings
                  </Text>
                </View>
              ) : (
                <>
                  {/* Well Test Readings Header */}
                  <View style={styles.contentHeader}>
                    <View style={styles.contentHeaderInfo}>
                      <Text style={styles.contentTitle}>Well Test Readings - {selectedWellNumber}</Text>
                      <Text style={styles.contentSubtitle}>
                        {isLoading ? 'Loading...' : `${wellTests.length} test records found`}
                      </Text>
                    </View>
                    
                    <ProtectedComponent
                      userRole={userRole}
                      requiredPermission={PERMISSIONS.WELL_TEST_CREATE}
                      fallback={null}
                    >
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                          resetForm();
                          setSelectedWell(null);
                          setFormData(prev => ({ ...prev, wellNumber: selectedWellNumber }));
                          setShowAddModal(true);
                        }}
                      >
                        <Text style={styles.addButtonText}>+ Add New Test</Text>
                      </TouchableOpacity>
                    </ProtectedComponent>
                  </View>

                  {/* Well Tests List */}
                  {wellTests.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateIcon}>🔬</Text>
                      <Text style={styles.emptyStateText}>No Test Data Found</Text>
                      <Text style={styles.emptyStateSubtext}>
                        No test records found for well {selectedWellNumber}
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={wellTests}
                      renderItem={renderWellTestItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                      refreshing={isLoading}
                      onRefresh={() => loadWellTestsForWell(selectedWellNumber)}
                    />
                  )}
                </>
              )}
            </View>
          ) : (
            <ScrollView style={styles.maintenanceContent}>
              {!reportWellData ? (
                <View style={styles.reportBuilderIntro}>
                  <Text style={styles.emptyStateIcon}>🛢️</Text>
                  <Text style={styles.emptyStateText}>Interactive Oil Separator</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Select separator components to include in your well test reports
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.openDiagramButton}
                    onPress={() => setShowSeparatorDiagram(true)}
                  >
                    <Text style={styles.openDiagramButtonText}>📊 Basic Separator</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.openDiagramButton, styles.enhancedButton]}
                    onPress={() => setShowEnhancedSeparator(true)}
                  >
                    <Text style={styles.openDiagramButtonText}>🚀 Enhanced Separator</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.blueprintContainer}>
                    <Text style={styles.blueprintTitle}>🔧 Oil Separator Components:</Text>
                    
                    <View style={styles.componentsList}>
                      <View style={styles.componentCategory}>
                        <Text style={styles.categoryTitle}>🔵 Flow Components</Text>
                        <Text style={styles.categoryDesc}>Inlet Nozzle, Oil/Gas/Water Outlets</Text>
                      </View>
                      
                      <View style={styles.componentCategory}>
                        <Text style={styles.categoryTitle}>📊 Instrumentation</Text>
                        <Text style={styles.categoryDesc}>Level Indicators, Pressure & Temperature Gauges</Text>
                      </View>
                      
                      <View style={styles.componentCategory}>
                        <Text style={styles.categoryTitle}>⚠️ Safety Systems</Text>
                        <Text style={styles.categoryDesc}>Relief Valves, Emergency Shutdown</Text>
                      </View>
                      
                      <View style={styles.componentCategory}>
                        <Text style={styles.categoryTitle}>🕸️ Internal Components</Text>
                        <Text style={styles.categoryDesc}>Demister Pads, Weir Plates, Inlet Diverters</Text>
                      </View>
                    </View>
                    
                    <View style={styles.instructionStep}>
                      <Text style={styles.stepNumber}>💡</Text>
                      <Text style={styles.stepText}>Click "Open Separator Diagram" to view and select components interactively</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.reportBuilderContainer}>
                  <View style={styles.reportBuilderHeader}>
                    <Text style={styles.reportBuilderTitle}>
                      📊 Report Builder - {reportWellData.wellNumber}
                    </Text>
                    <Text style={styles.reportBuilderSubtitle}>
                      Include separator components in your well test report
                    </Text>
                  </View>

                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.separatorButton}
                      onPress={() => setShowSeparatorDiagram(true)}
                    >
                      <Text style={styles.separatorButtonText}>🛢️ Oil Separator Diagram</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.clearReportButton} 
                      onPress={() => setReportWellData(null)}
                    >
                      <Text style={styles.clearReportButtonText}>New Report</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedSeparatorParts.length > 0 && (
                    <View style={styles.selectedPartsContainer}>
                      <Text style={styles.selectedPartsTitle}>
                        Selected Separator Components ({selectedSeparatorParts.length})
                      </Text>
                      <View style={styles.selectedPartsList}>
                        {selectedSeparatorParts.map((partId, index) => (
                          <View key={partId} style={styles.selectedPartChip}>
                            <Text style={styles.selectedPartText}>{partId.replace('_', ' ')}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.generateReportButton}
                    onPress={() => Alert.alert('Success', `Report generated for ${reportWellData.wellNumber} with ${selectedSeparatorParts.length} separator components`)}
                  >
                    <Text style={styles.generateReportButtonText}>
                      Generate Report
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Add/Edit Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedWell ? 'Edit Well Test' : 'Add New Well Test'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                  setSelectedWell(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <Text style={styles.label}>Well Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wellNumber}
                  onChangeText={(value) => handleInputChange('wellNumber', value)}
                  placeholder="Enter well number"
                />

                <Text style={styles.label}>API *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.api}
                  onChangeText={(value) => handleInputChange('api', value)}
                  placeholder="Enter API number"
                />

                <Text style={styles.label}>Test Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.testDate}
                  onChangeText={(value) => handleInputChange('testDate', value)}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmitWellTest}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {selectedWell ? 'Update Well Test' : 'Create Well Test'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* View Modal */}
        <Modal
          visible={showViewModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Well Test Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowViewModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedWell && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Basic Information</Text>
                  <Text style={styles.viewText}>Well: {selectedWell.wellNumber}</Text>
                  <Text style={styles.viewText}>API: {selectedWell.api}</Text>
                  <Text style={styles.viewText}>Date: {selectedWell.testDate}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>

        {/* Oil Separator Diagram Modal */}
        <OilSeparatorDiagram
          visible={showSeparatorDiagram}
          onClose={() => setShowSeparatorDiagram(false)}
          onSelectionChange={handleSeparatorSelection}
          selectedParts={selectedSeparatorParts}
        />

        {/* Enhanced Oil Separator Diagram Modal */}
        <EnhancedOilSeparatorDiagram
          visible={showEnhancedSeparator}
          onClose={() => setShowEnhancedSeparator(false)}
          onSelectionChange={handleSeparatorSelection}
          selectedParts={selectedSeparatorParts}
        />
      </View>
    </ProtectedComponent>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  accessDeniedIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  accessDeniedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 5,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  readingsContent: {
    flex: 1,
  },
  wellNumberSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  wellNumberLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  contentHeaderInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  maintenanceContent: {
    flex: 1,
  },
  reportBuilderIntro: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openDiagramButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  openDiagramButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  enhancedButton: {
    backgroundColor: '#FF9800',
    marginTop: 10,
  },
  componentsList: {
    width: '100%',
    marginBottom: 16,
  },
  componentCategory: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  blueprintContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blueprintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 24,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  sectionsPreview: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  sectionPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  sectionPreviewInfo: {
    flex: 1,
  },
  sectionPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionPreviewDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reportBuilderContainer: {
    padding: 20,
  },
  reportBuilderHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportBuilderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reportBuilderSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  separatorButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
  },
  separatorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  clearReportButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    flex: 1,
  },
  clearReportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedPartsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPartsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selectedPartsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedPartChip: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  selectedPartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  generateReportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wellCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wellCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wellInfo: {
    flex: 1,
  },
  wellNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  wellType: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 2,
  },
  wellDate: {
    fontSize: 12,
    color: '#999',
  },
  wellActions: {
    flexDirection: 'row',
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  wellSummary: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  createdBy: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewSection: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  viewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  viewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
});

export default WellTestScreen;