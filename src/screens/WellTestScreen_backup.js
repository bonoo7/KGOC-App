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
  const [allWellTests, setAllWellTests] = useState([]); // For suggestions
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWell, setSelectedWell] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab state for main categories
  const [activeTab, setActiveTab] = useState('readings');

  // Well number selection state
  const [selectedWellNumber, setSelectedWellNumber] = useState('');

  // Interactive Separator state (for maintenance tab)
  const [selectedReportParts, setSelectedReportParts] = useState([]);
  const [reportNotes, setReportNotes] = useState('');
  const [reportWellData, setReportWellData] = useState(null);

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

  // Artificial Lift Types
  const artificialLiftTypes = [
    'Natural Flow',
    'Sucker Rod Pump',
    'Electric Submersible Pump (ESP)',
    'Progressive Cavity Pump (PCP)',
    'Plunger Lift',
    'Gas Lift',
    'Jet Pump',
    'Hydraulic Pump',
    'Beam Pump',
    'Intermittent Gas Lift',
    'Continuous Gas Lift'
  ];

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

  // Load all well tests for suggestions in the well number input
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

  // Load well tests for selected well number only
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
        console.error('Failed to load well tests:', result.message);
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
    
    // If switching to maintenance and we have report data, keep it
    if (tab === 'maintenance' && reportWellData) {
      // Report data is already set
    }
  };

  // Interactive Separator functions for maintenance tab
  const importantParts = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Well number, type, API, and test date',
      fields: ['wellNumber', 'wellType', 'api', 'testDate', 'artificialLiftType'],
      icon: '📋'
    },
    {
      id: 'production_data',
      title: 'Production Data',
      description: 'Flow rates, gas rates, and water cut',
      fields: ['flowRate', 'gasRate', 'waterCut'],
      icon: '⛽'
    },
    {
      id: 'chemical_analysis',
      title: 'Chemical Analysis',
      description: 'H₂S, CO₂, and salinity levels',
      fields: ['h2s', 'co2', 'salinity'],
      icon: '🧪'
    },
    {
      id: 'wellhead_parameters',
      title: 'Wellhead Parameters',
      description: 'Pressure, temperature, and choke size',
      fields: ['wellheadPressure', 'wellheadTemperature', 'chokeSize'],
      icon: '🔧'
    },
    {
      id: 'operational_notes',
      title: 'Operational Notes',
      description: 'Additional notes and observations',
      fields: ['notes'],
      icon: '📝'
    },
    {
      id: 'creation_info',
      title: 'Creation Information',
      description: 'Created by, role, and timestamp',
      fields: ['createdByName', 'userRole', 'createdAt'],
      icon: '👤'
    }
  ];

  const togglePartSelection = (partId) => {
    const updatedSelection = selectedReportParts.includes(partId)
      ? selectedReportParts.filter(id => id !== partId)
      : [...selectedReportParts, partId];
    
    setSelectedReportParts(updatedSelection);
  };

  const selectAllParts = () => {
    setSelectedReportParts(importantParts.map(part => part.id));
  };

  const clearAllParts = () => {
    setSelectedReportParts([]);
  };

  const handleGenerateFinalReport = () => {
    if (selectedReportParts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one part for the report.');
      return;
    }

    if (!reportWellData) {
      Alert.alert('No Data', 'Please select a well test to generate report from.');
      return;
    }

    const selectedData = generateSelectedData();
    
    Alert.alert(
      'Report Generated',
      `Report for ${reportWellData.wellNumber} with ${selectedReportParts.length} sections has been generated.`,
      [
        { text: 'View Report', onPress: () => console.log('View report:', selectedData) },
        { text: 'Export', onPress: () => console.log('Export report:', selectedData) },
        { text: 'OK' }
      ]
    );
  };

  const generateSelectedData = () => {
    const selectedData = {};
    
    selectedReportParts.forEach(partId => {
      const part = importantParts.find(p => p.id === partId);
      if (part && reportWellData) {
        selectedData[partId] = {
          title: part.title,
          icon: part.icon,
          data: {}
        };
        
        part.fields.forEach(field => {
          if (reportWellData[field] !== undefined && reportWellData[field] !== null && reportWellData[field] !== '') {
            selectedData[partId].data[field] = reportWellData[field];
          }
        });
      }
    });
    
    return selectedData;
  };

  const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
      wellNumber: 'Well Number',
      wellType: 'Well Type',
      api: 'API',
      testDate: 'Test Date',
      artificialLiftType: 'Artificial Lift Type',
      flowRate: 'Flow Rate (bbl/day)',
      gasRate: 'Gas Rate (scf/day)',
      waterCut: 'Water Cut (%)',
      h2s: 'H₂S (ppm)',
      co2: 'CO₂ (ppm)',
      salinity: 'Salinity (ppm)',
      wellheadPressure: 'Wellhead Pressure (psi)',
      wellheadTemperature: 'Wellhead Temperature (°F)',
      chokeSize: 'Choke Size (inches)',
      notes: 'Notes',
      createdByName: 'Created By',
      userRole: 'User Role',
      createdAt: 'Created At'
    };
    return fieldNames[fieldName] || fieldName;
  };

  const getFieldValue = (fieldName, value) => {
    if (fieldName === 'createdAt' && value) {
      const date = value.toDate ? value.toDate() : new Date(value);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return value?.toString() || 'N/A';
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
        
        // Refresh suggestions
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
    setActiveTab('maintenance'); // Switch to maintenance tab
    // Auto-scroll to maintenance content would be nice but not essential
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
                  <Text style={styles.emptyStateIcon}>📊</Text>
                  <Text style={styles.emptyStateText}>Interactive Report Builder</Text>
                  <Text style={styles.emptyStateSubtext}>
                    This is where you build custom reports from well test data
                  </Text>
                  
                  {/* Separator Blueprint/Instructions */}
                  <View style={styles.blueprintContainer}>
                    <Text style={styles.blueprintTitle}>🔧 How to Use the Report Builder:</Text>
                    
                    <View style={styles.instructionStep}>
                      <Text style={styles.stepNumber}>1.</Text>
                      <Text style={styles.stepText}>Go to "Well Test Readings" tab and select a well</Text>
                    </View>
                    
                    <View style={styles.instructionStep}>
                      <Text style={styles.stepNumber}>2.</Text>
                      <Text style={styles.stepText}>Click the purple "Report" button on any well test</Text>
                    </View>
                    
                    <View style={styles.instructionStep}>
                      <Text style={styles.stepNumber}>3.</Text>
                      <Text style={styles.stepText}>Come back here to build your custom report</Text>
                    </View>

                    {/* Available Sections Preview */}
                    <View style={styles.sectionsPreview}>
                      <Text style={styles.previewTitle}>📋 Available Report Sections:</Text>
                      {importantParts.map(part => (
                        <View key={part.id} style={styles.sectionPreviewItem}>
                          <Text style={styles.sectionIcon}>{part.icon}</Text>
                          <View style={styles.sectionPreviewInfo}>
                            <Text style={styles.sectionPreviewTitle}>{part.title}</Text>
                            <Text style={styles.sectionPreviewDesc}>{part.description}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.reportBuilderContainer}>
                  {/* Header */}
                  <View style={styles.reportBuilderHeader}>
                    <Text style={styles.reportBuilderTitle}>
                      📊 Report Builder - {reportWellData.wellNumber}
                    </Text>
                    <Text style={styles.reportBuilderSubtitle}>
                      Select important parts to include in your report
                    </Text>
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionButton} onPress={selectAllParts}>
                      <Text style={styles.quickActionText}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionButton} onPress={clearAllParts}>
                      <Text style={styles.quickActionText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.clearReportButton} 
                      onPress={() => setReportWellData(null)}
                    >
                      <Text style={styles.clearReportButtonText}>New Report</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Generate Button */}
                  <TouchableOpacity
                    style={[
                      styles.generateReportButton,
                      selectedReportParts.length === 0 && styles.generateReportButtonDisabled
                    ]}
                    onPress={handleGenerateFinalReport}
                    disabled={selectedReportParts.length === 0}
                  >
                    <Text style={styles.generateReportButtonText}>
                      Generate Report ({selectedReportParts.length} sections)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Add/Edit Modal with all fields */}
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
              {/* Basic Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <Text style={styles.label}>Well Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wellNumber}
                  onChangeText={(value) => handleInputChange('wellNumber', value)}
                  placeholder="Enter well number"
                />

                <Text style={styles.label}>Well Type</Text>
                <View style={styles.pickerContainer}>
                  {['Oil', 'Gas', 'Water', 'Injection'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.pickerOption,
                        formData.wellType === type && styles.pickerOptionSelected
                      ]}
                      onPress={() => handleInputChange('wellType', type)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.wellType === type && styles.pickerOptionTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Artificial Lift Type</Text>
                <View style={styles.pickerContainer}>
                  {artificialLiftTypes.map((liftType) => (
                    <TouchableOpacity
                      key={liftType}
                      style={[
                        styles.pickerOption,
                        formData.artificialLiftType === liftType && styles.pickerOptionSelected
                      ]}
                      onPress={() => handleInputChange('artificialLiftType', liftType)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.artificialLiftType === liftType && styles.pickerOptionTextSelected
                      ]}>
                        {liftType}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

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

              {/* Production Data */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Production Data</Text>
                
                <Text style={styles.label}>Flow Rate (bbl/day)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.flowRate}
                  onChangeText={(value) => handleInputChange('flowRate', value)}
                  placeholder="Enter flow rate"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Gas Rate (scf/day)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.gasRate}
                  onChangeText={(value) => handleInputChange('gasRate', value)}
                  placeholder="Enter gas rate"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Water Cut (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.waterCut}
                  onChangeText={(value) => handleInputChange('waterCut', value)}
                  placeholder="Enter water cut percentage"
                  keyboardType="numeric"
                />
              </View>

              {/* Chemical Analysis */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chemical Analysis</Text>
                
                <Text style={styles.label}>H₂S (ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.h2s}
                  onChangeText={(value) => handleInputChange('h2s', value)}
                  placeholder="Enter H2S content"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>CO₂ (ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.co2}
                  onChangeText={(value) => handleInputChange('co2', value)}
                  placeholder="Enter CO2 content"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Salinity (ppm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.salinity}
                  onChangeText={(value) => handleInputChange('salinity', value)}
                  placeholder="Enter salinity"
                  keyboardType="numeric"
                />
              </View>

              {/* Wellhead Parameters */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Wellhead Parameters</Text>
                
                <Text style={styles.label}>Wellhead Pressure (psi)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wellheadPressure}
                  onChangeText={(value) => handleInputChange('wellheadPressure', value)}
                  placeholder="Enter wellhead pressure"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Wellhead Temperature (°F)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.wellheadTemperature}
                  onChangeText={(value) => handleInputChange('wellheadTemperature', value)}
                  placeholder="Enter wellhead temperature"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Choke Size (inches)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.chokeSize}
                  onChangeText={(value) => handleInputChange('chokeSize', value)}
                  placeholder="Enter choke size"
                  keyboardType="numeric"
                />
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={formData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  placeholder="Enter any additional notes..."
                  multiline
                  numberOfLines={4}
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
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Well Number:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellNumber}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Well Type:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellType}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Artificial Lift Type:</Text>
                    <Text style={styles.viewValue}>{selectedWell.artificialLiftType || 'Natural Flow'}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>API:</Text>
                    <Text style={styles.viewValue}>{selectedWell.api}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Test Date:</Text>
                    <Text style={styles.viewValue}>{selectedWell.testDate}</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Production Data</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Flow Rate:</Text>
                    <Text style={styles.viewValue}>{selectedWell.flowRate} bbl/day</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Gas Rate:</Text>
                    <Text style={styles.viewValue}>{selectedWell.gasRate} scf/day</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Water Cut:</Text>
                    <Text style={styles.viewValue}>{selectedWell.waterCut}%</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Chemical Analysis</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>H₂S:</Text>
                    <Text style={styles.viewValue}>{selectedWell.h2s} ppm</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>CO₂:</Text>
                    <Text style={styles.viewValue}>{selectedWell.co2} ppm</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Salinity:</Text>
                    <Text style={styles.viewValue}>{selectedWell.salinity} ppm</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Wellhead Parameters</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Wellhead Pressure:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellheadPressure} psi</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Wellhead Temperature:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellheadTemperature} °F</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Choke Size:</Text>
                    <Text style={styles.viewValue}>{selectedWell.chokeSize} inches</Text>
                  </View>
                </View>

                {selectedWell.notes && (
                  <View style={styles.viewSection}>
                    <Text style={styles.viewSectionTitle}>Notes</Text>
                    <Text style={styles.viewNotes}>{selectedWell.notes}</Text>
                  </View>
                )}

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Creation Info</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Created By:</Text>
                    <Text style={styles.viewValue}>{selectedWell.createdByName}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Role:</Text>
                    <Text style={styles.viewValue}>
                      {ROLE_INFO[selectedWell.userRole]?.name || selectedWell.userRole}
                    </Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Created:</Text>
                    <Text style={styles.viewValue}>
                      {selectedWell.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
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
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Well Number:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellNumber}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Well Type:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellType}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Artificial Lift Type:</Text>
                    <Text style={styles.viewValue}>{selectedWell.artificialLiftType || 'Natural Flow'}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>API:</Text>
                    <Text style={styles.viewValue}>{selectedWell.api}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Test Date:</Text>
                    <Text style={styles.viewValue}>{selectedWell.testDate}</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Production Data</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Flow Rate:</Text>
                    <Text style={styles.viewValue}>{selectedWell.flowRate} bbl/day</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Gas Rate:</Text>
                    <Text style={styles.viewValue}>{selectedWell.gasRate} scf/day</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Water Cut:</Text>
                    <Text style={styles.viewValue}>{selectedWell.waterCut}%</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Chemical Analysis</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>H₂S:</Text>
                    <Text style={styles.viewValue}>{selectedWell.h2s} ppm</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>CO₂:</Text>
                    <Text style={styles.viewValue}>{selectedWell.co2} ppm</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Salinity:</Text>
                    <Text style={styles.viewValue}>{selectedWell.salinity} ppm</Text>
                  </View>
                </View>

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Wellhead Parameters</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Wellhead Pressure:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellheadPressure} psi</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Wellhead Temperature:</Text>
                    <Text style={styles.viewValue}>{selectedWell.wellheadTemperature} °F</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Choke Size:</Text>
                    <Text style={styles.viewValue}>{selectedWell.chokeSize} inches</Text>
                  </View>
                </View>

                {selectedWell.notes && (
                  <View style={styles.viewSection}>
                    <Text style={styles.viewSectionTitle}>Notes</Text>
                    <Text style={styles.viewNotes}>{selectedWell.notes}</Text>
                  </View>
                )}

                <View style={styles.viewSection}>
                  <Text style={styles.viewSectionTitle}>Creation Info</Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Created By:</Text>
                    <Text style={styles.viewValue}>{selectedWell.createdByName}</Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Role:</Text>
                    <Text style={styles.viewValue}>
                      {ROLE_INFO[selectedWell.userRole]?.name || selectedWell.userRole}
                    </Text>
                  </View>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewLabel}>Created:</Text>
                    <Text style={styles.viewValue}>
                      {selectedWell.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>
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
  wellNumberSection: {
    marginBottom: 10,
  },
  wellNumberLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  content: {
    flex: 1,
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
  readingsContent: {
    flex: 1,
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
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearReportButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearReportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  partsContainer: {
    marginBottom: 24,
  },
  partItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  partItemSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fffe',
  },
  partItemDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#d0d0d0',
  },
  partHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  partInfo: {
    flex: 1,
  },
  partTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  partTitleSelected: {
    color: '#4CAF50',
  },
  partTitleDisabled: {
    color: '#999',
  },
  partDescription: {
    fontSize: 14,
    color: '#666',
  },
  partDescriptionDisabled: {
    color: '#aaa',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  previewContainer: {
    marginBottom: 24,
  },
  preview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  previewSection: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  previewValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 100,
    textAlignVertical: 'top',
  },
  generateReportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateReportButtonDisabled: {
    backgroundColor: '#ccc',
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
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  pickerOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#fff',
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
  viewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  viewLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  viewValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  viewNotes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default WellTestScreen;