import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';

const WellTestScreen = ({ navigation, user }) => {
  const handleBack = () => {
    if (navigation?.navigate) {
      navigation.navigate('Dashboard');
    }
  };

  const handleNewTest = () => {
    Alert.alert('New Test', 'Creating new well test...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleViewTests = () => {
    Alert.alert('View Tests', 'Loading existing tests...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleTestReports = () => {
    Alert.alert('Test Reports', 'Loading test reports...', [
      { text: 'OK', style: 'default' }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Well Test</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>🔬 Well Testing Services</Text>
          <Text style={styles.subtitle}>Comprehensive well analysis and testing solutions</Text>
        </View>

        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard} onPress={handleNewTest}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📝</Text>
            </View>
            <Text style={styles.serviceTitle}>New Test</Text>
            <Text style={styles.serviceDescription}>Start a new well test analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} onPress={handleViewTests}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📊</Text>
            </View>
            <Text style={styles.serviceTitle}>View Tests</Text>
            <Text style={styles.serviceDescription}>Review existing test results</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} onPress={handleTestReports}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>📋</Text>
            </View>
            <Text style={styles.serviceTitle}>Test Reports</Text>
            <Text style={styles.serviceDescription}>Generate detailed test reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Text style={styles.serviceIconText}>⚙️</Text>
            </View>
            <Text style={styles.serviceTitle}>Test Settings</Text>
            <Text style={styles.serviceDescription}>Configure test parameters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Well Testing</Text>
          <Text style={styles.infoText}>
            Our well testing services provide comprehensive analysis of well performance, 
            production capabilities, and reservoir characteristics. Get accurate data 
            and insights to optimize your well operations.
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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

export default WellTestScreen;