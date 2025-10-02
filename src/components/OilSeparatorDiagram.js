// Interactive Oil Separator Diagram Component
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert
} from 'react-native';

const OilSeparatorDiagram = ({ 
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

  // Oil Separator Parts with positions and descriptions
  const separatorParts = [
    {
      id: 'inlet_nozzle',
      name: 'Inlet Nozzle',
      description: 'Entry point for oil/gas/water mixture from wellhead',
      position: { top: 140, left: 10 },
      type: 'inlet',
      function: 'Receives production fluid mixture',
      specifications: ['Size: 4-6 inches', 'Material: Carbon Steel', 'Pressure Rating: 150-600 PSI'],
      icon: '🔵',
      commonProblems: [
        'Erosion due to high velocity fluids',
        'Plugging from sand or debris',
        'Corrosion from H2S/CO2',
        'Thermal stress cracking'
      ]
    },
    {
      id: 'oil_outlet',
      name: 'Oil Outlet',
      description: 'Clean oil discharge point',
      position: { top: 120, right: 10 },
      type: 'outlet',
      function: 'Discharges separated oil',
      specifications: ['Size: 3-4 inches', 'Material: Carbon Steel', 'Control: Level-controlled valve'],
      icon: '⚫',
      commonProblems: [
        'Level control valve malfunction',
        'Oil carryover due to poor separation',
        'Emulsion formation',
        'Blockage from wax or paraffin'
      ]
    },
    {
      id: 'gas_outlet',
      name: 'Gas Outlet',
      description: 'Separated gas discharge point',
      position: { top: 60, right: 100 },
      type: 'outlet',
      function: 'Releases separated gas phase',
      specifications: ['Size: 6-8 inches', 'Material: Carbon Steel', 'Control: Pressure-controlled valve'],
      icon: '🔴',
      commonProblems: [
        'Pressure control issues',
        'Liquid carryover in gas stream',
        'Demister pad flooding',
        'Back pressure problems'
      ]
    },
    {
      id: 'water_outlet',
      name: 'Water Outlet',
      description: 'Separated water discharge point',
      position: { bottom: 60, right: 10 },
      type: 'outlet',
      function: 'Discharges separated water',
      specifications: ['Size: 2-3 inches', 'Material: Carbon Steel', 'Control: Interface-controlled valve'],
      icon: '💧',
      commonProblems: [
        'Interface level control issues',
        'Oil in water discharge',
        'Scale formation',
        'Corrosion in water handling systems'
      ]
    },
    {
      id: 'oil_level_indicator',
      name: 'Oil Level Indicator',
      description: 'Shows oil level in separator',
      position: { top: 100, left: 60 },
      type: 'instrument',
      function: 'Monitors oil level for control',
      specifications: ['Type: Sight glass or electronic', 'Range: 0-100%', 'Accuracy: ±2%'],
      icon: '📊',
      commonProblems: [
        'Sight glass fouling',
        'Electronic sensor drift',
        'Emulsion layer confusion',
        'Calibration errors'
      ]
    },
    {
      id: 'pressure_gauge',
      name: 'Pressure Gauge',
      description: 'Operating pressure indicator',
      position: { top: 30, left: 80 },
      type: 'instrument',
      function: 'Monitors separator pressure',
      specifications: ['Range: 0-300 PSI', 'Type: Bourdon tube', 'Accuracy: ±1%'],
      icon: '⏱️',
      commonProblems: [
        'Gauge needle sticking',
        'Pressure tap plugging',
        'Bourdon tube fatigue',
        'Temperature compensation errors'
      ]
    },
    {
      id: 'temperature_gauge',
      name: 'Temperature Gauge',
      description: 'Operating temperature indicator',
      position: { top: 30, left: 140 },
      type: 'instrument',
      function: 'Monitors separator temperature',
      specifications: ['Range: -20 to 200°F', 'Type: Bimetallic', 'Accuracy: ±2°F'],
      icon: '🌡️',
      commonProblems: [
        'Thermowell corrosion',
        'Response time lag',
        'Calibration drift',
        'Ambient temperature effects'
      ]
    },
    {
      id: 'relief_valve',
      name: 'Relief Valve',
      description: 'Safety pressure relief system',
      position: { top: 10, left: 110 },
      type: 'safety',
      function: 'Protects from overpressure',
      specifications: ['Set pressure: 125% of MAWP', 'Type: Spring-loaded', 'Material: Stainless Steel'],
      icon: '⚠️',
      commonProblems: [
        'Chattering at set pressure',
        'Seat leakage',
        'Spring degradation',
        'Corrosion products buildup'
      ]
    },
    {
      id: 'demister_pad',
      name: 'Demister Pad',
      description: 'Removes liquid droplets from gas',
      position: { top: 80, left: 180 },
      type: 'internal',
      function: 'Gas-liquid separation enhancement',
      specifications: ['Material: Stainless Steel mesh', 'Efficiency: 99%+', 'Pressure drop: <2 PSI'],
      icon: '🕸️',
      commonProblems: [
        'Mesh plugging with solids',
        'Corrosion of wire mesh',
        'Liquid loading and flooding',
        'Mechanical damage from surging'
      ]
    },
    {
      id: 'weir_plate',
      name: 'Weir Plate',
      description: 'Controls oil-water interface',
      position: { bottom: 100, left: 160 },
      type: 'internal',
      function: 'Maintains proper liquid levels',
      specifications: ['Material: Carbon Steel', 'Height: Adjustable', 'Thickness: 1/4 inch'],
      icon: '🔲',
      commonProblems: [
        'Scale buildup on weir edge',
        'Corrosion and metal loss',
        'Improper height setting',
        'Emulsion band formation'
      ]
    },
    {
      id: 'inlet_diverter',
      name: 'Inlet Diverter',
      description: 'Reduces inlet velocity and turbulence',
      position: { top: 140, left: 50 },
      type: 'internal',
      function: 'Improves separation efficiency',
      specifications: ['Type: Baffle plate', 'Material: Carbon Steel', 'Angle: 45 degrees'],
      icon: '↩️',
      commonProblems: [
        'Erosion from high velocity impact',
        'Vibration and fatigue cracking',
        'Sand cutting and wear',
        'Support bracket failure'
      ]
    },
    {
      id: 'drain_valve',
      name: 'Drain Valve',
      description: 'Bottom drain for maintenance',
      position: { bottom: 10, left: 110 },
      type: 'utility',
      function: 'Complete vessel drainage',
      specifications: ['Size: 2 inches', 'Type: Ball valve', 'Material: Carbon Steel'],
      icon: '🔧',
      commonProblems: [
        'Valve seat damage from debris',
        'Actuator mechanism failure',
        'Internal corrosion',
        'Packing gland leakage'
      ]
    },
    {
      id: 'manhole',
      name: 'Manhole',
      description: 'Access port for maintenance',
      position: { top: 200, left: 80 },
      type: 'utility',
      function: 'Personnel and equipment access',
      specifications: ['Size: 20 inches', 'Type: Hinged cover', 'Gasket: EPDM'],
      icon: '🚪',
      commonProblems: [
        'Gasket deterioration and leaking',
        'Bolt corrosion and seizure',
        'Cover warping',
        'Hinge mechanism wear'
      ]
    },
    {
      id: 'level_transmitter',
      name: 'Level Transmitter',
      description: 'Electronic level measurement',
      position: { top: 120, left: 200 },
      type: 'instrument',
      function: 'Continuous level monitoring',
      specifications: ['Type: Differential pressure', 'Output: 4-20mA', 'Accuracy: ±0.5%'],
      icon: '📡',
      commonProblems: [
        'Impulse line plugging',
        'Diaphragm rupture',
        'Signal interference',
        'Condensate accumulation'
      ]
    },
    {
      id: 'insulation',
      name: 'Insulation System',
      description: 'Thermal insulation covering',
      position: { bottom: 120, left: 40 },
      type: 'utility',
      function: 'Temperature control and personnel protection',
      specifications: ['Type: Mineral wool', 'Thickness: 2-4 inches', 'Jacketing: Aluminum'],
      icon: '🧥',
      commonProblems: [
        'Moisture ingress and wet insulation',
        'Jacketing damage and corrosion',
        'Insulation settling and gaps',
        'CUI (Corrosion Under Insulation)'
      ]
    }
  ];

  const togglePartSelection = (partId) => {
    const updatedSelection = localSelectedParts.includes(partId)
      ? localSelectedParts.filter(id => id !== partId)
      : [...localSelectedParts, partId];
    
    setLocalSelectedParts(updatedSelection);
  };

  const handlePartPress = (part) => {
    setSelectedPartInfo(part);
    setShowPartDetails(true);
  };

  const selectAllParts = () => {
    setLocalSelectedParts(separatorParts.map(part => part.id));
  };

  const clearAllParts = () => {
    setLocalSelectedParts([]);
  };

  const applySelection = () => {
    if (localSelectedParts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one separator component for the report.');
      return;
    }

    const selectedData = generateSelectedData();
    
    // Generate comprehensive report
    const report = generateComponentReport(selectedData);
    setReportData(report);
    setShowReport(true);
    
    // Also pass data back to parent
    onSelectionChange({
      selectedParts: localSelectedParts,
      selectedData,
      partType: 'oil_separator',
      report: report
    });
  };

  const generateComponentReport = (selectedData) => {
    const report = {
      title: `Oil Separator Component Analysis Report`,
      timestamp: new Date().toLocaleString(),
      selectedComponents: localSelectedParts.length,
      sections: []
    };

    // Group components by type
    const componentsByType = {};
    Object.entries(selectedData).forEach(([partId, partData]) => {
      if (!componentsByType[partData.type]) {
        componentsByType[partData.type] = [];
      }
      componentsByType[partData.type].push({ id: partId, ...partData });
    });

    // Generate sections for each type
    Object.entries(componentsByType).forEach(([type, components]) => {
      const section = {
        type: type,
        title: getTypeTitle(type),
        color: getPartTypeColor(type),
        components: components.map(comp => ({
          ...comp,
          problemAnalysis: generateProblemAnalysis(comp)
        }))
      };
      report.sections.push(section);
    });

    return report;
  };

  const generateProblemAnalysis = (component) => {
    const part = separatorParts.find(p => p.id === component.id);
    if (!part || !part.commonProblems) return 'No common problems identified';

    return {
      commonIssues: part.commonProblems,
      recommendations: generateRecommendations(part),
      inspectionPoints: generateInspectionPoints(part),
      maintenanceSchedule: generateMaintenanceSchedule(part)
    };
  };

  const generateRecommendations = (part) => {
    const recommendations = {
      'inlet': [
        'Install erosion-resistant materials in high-velocity areas',
        'Implement regular inspection schedule for wear patterns',
        'Consider velocity reduction techniques',
        'Monitor fluid chemistry for corrosive components'
      ],
      'outlet': [
        'Verify control valve operation and calibration',
        'Check for proper level/pressure control settings',
        'Inspect for internal corrosion or buildup',
        'Ensure adequate downstream pressure relief'
      ],
      'instrument': [
        'Perform regular calibration checks',
        'Clean and inspect sensing elements',
        'Verify signal transmission integrity',
        'Check environmental protection systems'
      ],
      'safety': [
        'Test relief valve operation annually',
        'Inspect spring mechanism and seat condition',
        'Verify set pressure accuracy',
        'Ensure proper discharge routing'
      ],
      'internal': [
        'Monitor differential pressure across components',
        'Inspect for mechanical damage or wear',
        'Check support structures and attachments',
        'Evaluate separation efficiency performance'
      ],
      'utility': [
        'Verify valve operation and sealing',
        'Inspect access ports and closures',
        'Check insulation condition and coverage',
        'Ensure proper drainage and ventilation'
      ]
    };

    return recommendations[part.type] || ['Regular inspection and maintenance recommended'];
  };

  const generateInspectionPoints = (part) => {
    const inspectionPoints = {
      'inlet': ['Check for erosion patterns', 'Measure wall thickness', 'Inspect nozzle alignment', 'Check for debris buildup'],
      'outlet': ['Verify valve operation', 'Check for leakage', 'Inspect piping supports', 'Test control system response'],
      'instrument': ['Calibration verification', 'Signal quality check', 'Environmental seal inspection', 'Mounting security check'],
      'safety': ['Relief valve lift test', 'Seat leakage test', 'Spring compression check', 'Discharge line inspection'],
      'internal': ['Visual inspection', 'Dimensional measurements', 'Support structure check', 'Performance evaluation'],
      'utility': ['Operational test', 'Seal integrity check', 'Access verification', 'Condition assessment']
    };

    return inspectionPoints[part.type] || ['General visual inspection'];
  };

  const generateMaintenanceSchedule = (part) => {
    const schedules = {
      'inlet': 'Monthly visual inspection, Annual thickness testing',
      'outlet': 'Weekly operational check, Quarterly valve service',
      'instrument': 'Monthly calibration check, Semi-annual full service',
      'safety': 'Annual lift test, 5-year overhaul',
      'internal': 'Annual inspection during shutdown, As-needed replacement',
      'utility': 'Monthly operational test, Annual full inspection'
    };

    return schedules[part.type] || 'Follow manufacturer recommendations';
  };

  const getTypeTitle = (type) => {
    const titles = {
      inlet: 'Inlet Systems',
      outlet: 'Outlet Systems', 
      instrument: 'Instrumentation',
      safety: 'Safety Systems',
      internal: 'Internal Components',
      utility: 'Utility Systems'
    };
    return titles[type] || 'Components';
  };

  const generateSelectedData = () => {
    const selectedData = {};
    
    localSelectedParts.forEach(partId => {
      const part = separatorParts.find(p => p.id === partId);
      if (part) {
        selectedData[partId] = {
          name: part.name,
          description: part.description,
          function: part.function,
          specifications: part.specifications,
          type: part.type,
          icon: part.icon
        };
      }
    });
    
    return selectedData;
  };

  const getPartTypeColor = (type) => {
    const colors = {
      inlet: '#4CAF50',
      outlet: '#2196F3',
      instrument: '#FF9800',
      safety: '#F44336',
      internal: '#9C27B0',
      utility: '#607D8B'
    };
    return colors[type] || '#757575';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Interactive Oil Separator</Text>
          <Text style={styles.headerSubtitle}>
            Select components to include in your report
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={selectAllParts}>
              <Text style={styles.quickActionText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={clearAllParts}>
              <Text style={styles.quickActionText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Oil Separator Diagram */}
          <View style={styles.diagramContainer}>
            <Text style={styles.diagramTitle}>🛢️ Three-Phase Oil Separator - Detailed View</Text>
            
            {/* Separator Vessel */}
            <View style={styles.separatorVessel}>
              {/* Vessel Body - More detailed */}
              <View style={styles.vesselBody}>
                {/* Vessel Shell */}
                <View style={styles.vesselShell}>
                  <Text style={styles.vesselLabel}>SEPARATOR VESSEL</Text>
                  <Text style={styles.vesselSpecs}>150 PSI MAWP | 3-Phase</Text>
                </View>
                
                {/* Head sections */}
                <View style={styles.leftHead} />
                <View style={styles.rightHead} />
                
                {/* Gas Section with flow pattern */}
                <View style={styles.gasSection}>
                  <Text style={styles.sectionLabel}>GAS PHASE</Text>
                  <View style={styles.gasFlow}>
                    <Text style={styles.flowArrows}>→ → → →</Text>
                  </View>
                </View>
                
                {/* Oil Section with interface */}
                <View style={styles.oilSection}>
                  <Text style={styles.sectionLabel}>OIL PHASE</Text>
                  <View style={styles.oilInterface}>
                    <Text style={styles.interfaceLabel}>Gas-Oil Interface</Text>
                  </View>
                </View>
                
                {/* Water Section */}
                <View style={styles.waterSection}>
                  <Text style={styles.sectionLabel}>WATER PHASE</Text>
                  <View style={styles.waterInterface}>
                    <Text style={styles.interfaceLabel}>Oil-Water Interface</Text>
                  </View>
                </View>

                {/* Internal components visualization */}
                <View style={styles.internalComponents}>
                  {/* Demister pad representation */}
                  <View style={styles.demisterArea}>
                    <Text style={styles.demisterPattern}>::::::::</Text>
                    <Text style={styles.demisterPattern}>::::::::</Text>
                  </View>
                  
                  {/* Weir plate representation */}
                  <View style={styles.weirPlate}>
                    <View style={styles.weirLine} />
                  </View>
                  
                  {/* Inlet diverter */}
                  <View style={styles.diverterPlate} />
                </View>

                {/* Nozzle connections */}
                <View style={styles.inletNozzle} />
                <View style={styles.gasOutletNozzle} />
                <View style={styles.oilOutletNozzle} />
                <View style={styles.waterOutletNozzle} />
                <View style={styles.drainNozzle} />
              </View>

              {/* Support structure */}
              <View style={styles.vesselSupports}>
                <View style={styles.supportLeg} />
                <View style={styles.supportLeg} />
              </View>

              {/* Piping connections */}
              <View style={styles.pipingConnections}>
                <View style={styles.inletPiping} />
                <View style={styles.gasOutletPiping} />
                <View style={styles.oilOutletPiping} />
                <View style={styles.waterOutletPiping} />
              </View>

              {/* Interactive Parts - positioned over the detailed drawing */}
              {separatorParts.map(part => {
                const isSelected = localSelectedParts.includes(part.id);
                return (
                  <TouchableOpacity
                    key={part.id}
                    style={[
                      styles.separatorPart,
                      part.position,
                      isSelected && styles.partSelected,
                      { backgroundColor: getPartTypeColor(part.type) }
                    ]}
                    onPress={() => handlePartPress(part)}
                    onLongPress={() => togglePartSelection(part.id)}
                  >
                    <Text style={styles.partIcon}>{part.icon}</Text>
                    <Text style={styles.partName}>{part.name}</Text>
                    {isSelected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedCheckmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Component Types</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Inlet</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.legendText}>Outlet</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.legendText}>Instrument</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
                <Text style={styles.legendText}>Safety</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
                <Text style={styles.legendText}>Internal</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#607D8B' }]} />
                <Text style={styles.legendText}>Utility</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to Use:</Text>
            <Text style={styles.instructionText}>• Tap any component to see details</Text>
            <Text style={styles.instructionText}>• Long press to select/deselect for report</Text>
            <Text style={styles.instructionText}>• Selected parts will be included in your report</Text>
            <Text style={styles.instructionText}>• Use quick actions to select all or clear selection</Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.selectionCount}>
            {localSelectedParts.length} component{localSelectedParts.length !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity
            style={[
              styles.applyButton,
              localSelectedParts.length === 0 && styles.applyButtonDisabled
            ]}
            onPress={applySelection}
            disabled={localSelectedParts.length === 0}
          >
            <Text style={styles.applyButtonText}>Add to Report</Text>
          </TouchableOpacity>
        </View>

        {/* Part Details Modal */}
        <Modal
          visible={showPartDetails}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPartDetails(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPartDetails(false)}
          >
            <View style={styles.partDetailsModal}>
              {selectedPartInfo && (
                <>
                  <View style={styles.partDetailsHeader}>
                    <Text style={styles.partDetailsIcon}>{selectedPartInfo.icon}</Text>
                    <Text style={styles.partDetailsTitle}>{selectedPartInfo.name}</Text>
                    <TouchableOpacity
                      style={styles.partDetailsClose}
                      onPress={() => setShowPartDetails(false)}
                    >
                      <Text style={styles.partDetailsCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.partDetailsContent}>
                    <Text style={styles.partDetailsDescription}>
                      {selectedPartInfo.description}
                    </Text>
                    
                    <Text style={styles.partDetailsFunction}>
                      Function: {selectedPartInfo.function}
                    </Text>
                    
                    <Text style={styles.specificationsTitle}>Specifications:</Text>
                    {selectedPartInfo.specifications.map((spec, index) => (
                      <Text key={index} style={styles.specificationText}>
                        • {spec}
                      </Text>
                    ))}
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={[
                      styles.selectPartButton,
                      localSelectedParts.includes(selectedPartInfo.id) && styles.selectPartButtonSelected
                    ]}
                    onPress={() => {
                      togglePartSelection(selectedPartInfo.id);
                      setShowPartDetails(false);
                    }}
                  >
                    <Text style={styles.selectPartButtonText}>
                      {localSelectedParts.includes(selectedPartInfo.id) ? 'Remove from Report' : 'Add to Report'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Comprehensive Component Report Modal */}
        <Modal
          visible={showReport}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.reportModalContainer}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Component Analysis Report</Text>
              <TouchableOpacity
                style={styles.reportCloseButton}
                onPress={() => {
                  setShowReport(false);
                  onClose(); // Close the main diagram too
                }}
              >
                <Text style={styles.reportCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {reportData && (
              <ScrollView style={styles.reportContent}>
                {/* Report Header Info */}
                <View style={styles.reportInfo}>
                  <Text style={styles.reportInfoTitle}>{reportData.title}</Text>
                  <Text style={styles.reportInfoSubtitle}>Generated: {reportData.timestamp}</Text>
                  <Text style={styles.reportInfoSubtitle}>
                    Components Analyzed: {reportData.selectedComponents}
                  </Text>
                </View>

                {/* Report Sections */}
                {reportData.sections.map((section, sectionIndex) => (
                  <View key={sectionIndex} style={styles.reportSection}>
                    <View style={[styles.reportSectionHeader, { backgroundColor: section.color }]}>
                      <Text style={styles.reportSectionTitle}>{section.title}</Text>
                      <Text style={styles.reportSectionCount}>
                        {section.components.length} component{section.components.length !== 1 ? 's' : ''}
                      </Text>
                    </View>

                    {section.components.map((component, compIndex) => (
                      <View key={compIndex} style={styles.componentAnalysis}>
                        <View style={styles.componentHeader}>
                          <Text style={styles.componentIcon}>{component.icon}</Text>
                          <Text style={styles.componentName}>{component.name}</Text>
                        </View>

                        <Text style={styles.componentDescription}>{component.description}</Text>
                        <Text style={styles.componentFunction}>Function: {component.function}</Text>

                        <View style={styles.specificationsSection}>
                          <Text style={styles.sectionSubtitle}>Specifications:</Text>
                          {component.specifications.map((spec, specIndex) => (
                            <Text key={specIndex} style={styles.specText}>• {spec}</Text>
                          ))}
                        </View>

                        {component.problemAnalysis && (
                          <View style={styles.problemAnalysisSection}>
                            <Text style={styles.sectionSubtitle}>⚠️ Common Problems:</Text>
                            {component.problemAnalysis.commonIssues?.map((problem, problemIndex) => (
                              <Text key={problemIndex} style={styles.problemText}>• {problem}</Text>
                            ))}

                            <Text style={styles.sectionSubtitle}>💡 Recommendations:</Text>
                            {component.problemAnalysis.recommendations?.map((rec, recIndex) => (
                              <Text key={recIndex} style={styles.recommendationText}>• {rec}</Text>
                            ))}

                            <Text style={styles.sectionSubtitle}>🔍 Inspection Points:</Text>
                            {component.problemAnalysis.inspectionPoints?.map((point, pointIndex) => (
                              <Text key={pointIndex} style={styles.inspectionText}>• {point}</Text>
                            ))}

                            <Text style={styles.sectionSubtitle}>📅 Maintenance Schedule:</Text>
                            <Text style={styles.maintenanceText}>{component.problemAnalysis.maintenanceSchedule}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ))}

                {/* Report Summary */}
                <View style={styles.reportSummary}>
                  <Text style={styles.reportSummaryTitle}>📋 Summary & Next Steps</Text>
                  <Text style={styles.reportSummaryText}>
                    This analysis covers {reportData.selectedComponents} critical separator components. 
                    Review each component's common problems and follow the recommended inspection schedules 
                    to ensure optimal separator performance and prevent unplanned downtime.
                  </Text>
                  <Text style={styles.reportSummaryText}>
                    For immediate concerns, prioritize safety systems and instrumentation components. 
                    Schedule maintenance activities during planned shutdowns when possible.
                  </Text>
                </View>
              </ScrollView>
            )}

            {/* Report Actions */}
            <View style={styles.reportActions}>
              <TouchableOpacity
                style={styles.reportActionButton}
                onPress={() => Alert.alert('Export', 'Report export functionality will be implemented')}
              >
                <Text style={styles.reportActionText}>📤 Export Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reportActionButton}
                onPress={() => Alert.alert('Print', 'Report printing functionality will be implemented')}
              >
                <Text style={styles.reportActionText}>🖨️ Print Report</Text>
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
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
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
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
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
  diagramContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  diagramTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  separatorVessel: {
    position: 'relative',
    height: 400,
    width: '100%',
    marginBottom: 20,
  },
  vesselBody: {
    position: 'absolute',
    top: 60,
    left: 30,
    right: 30,
    bottom: 60,
    backgroundColor: '#e8e8e8',
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vesselShell: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#555',
    backgroundColor: 'transparent',
  },
  vesselLabel: {
    position: 'absolute',
    top: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  vesselSpecs: {
    position: 'absolute',
    top: 22,
    fontSize: 10,
    color: '#666',
  },
  leftHead: {
    position: 'absolute',
    left: -15,
    top: '30%',
    bottom: '30%',
    width: 15,
    backgroundColor: '#d0d0d0',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  rightHead: {
    position: 'absolute',
    right: -15,
    top: '30%',
    bottom: '30%',
    width: 15,
    backgroundColor: '#d0d0d0',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  gasSection: {
    position: 'absolute',
    top: 25,
    left: 25,
    right: 25,
    height: 70,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  oilSection: {
    position: 'absolute',
    top: 105,
    left: 25,
    right: 25,
    height: 90,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  waterSection: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    height: 70,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  gasFlow: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
  flowArrows: {
    fontSize: 10,
    color: '#ff0000',
    fontWeight: 'bold',
  },
  oilInterface: {
    position: 'absolute',
    top: -1,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
  },
  waterInterface: {
    position: 'absolute',
    top: -1,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
  },
  interfaceLabel: {
    fontSize: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  internalComponents: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  demisterArea: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 40,
    height: 30,
  },
  demisterPattern: {
    fontSize: 8,
    color: '#9C27B0',
    letterSpacing: 1,
  },
  weirPlate: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    width: 30,
    height: 2,
  },
  weirLine: {
    width: '100%',
    height: '100%',
    backgroundColor: '#666',
  },
  diverterPlate: {
    position: 'absolute',
    top: 80,
    left: 40,
    width: 20,
    height: 30,
    backgroundColor: '#888',
    transform: [{ rotate: '15deg' }],
  },
  inletNozzle: {
    position: 'absolute',
    left: -20,
    top: '45%',
    width: 20,
    height: 15,
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  gasOutletNozzle: {
    position: 'absolute',
    right: -15,
    top: '20%',
    width: 15,
    height: 12,
    backgroundColor: '#F44336',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  oilOutletNozzle: {
    position: 'absolute',
    right: -15,
    top: '45%',
    width: 15,
    height: 12,
    backgroundColor: '#FF9800',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  waterOutletNozzle: {
    position: 'absolute',
    right: -15,
    bottom: '25%',
    width: 15,
    height: 12,
    backgroundColor: '#2196F3',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  drainNozzle: {
    position: 'absolute',
    bottom: -10,
    left: '45%',
    width: 12,
    height: 10,
    backgroundColor: '#607D8B',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  vesselSupports: {
    position: 'absolute',
    bottom: 10,
    left: 60,
    right: 60,
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportLeg: {
    width: 8,
    height: 20,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  pipingConnections: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  inletPiping: {
    position: 'absolute',
    left: -40,
    top: '43%',
    width: 20,
    height: 4,
    backgroundColor: '#4CAF50',
  },
  gasOutletPiping: {
    position: 'absolute',
    right: -30,
    top: '18%',
    width: 15,
    height: 4,
    backgroundColor: '#F44336',
  },
  oilOutletPiping: {
    position: 'absolute',
    right: -30,
    top: '43%',
    width: 15,
    height: 4,
    backgroundColor: '#FF9800',
  },
  waterOutletPiping: {
    position: 'absolute',
    right: -30,
    bottom: '23%',
    width: 15,
    height: 4,
    backgroundColor: '#2196F3',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  separatorPart: {
    position: 'absolute',
    width: 60,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  partSelected: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  partIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  partName: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  legend: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectionCount: {
    fontSize: 14,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partDetailsModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    width: '85%',
    maxWidth: 400,
  },
  partDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  partDetailsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  partDetailsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  partDetailsClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partDetailsCloseText: {
    fontSize: 16,
    color: '#666',
  },
  partDetailsContent: {
    padding: 16,
    maxHeight: 300,
  },
  partDetailsDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  partDetailsFunction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  specificationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  specificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  selectPartButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectPartButtonSelected: {
    backgroundColor: '#F44336',
  },
  selectPartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Report Modal Styles
  reportModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  reportHeader: {
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
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  reportCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportCloseText: {
    fontSize: 18,
    color: '#666',
  },
  reportContent: {
    flex: 1,
    padding: 20,
  },
  reportInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  reportInfoSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  reportSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportSectionHeader: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  reportSectionCount: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  componentAnalysis: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  componentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  componentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  componentFunction: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 12,
  },
  specificationsSection: {
    marginBottom: 16,
  },
  problemAnalysisSection: {
    backgroundColor: '#fff9c4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  specText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 8,
  },
  problemText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 4,
    marginLeft: 8,
    lineHeight: 18,
  },
  recommendationText: {
    fontSize: 14,
    color: '#388e3c',
    marginBottom: 4,
    marginLeft: 8,
    lineHeight: 18,
  },
  inspectionText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
    marginLeft: 8,
    lineHeight: 18,
  },
  maintenanceText: {
    fontSize: 14,
    color: '#7b1fa2',
    marginLeft: 8,
    fontWeight: '600',
    lineHeight: 18,
  },
  reportSummary: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  reportSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  reportSummaryText: {
    fontSize: 14,
    color: '#388e3c',
    lineHeight: 20,
    marginBottom: 8,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reportActionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  reportActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OilSeparatorDiagram;