import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { 
  USER_ROLES, 
  ROLE_INFO, 
  setUserRole, 
  getUserRole,
  PERMISSIONS
} from '../services/rolesService';
import { ProtectedComponent, RoleBadge } from '../components/RoleBasedAccess';

const RoleManagementScreen = ({ user, navigation }) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    loadCurrentUserRole();
  }, [user]);

  const loadCurrentUserRole = async () => {
    if (user?.uid) {
      const roleResult = await getUserRole(user.uid);
      if (roleResult.success) {
        setCurrentUserRole(roleResult.role);
      }
    }
  };

  const handleAssignRole = (targetRole) => {
    Alert.alert(
      'Assign Role',
      `Do you want to assign the role "${ROLE_INFO[targetRole].name}" to yourself?\n\nNote: This is for demonstration purposes. In a real system, only administrators can assign roles to other users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          style: 'default',
          onPress: () => assignRoleToCurrentUser(targetRole)
        }
      ]
    );
  };

  const assignRoleToCurrentUser = async (role) => {
    if (!user?.uid) return;

    const result = await setUserRole(user.uid, role);
    
    if (result.success) {
      setCurrentUserRole(role);
      Alert.alert('Success', `Role changed to ${ROLE_INFO[role].name} successfully!`);
      
      // Refresh the parent screen
      if (navigation?.navigate) {
        navigation.navigate('Dashboard');
      }
    } else {
      Alert.alert('Error', result.message || 'Failed to assign role');
    }
  };

  const renderRoleCard = ({ item: role }) => {
    const roleInfo = ROLE_INFO[role];
    const isCurrentRole = userRole === role;

    return (
      <TouchableOpacity 
        style={[
          styles.roleCard,
          isCurrentRole && styles.currentRoleCard
        ]}
        onPress={() => handleAssignRole(role)}
        disabled={isCurrentRole}
      >
        <View style={styles.roleCardHeader}>
          <View style={[styles.roleIcon, { backgroundColor: roleInfo.color }]}>
            <Text style={styles.roleIconText}>{roleInfo.icon}</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>{roleInfo.name}</Text>
            <Text style={styles.roleDescription}>{roleInfo.description}</Text>
          </View>
          {isCurrentRole && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>
        
        <View style={styles.rolePermissions}>
          <Text style={styles.permissionsTitle}>Key Permissions:</Text>
          {role === USER_ROLES.WELLTESTER && (
            <View>
              <Text style={styles.permissionText}>• Create and manage well tests</Text>
              <Text style={styles.permissionText}>• View test results and reports</Text>
            </View>
          )}
          {role === USER_ROLES.OPERATOR && (
            <View>
              <Text style={styles.permissionText}>• Operate wells and services</Text>
              <Text style={styles.permissionText}>• View operational data</Text>
            </View>
          )}
          {role === USER_ROLES.SUPERVISOR && (
            <View>
              <Text style={styles.permissionText}>• Supervise operations</Text>
              <Text style={styles.permissionText}>• Approve tests and services</Text>
              <Text style={styles.permissionText}>• Access administrative views</Text>
            </View>
          )}
          {role === USER_ROLES.COORDINATOR && (
            <View>
              <Text style={styles.permissionText}>• Coordinate activities</Text>
              <Text style={styles.permissionText}>• Manage documentation</Text>
              <Text style={styles.permissionText}>• Generate reports</Text>
            </View>
          )}
          {role === USER_ROLES.ADMINISTRATOR && (
            <View>
              <Text style={styles.permissionText}>• Manage system and users</Text>
              <Text style={styles.permissionText}>• Full operational access</Text>
              <Text style={styles.permissionText}>• System configuration</Text>
            </View>
          )}
          {role === USER_ROLES.ADMIN && (
            <View>
              <Text style={styles.permissionText}>• Full system access</Text>
              <Text style={styles.permissionText}>• All permissions granted</Text>
              <Text style={styles.permissionText}>• System administration</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ProtectedComponent 
      userRole={userRole} 
      requiredPermission={PERMISSIONS.USER_MANAGEMENT}
      fallback={
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Role Management</Text>
            <Text style={styles.headerSubtitle}>
              Change your role for testing purposes
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.currentRoleSection}>
              <Text style={styles.sectionTitle}>Current Role</Text>
              {userRole && (
                <View style={styles.currentRoleDisplay}>
                  <RoleBadge role={userRole} showIcon={true} showName={true} />
                  <Text style={styles.currentRoleDescription}>
                    {ROLE_INFO[userRole]?.description}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.rolesSection}>
              <Text style={styles.sectionTitle}>Available Roles</Text>
              <Text style={styles.sectionDescription}>
                Select a role to experience different permission levels
              </Text>
              
              <FlatList
                data={Object.values(USER_ROLES)}
                renderItem={renderRoleCard}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Role Testing</Text>
              <Text style={styles.infoText}>
                This screen allows you to change your role for testing different 
                permission levels. In a production system, only administrators 
                would have access to user role management.
              </Text>
            </View>
          </View>
        </ScrollView>
      }
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Role Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage user roles and permissions
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.adminSection}>
            <Text style={styles.adminTitle}>👑 Administrator Access</Text>
            <Text style={styles.adminDescription}>
              You have full access to role management. In a real system, 
              you would see all users and be able to assign roles to them.
            </Text>
          </View>

          <View style={styles.currentRoleSection}>
            <Text style={styles.sectionTitle}>Your Current Role</Text>
            {userRole && (
              <View style={styles.currentRoleDisplay}>
                <RoleBadge role={userRole} showIcon={true} showName={true} />
                <Text style={styles.currentRoleDescription}>
                  {ROLE_INFO[userRole]?.description}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.rolesSection}>
            <Text style={styles.sectionTitle}>All System Roles</Text>
            <Text style={styles.sectionDescription}>
              Manage and assign roles to users
            </Text>
            
            <FlatList
              data={Object.values(USER_ROLES)}
              renderItem={renderRoleCard}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ScrollView>
    </ProtectedComponent>
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
  content: {
    padding: 20,
  },
  adminSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  adminDescription: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  currentRoleSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  currentRoleDisplay: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentRoleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
  },
  rolesSection: {
    marginBottom: 30,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentRoleCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  roleIconText: {
    fontSize: 20,
    color: '#fff',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  currentBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rolePermissions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  permissionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  permissionText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    paddingLeft: 5,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});

export default RoleManagementScreen;