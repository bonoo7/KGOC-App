import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { getUserProfile } from '../services/firestoreService';
import { 
  getUserRole, 
  initializeUserRole, 
  getAccessibleModules,
  PERMISSIONS,
  ROLE_INFO 
} from '../services/rolesService';
import { ProtectedComponent, RoleBadge, ModuleAccessCard } from '../components/RoleBasedAccess';

const DashboardScreen = ({ user, navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [accessibleModules, setAccessibleModules] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user?.uid) {
      try {
        // Load user profile
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success && profileResult.data) {
          setProfileData(profileResult.data);
        }

        // Load or initialize user role
        let roleResult = await getUserRole(user.uid);
        
        if (!roleResult.success || !roleResult.role) {
          // Initialize role for new user
          roleResult = await initializeUserRole(user.uid, user.email);
        }
        
        if (roleResult.success && roleResult.role) {
          setUserRole(roleResult.role);
          
          // Get accessible modules based on role
          const modules = getAccessibleModules(roleResult.role);
          setAccessibleModules(modules);
          
          console.log(`✅ User role loaded: ${ROLE_INFO[roleResult.role]?.name}`);
          console.log('📊 Accessible modules:', modules);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProfilePress = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('Profile');
    }
  };

  const handleWellTest = () => {
    if (!accessibleModules.wellTest) {
      Alert.alert(
        'Access Denied',
        `Your role (${ROLE_INFO[userRole]?.name || 'Unknown'}) does not have access to Well Test services.\n\nContact your administrator to request access.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navigate to Well Test screen
    if (navigation && navigation.navigate) {
      navigation.navigate('WellTest');
    } else {
      Alert.alert(
        'Well Test Services',
        'Well Test services include:\n\n• New Well Test Creation ✅\n• Test Results Analysis ✅\n• Production Data Entry ✅\n• Chemical Analysis Recording ✅\n• Wellhead Parameters Monitoring ✅\n• Data Export & Reports ✅\n\nYour role allows full access to these features.',
        [{ text: 'Continue', style: 'default' }]
      );
    }
  };

  const handleWellServices = () => {
    if (!accessibleModules.wellServices) {
      Alert.alert(
        'Access Denied', 
        `Your role (${ROLE_INFO[userRole]?.name || 'Unknown'}) does not have access to Well Services.\n\nContact your administrator to request access.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navigate to Well Services screen
    if (navigation && navigation.navigate) {
      navigation.navigate('WellServices');
    } else {
      Alert.alert(
        'Well Services',
        'Well Services include:\n\n• Maintenance & Repairs ✅\n• Equipment Installation ✅\n• Emergency Response ✅\n• Technical Support ✅\n• Inspection Services ✅\n\nYour role allows access to these services.',
        [{ text: 'Continue', style: 'default' }]
      );
    }
  };

  const handleAdministrations = () => {
    if (!accessibleModules.administration) {
      Alert.alert(
        'Access Denied',
        `Your role (${ROLE_INFO[userRole]?.name || 'Unknown'}) does not have access to Administrative services.\n\nContact your administrator to request access.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navigate to Administration screen
    if (navigation && navigation.navigate) {
      navigation.navigate('Administration');
    } else {
      Alert.alert(
        'Administration',
        'Administrative Services include:\n\n• User Management ✅\n• System Settings ✅\n• Reports & Analytics ✅\n• Audit Logs ✅\n• Security Management ✅\n\nYour role allows access to these administrative features.',
        [{ text: 'Continue', style: 'default' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Profile Button and Role Badge */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome to KGOC</Text>
            <Text style={styles.userNameText}>
              {profileData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User'}
            </Text>
            {userRole && (
              <View style={styles.roleBadgeContainer}>
                <RoleBadge role={userRole} showIcon={true} showName={true} />
              </View>
            )}
          </View>
          
          {/* Small Profile Button */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {(profileData?.displayName || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Dashboard Content */}
      <View style={styles.dashboardContent}>
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        <Text style={styles.dashboardSubtitle}>
          Select a service to continue • Role: {ROLE_INFO[userRole]?.name || 'Unknown'}
        </Text>

        {/* Service Cards with Role-based Access */}
        <View style={styles.servicesContainer}>
          
          {/* Well Test Card */}
          <TouchableOpacity 
            style={[
              styles.serviceCard, 
              styles.wellTestCard,
              !accessibleModules.wellTest && styles.serviceCardDisabled
            ]}
            onPress={handleWellTest}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🔬</Text>
            </View>
            <Text style={[
              styles.cardTitle,
              !accessibleModules.wellTest && styles.cardTitleDisabled
            ]}>
              Well Test
            </Text>
            <Text style={[
              styles.cardDescription,
              !accessibleModules.wellTest && styles.cardDescriptionDisabled
            ]}>
              Comprehensive well testing and analysis services
            </Text>
            <View style={styles.cardArrow}>
              <Text style={[
                styles.arrowText,
                { color: accessibleModules.wellTest ? '#4CAF50' : '#ccc' }
              ]}>
                {accessibleModules.wellTest ? '✅' : '🔒'}
              </Text>
            </View>
            {!accessibleModules.wellTest && (
              <View style={styles.accessRestriction}>
                <Text style={styles.restrictionText}>Access Restricted</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Well Services Card */}
          <TouchableOpacity 
            style={[
              styles.serviceCard, 
              styles.wellServicesCard,
              !accessibleModules.wellServices && styles.serviceCardDisabled
            ]}
            onPress={handleWellServices}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🛠️</Text>
            </View>
            <Text style={[
              styles.cardTitle,
              !accessibleModules.wellServices && styles.cardTitleDisabled
            ]}>
              Well Services
            </Text>
            <Text style={[
              styles.cardDescription,
              !accessibleModules.wellServices && styles.cardDescriptionDisabled
            ]}>
              Complete well maintenance and operational services
            </Text>
            <View style={styles.cardArrow}>
              <Text style={[
                styles.arrowText,
                { color: accessibleModules.wellServices ? '#2196F3' : '#ccc' }
              ]}>
                {accessibleModules.wellServices ? '✅' : '🔒'}
              </Text>
            </View>
            {!accessibleModules.wellServices && (
              <View style={styles.accessRestriction}>
                <Text style={styles.restrictionText}>Access Restricted</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Administrations Card */}
          <TouchableOpacity 
            style={[
              styles.serviceCard, 
              styles.administrationsCard,
              !accessibleModules.administration && styles.serviceCardDisabled
            ]}
            onPress={handleAdministrations}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📋</Text>
            </View>
            <Text style={[
              styles.cardTitle,
              !accessibleModules.administration && styles.cardTitleDisabled
            ]}>
              Administrations
            </Text>
            <Text style={[
              styles.cardDescription,
              !accessibleModules.administration && styles.cardDescriptionDisabled
            ]}>
              Administrative services and documentation management
            </Text>
            <View style={styles.cardArrow}>
              <Text style={[
                styles.arrowText,
                { color: accessibleModules.administration ? '#FF9800' : '#ccc' }
              ]}>
                {accessibleModules.administration ? '✅' : '🔒'}
              </Text>
            </View>
            {!accessibleModules.administration && (
              <View style={styles.accessRestriction}>
                <Text style={styles.restrictionText}>Access Restricted</Text>
              </View>
            )}
          </TouchableOpacity>

        </View>

        {/* Quick Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Quick Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Active Tests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Object.values(accessibleModules).filter(Boolean).length}
              </Text>
              <Text style={styles.statLabel}>Accessible Modules</Text>
            </View>
          </View>
        </View>

        {/* Role Information Section */}
        {userRole && (
          <ProtectedComponent userRole={userRole}>
            <View style={styles.roleSection}>
              <Text style={styles.roleSectionTitle}>Your Role & Permissions</Text>
              <View style={styles.roleInfoCard}>
                <View style={styles.roleHeader}>
                  <RoleBadge role={userRole} showIcon={true} showName={true} />
                  <Text style={styles.roleDescription}>
                    {ROLE_INFO[userRole]?.description || 'Role description not available'}
                  </Text>
                </View>
                
                <View style={styles.permissionsGrid}>
                  <View style={styles.permissionItem}>
                    <Text style={styles.permissionIcon}>
                      {accessibleModules.wellTest ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.permissionLabel}>Well Test</Text>
                  </View>
                  <View style={styles.permissionItem}>
                    <Text style={styles.permissionIcon}>
                      {accessibleModules.wellServices ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.permissionLabel}>Well Services</Text>
                  </View>
                  <View style={styles.permissionItem}>
                    <Text style={styles.permissionIcon}>
                      {accessibleModules.administration ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.permissionLabel}>Administration</Text>
                  </View>
                  <View style={styles.permissionItem}>
                    <Text style={styles.permissionIcon}>
                      {accessibleModules.userManagement ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.permissionLabel}>User Management</Text>
                  </View>
                </View>
              </View>
            </View>
          </ProtectedComponent>
        )}

        {/* Recent Activity Section */}
        <View style={styles.activitySection}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>👑</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  Role assigned: {ROLE_INFO[userRole]?.name || 'Unknown'}
                </Text>
                <Text style={styles.activityTime}>Just now</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>🔥</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Firebase connected successfully</Text>
                <Text style={styles.activityTime}>Today</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>🚀</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>KGOC Dashboard launched</Text>
                <Text style={styles.activityTime}>Today</Text>
              </View>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  roleBadgeContainer: {
    marginTop: 8,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dashboardContent: {
    padding: 20,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  servicesContainer: {
    marginBottom: 30,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  serviceCardDisabled: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  wellTestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  wellServicesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  administrationsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardTitleDisabled: {
    color: '#999',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  cardDescriptionDisabled: {
    color: '#ccc',
  },
  cardArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  accessRestriction: {
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  restrictionText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  roleSection: {
    marginBottom: 30,
  },
  roleSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  roleInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleHeader: {
    marginBottom: 15,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  permissionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  permissionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activitySection: {
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default DashboardScreen;