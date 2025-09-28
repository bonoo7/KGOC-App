import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { updateUserProfile } from '../services/authService';
import { 
  getUserProfile, 
  updateUserProfile as updateFirestoreProfile, 
  createUserProfile,
  addActivityLog 
} from '../services/firestoreService';

const ProfileScreen = ({ user }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.uid) {
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    setError(null);
    
    try {
      const result = await getUserProfile(user.uid);
      
      if (result.success && result.data) {
        const data = result.data;
        setProfileData(data);
        setBio(data.bio || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        
        console.log('✅ Profile loaded from Firestore successfully');
      } else if (result.success && !result.data) {
        // No profile data exists yet - this is normal for new users
        console.log('ℹ️ No profile data found - user can create one');
      } else {
        setError('Failed to load profile data');
        console.error('❌ Error loading profile:', result.message);
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setError('Network error loading profile');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Update Firebase Auth profile first
      const authResult = await updateUserProfile(displayName);
      
      // Prepare profile data
      const profileDataToSave = {
        displayName,
        bio,
        phone,
        location,
        email: user.email,
        photoURL: user.photoURL
      };

      // Update or create profile in Firestore
      const firestoreResult = profileData 
        ? await updateFirestoreProfile(user.uid, profileDataToSave)
        : await createUserProfile(user.uid, profileDataToSave);

      if (authResult.success && firestoreResult.success) {
        // Log activity
        await addActivityLog(user.uid, {
          action: 'profile_updated',
          description: 'User updated their profile information',
          details: { fieldsUpdated: ['displayName', 'bio', 'phone', 'location'] }
        });

        Alert.alert('Success', '✅ Profile updated successfully with Firebase!');
        await loadUserProfile(); // Reload profile data
        console.log('✅ Profile saved to Firestore successfully');
      } else {
        const errorMsg = authResult.message || firestoreResult.message || 'Unknown error occurred';
        Alert.alert('Warning', `Profile update issue: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen for initial load
  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile from Firebase...</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account information</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={loadUserProfile}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>
          🔥 Connected to Firebase Firestore - Real-time sync enabled
        </Text>
      </View>

      <View style={styles.avatarSection}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <Text style={styles.email}>{user?.email}</Text>
        {profileData && profileData.updatedAt && (
          <Text style={styles.lastUpdated}>
            Last updated: {profileData.updatedAt?.seconds ? 
              new Date(profileData.updatedAt.seconds * 1000).toLocaleString() : 
              new Date(profileData.updatedAt).toLocaleString()
            }
          </Text>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Display Name *</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your display name"
          editable={!isLoading}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={3}
          editable={!isLoading}
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          editable={!isLoading}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter your location"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSaveProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save to Firebase</Text>
          )}
        </TouchableOpacity>
      </View>

      {profileData && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Account Information</Text>
          <Text style={styles.infoText}>
            Member since: {profileData.createdAt?.seconds ? 
              new Date(profileData.createdAt.seconds * 1000).toLocaleDateString() : 
              'Unknown'
            }
          </Text>
          <Text style={styles.infoText}>
            Profile ID: {user?.uid?.slice(0, 8)}...
          </Text>
          <Text style={styles.infoText}>
            Storage: Firebase Firestore ✅
          </Text>
        </View>
      )}

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>🔥 Firebase Features</Text>
        <Text style={styles.helpText}>• Data synced across all your devices</Text>
        <Text style={styles.helpText}>• Real-time updates and backup</Text>
        <Text style={styles.helpText}>• Secure cloud storage</Text>
        <Text style={styles.helpText}>• Profile photo from Google account</Text>
        <Text style={styles.helpText}>• Activity logging and analytics</Text>
      </View>

      <View style={styles.featureSection}>
        <Text style={styles.featureTitle}>✨ Firebase Active</Text>
        <Text style={styles.featureText}>✅ Firestore database connected</Text>
        <Text style={styles.featureText}>✅ Real-time synchronization</Text>
        <Text style={styles.featureText}>✅ Cloud backup enabled</Text>
        <Text style={styles.featureText}>✅ Cross-device sync</Text>
        <Text style={styles.featureText}>✅ Activity tracking</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFECB5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#856404',
    fontSize: 14,
    flex: 1,
  },
  retryText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusBanner: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  form: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
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
    marginBottom: 5,
  },
  helpSection: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 3,
  },
  featureSection: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    marginBottom: 40,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 3,
  },
});

export default ProfileScreen;