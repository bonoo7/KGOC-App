// Role-based access control component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { hasPermission, hasAnyPermission, ROLE_INFO } from '../services/rolesService';

// Component to show content based on user permissions
export const ProtectedComponent = ({ 
  userRole, 
  requiredPermission, 
  requiredPermissions, 
  requireAll = false,
  children, 
  fallback = null 
}) => {
  let hasAccess = false;
  
  if (requiredPermission) {
    hasAccess = hasPermission(userRole, requiredPermission);
  } else if (requiredPermissions && Array.isArray(requiredPermissions)) {
    if (requireAll) {
      hasAccess = requiredPermissions.every(permission => hasPermission(userRole, permission));
    } else {
      hasAccess = hasAnyPermission(userRole, requiredPermissions);
    }
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }
  
  if (hasAccess) {
    return children;
  }
  
  return fallback || <AccessDenied />;
};

// Access denied component
export const AccessDenied = ({ message = "Access denied. Insufficient permissions." }) => (
  <View style={styles.accessDenied}>
    <Text style={styles.accessDeniedIcon}>🚫</Text>
    <Text style={styles.accessDeniedText}>{message}</Text>
  </View>
);

// Role badge component
export const RoleBadge = ({ role, showIcon = true, showName = true }) => {
  const roleInfo = ROLE_INFO[role];
  
  if (!roleInfo) {
    return (
      <View style={[styles.roleBadge, { backgroundColor: '#999' }]}>
        <Text style={styles.roleBadgeText}>Unknown Role</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.roleBadge, { backgroundColor: roleInfo.color }]}>
      {showIcon && <Text style={styles.roleIcon}>{roleInfo.icon}</Text>}
      {showName && <Text style={styles.roleBadgeText}>{roleInfo.name}</Text>}
    </View>
  );
};

// Permission indicator component
export const PermissionIndicator = ({ userRole, permission, showText = false }) => {
  const hasAccess = hasPermission(userRole, permission);
  
  return (
    <View style={styles.permissionIndicator}>
      <Text style={[styles.permissionIcon, { color: hasAccess ? '#4CAF50' : '#F44336' }]}>
        {hasAccess ? '✅' : '❌'}
      </Text>
      {showText && (
        <Text style={[styles.permissionText, { color: hasAccess ? '#4CAF50' : '#F44336' }]}>
          {hasAccess ? 'Allowed' : 'Denied'}
        </Text>
      )}
    </View>
  );
};

// Module access card
export const ModuleAccessCard = ({ 
  userRole, 
  modulePermissions, 
  moduleName, 
  moduleIcon, 
  onPress, 
  disabled = false 
}) => {
  const hasAccess = hasAnyPermission(userRole, modulePermissions);
  
  return (
    <View style={[
      styles.moduleCard, 
      !hasAccess && styles.moduleCardDisabled,
      disabled && styles.moduleCardDisabled
    ]}>
      <View style={styles.moduleHeader}>
        <Text style={styles.moduleIcon}>{moduleIcon}</Text>
        <Text style={[
          styles.moduleName, 
          !hasAccess && styles.moduleNameDisabled
        ]}>
          {moduleName}
        </Text>
        <PermissionIndicator userRole={userRole} permission={modulePermissions[0]} />
      </View>
      
      {!hasAccess && (
        <View style={styles.moduleRestriction}>
          <Text style={styles.restrictionText}>
            Access restricted to your role: {ROLE_INFO[userRole]?.name || 'Unknown'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fafafa',
  },
  accessDeniedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  permissionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  permissionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleCardDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  moduleName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  moduleNameDisabled: {
    color: '#999',
  },
  moduleRestriction: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  restrictionText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
});

export default ProtectedComponent;