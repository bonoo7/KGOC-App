import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

const WellServicesScreen = ({ navigation, user }) => {
  const handleBack = () => {
    if (navigation?.navigate) {
      navigation.navigate('Dashboard');
    }
  };

  const handleMaintenance = () => {
    Alert.alert('Maintenance', 'Well maintenance services...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleRepair = () => {
    Alert.alert('Repair Services', 'Well repair and restoration...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleInspection = () => {
    Alert.alert('Inspection', 'Well inspection services...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Well Services</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>🛠️ Well Services</Text>
          <Text style={styles.subtitle}>Complete well maintenance and operational services</Text>
        </View>

        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard} onPress={handleMaintenance}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>🔧</Text>
            </View>
            <Text style={styles.serviceTitle}>Maintenance</Text>
            <Text style={styles.serviceDescription}>Regular well maintenance services</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} onPress={handleRepair}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>🔨</Text>
            </View>
            <Text style={styles.serviceTitle}>Repair</Text>
            <Text style={styles.serviceDescription}>Well repair and restoration</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} onPress={handleInspection}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>🔍</Text>
            </View>
            <Text style={styles.serviceTitle}>Inspection</Text>
            <Text style={styles.serviceDescription}>Comprehensive well inspection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📊</Text>
            </View>
            <Text style={styles.serviceTitle}>Monitoring</Text>
            <Text style={styles.serviceDescription}>Continuous well monitoring</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>⚡</Text>
            </View>
            <Text style={styles.serviceTitle}>Emergency</Text>
            <Text style={styles.serviceDescription}>24/7 emergency response</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📋</Text>
            </View>
            <Text style={styles.serviceTitle}>Reports</Text>
            <Text style={styles.serviceDescription}>Service reports and logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Our Services</Text>
          <Text style={styles.infoText}>
            We provide comprehensive well services including maintenance, repair, 
            inspection, and emergency response. Our experienced team ensures your 
            wells operate at peak efficiency with minimal downtime.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
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
  content: {
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceIconText: {
    fontSize: 24,
    color: '#fff',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default WellServicesScreen;