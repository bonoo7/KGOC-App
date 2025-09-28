import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { WELL_PARTS } from '../services/maintenanceService';

const { width } = Dimensions.get('window');

const WellBlueprint = ({ onPartSelect, selectedPart }) => {
  const [hoveredPart, setHoveredPart] = useState(null);

  const handlePartPress = (partId) => {
    const part = WELL_PARTS[partId];
    if (onPartSelect) {
      onPartSelect(part);
    }
  };

  const isPartSelected = (partId) => {
    return selectedPart?.id === partId;
  };

  const renderPart = (partKey) => {
    const part = WELL_PARTS[partKey];
    const isSelected = isPartSelected(part.id);
    const isHovered = hoveredPart === part.id;

    return (
      <TouchableOpacity
        key={part.id}
        style={[
          styles.part,
          {
            left: `${part.position.x}%`,
            top: `${part.position.y}%`,
          },
          isSelected && styles.partSelected,
          isHovered && styles.partHovered
        ]}
        onPress={() => handlePartPress(partKey)}
        onPressIn={() => setHoveredPart(part.id)}
        onPressOut={() => setHoveredPart(null)}
      >
        <View style={[
          styles.partCircle,
          isSelected && styles.partCircleSelected,
          isHovered && styles.partCircleHovered
        ]}>
          <Text style={[
            styles.partText,
            isSelected && styles.partTextSelected
          ]}>
            {part.name.charAt(0)}
          </Text>
        </View>
        <Text style={[
          styles.partLabel,
          isSelected && styles.partLabelSelected
        ]}>
          {part.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Well Schematic - Select Component for Maintenance</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.blueprint}>
          {/* Well Structure Background */}
          <View style={styles.wellStructure}>
            {/* Surface */}
            <View style={styles.surface} />
            
            {/* Wellbore */}
            <View style={styles.wellbore} />
            
            {/* Casing */}
            <View style={styles.casing} />
            
            {/* Tubing */}
            <View style={styles.tubingLine} />
            
            {/* Ground Line */}
            <View style={styles.groundLine} />
          </View>

          {/* Interactive Parts */}
          {Object.keys(WELL_PARTS).map(partKey => renderPart(partKey))}

          {/* Labels for sections */}
          <View style={styles.sectionLabels}>
            <Text style={[styles.sectionLabel, { top: '5%', left: '5%' }]}>
              Surface Equipment
            </Text>
            <Text style={[styles.sectionLabel, { top: '45%', left: '5%' }]}>
              Downhole Equipment
            </Text>
            <Text style={[styles.sectionLabel, { top: '25%', left: '75%' }]}>
              Flow Control
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Component Categories:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>Surface Equipment</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Downhole Equipment</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Artificial Lift</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
            <Text style={styles.legendText}>Instrumentation</Text>
          </View>
        </View>
      </View>

      {/* Selected Part Info */}
      {selectedPart && (
        <View style={styles.selectedPartInfo}>
          <Text style={styles.selectedPartTitle}>Selected: {selectedPart.name}</Text>
          <Text style={styles.selectedPartCategory}>Category: {selectedPart.category}</Text>
          <Text style={styles.selectedPartDescription}>{selectedPart.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  blueprint: {
    width: Math.max(width * 1.2, 500),
    height: 400,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wellStructure: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  surface: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#8D6E63',
  },
  wellbore: {
    position: 'absolute',
    left: '47%',
    top: '15%',
    width: 6,
    height: '70%',
    backgroundColor: '#BDBDBD',
    borderRadius: 3,
  },
  casing: {
    position: 'absolute',
    left: '46%',
    top: '15%',
    width: 8,
    height: '70%',
    backgroundColor: '#757575',
    borderRadius: 4,
    opacity: 0.3,
  },
  tubingLine: {
    position: 'absolute',
    left: '48%',
    top: '20%',
    width: 4,
    height: '60%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    opacity: 0.7,
  },
  groundLine: {
    position: 'absolute',
    top: '15%',
    left: '5%',
    right: '5%',
    height: 2,
    backgroundColor: '#795548',
    opacity: 0.5,
  },
  part: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  partCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  partCircleSelected: {
    backgroundColor: '#FF5722',
    borderColor: '#D84315',
    transform: [{ scale: 1.2 }],
  },
  partCircleHovered: {
    backgroundColor: '#03A9F4',
    transform: [{ scale: 1.1 }],
  },
  partText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  partTextSelected: {
    color: '#fff',
  },
  partLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
    minWidth: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partLabelSelected: {
    backgroundColor: '#FF5722',
    color: '#fff',
  },
  partSelected: {
    zIndex: 20,
  },
  partHovered: {
    zIndex: 15,
  },
  sectionLabels: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sectionLabel: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legend: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    color: '#666',
  },
  selectedPartInfo: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  selectedPartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  selectedPartCategory: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  selectedPartDescription: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});

export default WellBlueprint;