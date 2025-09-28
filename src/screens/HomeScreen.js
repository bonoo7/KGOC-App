import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { logout } from '../services/authService';

const HomeScreen = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        Alert.alert('Success', result.message);
        onLogout();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to KGOC!</Text>
        <Text style={styles.subtitle}>You are successfully logged in</Text>
      </View>

      <View style={styles.userInfo}>
        {user?.photoURL && (
          <Image 
            source={{ uri: user.photoURL }} 
            style={styles.avatar}
          />
        )}
        <Text style={styles.userName}>
          {user?.displayName || user?.email || 'User'}
        </Text>
        <Text style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>
          🎉 Your React Native Expo app with Firebase authentication is working!
        </Text>
        
        <Text style={styles.featuresTitle}>Features enabled:</Text>
        <Text style={styles.feature}>✅ Firebase Authentication</Text>
        <Text style={styles.feature}>✅ Google Sign-in</Text>
        <Text style={styles.feature}>✅ Email/Password Sign-in</Text>
        <Text style={styles.feature}>✅ Web Support</Text>
        <Text style={styles.feature}>⏳ Mobile Support (Coming Soon)</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  feature: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;