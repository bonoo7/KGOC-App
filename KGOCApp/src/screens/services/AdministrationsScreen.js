import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

const AdministrationsScreen = ({ navigation, user }) => {
  const handleBack = () => {
    if (navigation?.navigate) {
      navigation.navigate('Dashboard');
    }
  };

  const handleDocuments = () => {
    Alert.alert('Documents', 'Document management system...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handlePermits = () => {
    Alert.alert('Permits', 'Permits and licensing...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleCompliance = () => {
    Alert.alert('Compliance', 'Regulatory compliance tracking...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Administrations</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>📋 Administrations</Text>
          <Text style={styles.subtitle}>Administrative services and documentation management</Text>
        </View>

        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard} onPress={handleDocuments}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📄</Text>
            </View>
            <Text style={styles.serviceTitle}>Documents</Text>
            <Text style={styles.serviceDescription}>Document management system</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} onPress={handlePermits}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📜</Text>
            </View>
            <Text style={styles.serviceTitle}>Permits</Text>
            <Text style={styles.serviceDescription}>Permits and licensing</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} onPress={handleCompliance}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>✅</Text>
            </View>
            <Text style={styles.serviceTitle}>Compliance</Text>
            <Text style={styles.serviceDescription}>Regulatory compliance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📊</Text>
            </View>
            <Text style={styles.serviceTitle}>Reports</Text>
            <Text style={styles.serviceDescription}>Administrative reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📅</Text>
            </View>
            <Text style={styles.serviceTitle}>Scheduling</Text>
            <Text style={styles.serviceDescription}>Task and resource scheduling</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>👥</Text>
            </View>
            <Text style={styles.serviceTitle}>Personnel</Text>
            <Text style={styles.serviceDescription}>Staff management</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Administrative Services</Text>
          <Text style={styles.infoText}>
            Our administrative services cover all aspects of documentation, 
            compliance, and regulatory requirements. We help streamline your 
            administrative processes and ensure full compliance with industry standards.
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
    backgroundColor: '#FF9800',
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
    backgroundColor: '#FF9800',
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

export default AdministrationsScreen;