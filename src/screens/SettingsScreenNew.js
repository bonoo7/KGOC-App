import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { getUserSettings, saveUserSettings } from '../services/firestoreService';
import { getUserRole, ROLE_INFO, PERMISSIONS } from '../services/rolesService';
import { ProtectedComponent, RoleBadge } from '../components/RoleBasedAccess';

const SettingsScreen = ({ user, onLogout, navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en'
  });
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user?.uid) {
      try {
        // Load user settings
        const settingsResult = await getUserSettings(user.uid);
        if (settingsResult.success && settingsResult.data) {
          setSettings(settingsResult.data);
        }

        // Load user role
        const roleResult = await getUserRole(user.uid);
        if (roleResult.success && roleResult.role) {
          setUserRole(roleResult.role);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (user?.uid) {
      const result = await saveUserSettings(user.uid, newSettings);
      if (!result.success) {
        Alert.alert('Error', 'Failed to save settings');
        // Revert the change
        setSettings(settings);
      }
    }
  };

  const handleRoleManagement = () => {
    if (navigation?.navigate) {
      navigation.navigate('RoleManagement');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your preferences and account</Text>
      </View>

      {/* User Role Section */}
      {userRole && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Role</Text>
          <View style={styles.roleContainer}>
            <RoleBadge role={userRole} showIcon={true} showName={true} />
            <Text style={styles.roleDescription}>
              {ROLE_INFO[userRole]?.description}
            </Text>
          </View>
        </View>
      )}

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications about important updates
            </Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => handleToggleSetting('notifications', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.notifications ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Switch to dark theme (Coming soon)
            </Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => handleToggleSetting('darkMode', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={settings.darkMode ? '#007AFF' : '#f4f3f4'}
            disabled={true}
          />
        </View>
      </View>

      {/* Role Management Section - Protected */}
      <ProtectedComponent 
        userRole={userRole}
        requiredPermission={PERMISSIONS.USER_MANAGEMENT}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Management</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleRoleManagement}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonIcon}>👑</Text>
              <View style={styles.actionButtonInfo}>
                <Text style={styles.actionButtonTitle}>Manage User Roles</Text>
                <Text style={styles.actionButtonDescription}>
                  Assign and manage user permissions
                </Text>
              </View>
              <Text style={styles.actionButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ProtectedComponent>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation?.navigate('Profile')}
        >
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonIcon}>👤</Text>
            <View style={styles.actionButtonInfo}>
              <Text style={styles.actionButtonTitle}>Edit Profile</Text>
              <Text style={styles.actionButtonDescription}>
                Update your personal information
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonIcon}>🔒</Text>
            <View style={styles.actionButtonInfo}>
              <Text style={styles.actionButtonTitle}>Privacy & Security</Text>
              <Text style={styles.actionButtonDescription}>
                Manage your privacy settings
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonIcon}>❓</Text>
            <View style={styles.actionButtonInfo}>
              <Text style={styles.actionButtonTitle}>Help & Support</Text>
              <Text style={styles.actionButtonDescription}>
                Get help and contact support
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfoSection}>
        <Text style={styles.appInfoTitle}>KGOC App</Text>
        <Text style={styles.appInfoText}>Version 1.0.0</Text>
        <Text style={styles.appInfoText}>
          Built with Role-Based Access Control
        </Text>
        <Text style={styles.appInfoText}>
          Role: {ROLE_INFO[userRole]?.name || 'Unknown'}
        </Text>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  roleContainer: {
    alignItems: 'flex-start',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  actionButtonInfo: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  actionButtonDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actionButtonArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appInfoSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
});

export default SettingsScreen;