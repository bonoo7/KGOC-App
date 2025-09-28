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
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedWell, setSelectedWell] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab state for main categories
  const [activeTab, setActiveTab] = useState('readings');

  // Well number selection state
  const [selectedWellNumber, setSelectedWellNumber] = useState('');

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
                🔧 Maintenance (Coming Soon)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Well Number Selection */}
          <View style={styles.wellNumberSection}>
            <Text style={styles.wellNumberLabel}>Select Well Number:</Text>
            <View style={styles.wellNumberContainer}>
              <TextInput
                style={styles.wellNumberInput}
                value={selectedWellNumber}
                onChangeText={handleWellNumberSelect}
                placeholder="Enter well number (e.g., KGC-001)"
              />
              {selectedWellNumber && (
                <TouchableOpacity
                  style={styles.clearWellButton}
                  onPress={() => {
                    setSelectedWellNumber('');
                    setWellTests([]);
                  }}
                >
                  <Text style={styles.clearWellButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content based on selected tab */}
        <View style={styles.content}>
          {!selectedWellNumber ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateText}>Select a Well Number</Text>
              <Text style={styles.emptyStateSubtext}>
                Enter a well number above to view {activeTab === 'readings' ? 'test readings' : 'maintenance requests'}
              </Text>
            </View>
          ) : activeTab === 'readings' ? (
            <View style={styles.readingsContent}>
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
            </View>
          ) : (
            <View style={styles.maintenanceContent}>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔧</Text>
                <Text style={styles.emptyStateText}>Maintenance Module</Text>
                <Text style={styles.emptyStateSubtext}>
                  Interactive maintenance system coming soon!
                </Text>
              </View>
            </View>
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
  wellNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wellNumberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  clearWellButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearWellButtonText: {
    fontSize: 16,
    color: '#666',
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
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
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