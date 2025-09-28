// User roles and permissions service
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Define user roles and their permissions
export const USER_ROLES = {
  WELLTESTER: 'welltester',
  OPERATOR: 'operator', 
  SUPERVISOR: 'supervisor',
  COORDINATOR: 'coordinator',
  ADMINISTRATOR: 'administrator',
  ADMIN: 'admin'
};

// Define permissions for each module
export const PERMISSIONS = {
  // Well Test permissions
  WELL_TEST_VIEW: 'well_test_view',
  WELL_TEST_CREATE: 'well_test_create',
  WELL_TEST_EDIT: 'well_test_edit',
  WELL_TEST_DELETE: 'well_test_delete',
  WELL_TEST_APPROVE: 'well_test_approve',
  
  // Well Services permissions
  WELL_SERVICES_VIEW: 'well_services_view',
  WELL_SERVICES_CREATE: 'well_services_create',
  WELL_SERVICES_EDIT: 'well_services_edit',
  WELL_SERVICES_DELETE: 'well_services_delete',
  WELL_SERVICES_SCHEDULE: 'well_services_schedule',
  
  // Administration permissions
  ADMIN_VIEW: 'admin_view',
  ADMIN_CREATE: 'admin_create',
  ADMIN_EDIT: 'admin_edit',
  ADMIN_DELETE: 'admin_delete',
  ADMIN_REPORTS: 'admin_reports',
  
  // System permissions
  USER_MANAGEMENT: 'user_management',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.WELLTESTER]: [
    PERMISSIONS.WELL_TEST_VIEW,
    PERMISSIONS.WELL_TEST_CREATE,
    PERMISSIONS.WELL_TEST_EDIT
  ],
  
  [USER_ROLES.OPERATOR]: [
    PERMISSIONS.WELL_TEST_VIEW,
    PERMISSIONS.WELL_SERVICES_VIEW,
    PERMISSIONS.WELL_SERVICES_CREATE,
    PERMISSIONS.WELL_SERVICES_EDIT
  ],
  
  [USER_ROLES.SUPERVISOR]: [
    PERMISSIONS.WELL_TEST_VIEW,
    PERMISSIONS.WELL_TEST_CREATE,
    PERMISSIONS.WELL_TEST_EDIT,
    PERMISSIONS.WELL_TEST_APPROVE,
    PERMISSIONS.WELL_SERVICES_VIEW,
    PERMISSIONS.WELL_SERVICES_CREATE,
    PERMISSIONS.WELL_SERVICES_EDIT,
    PERMISSIONS.WELL_SERVICES_SCHEDULE,
    PERMISSIONS.ADMIN_VIEW
  ],
  
  [USER_ROLES.COORDINATOR]: [
    PERMISSIONS.WELL_TEST_VIEW,
    PERMISSIONS.WELL_TEST_CREATE,
    PERMISSIONS.WELL_TEST_EDIT,
    PERMISSIONS.WELL_TEST_APPROVE,
    PERMISSIONS.WELL_SERVICES_VIEW,
    PERMISSIONS.WELL_SERVICES_CREATE,
    PERMISSIONS.WELL_SERVICES_EDIT,
    PERMISSIONS.WELL_SERVICES_DELETE,
    PERMISSIONS.WELL_SERVICES_SCHEDULE,
    PERMISSIONS.ADMIN_VIEW,
    PERMISSIONS.ADMIN_CREATE,
    PERMISSIONS.ADMIN_EDIT,
    PERMISSIONS.ADMIN_REPORTS
  ],
  
  [USER_ROLES.ADMINISTRATOR]: [
    PERMISSIONS.WELL_TEST_VIEW,
    PERMISSIONS.WELL_TEST_CREATE,
    PERMISSIONS.WELL_TEST_EDIT,
    PERMISSIONS.WELL_TEST_DELETE,
    PERMISSIONS.WELL_TEST_APPROVE,
    PERMISSIONS.WELL_SERVICES_VIEW,
    PERMISSIONS.WELL_SERVICES_CREATE,
    PERMISSIONS.WELL_SERVICES_EDIT,
    PERMISSIONS.WELL_SERVICES_DELETE,
    PERMISSIONS.WELL_SERVICES_SCHEDULE,
    PERMISSIONS.ADMIN_VIEW,
    PERMISSIONS.ADMIN_CREATE,
    PERMISSIONS.ADMIN_EDIT,
    PERMISSIONS.ADMIN_DELETE,
    PERMISSIONS.ADMIN_REPORTS,
    PERMISSIONS.USER_MANAGEMENT
  ],
  
  [USER_ROLES.ADMIN]: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS)
  ]
};

// Role display names and descriptions
export const ROLE_INFO = {
  [USER_ROLES.WELLTESTER]: {
    name: 'Well Tester',
    description: 'Can create and manage well tests',
    color: '#4CAF50',
    icon: '🔬'
  },
  [USER_ROLES.OPERATOR]: {
    name: 'Operator', 
    description: 'Can operate wells and services',
    color: '#2196F3',
    icon: '🛠️'
  },
  [USER_ROLES.SUPERVISOR]: {
    name: 'Supervisor',
    description: 'Can supervise operations and approve tests',
    color: '#FF9800',
    icon: '👨‍💼'
  },
  [USER_ROLES.COORDINATOR]: {
    name: 'Coordinator',
    description: 'Can coordinate activities and manage documentation',
    color: '#9C27B0',
    icon: '📋'
  },
  [USER_ROLES.ADMINISTRATOR]: {
    name: 'Administrator',
    description: 'Can manage system and users',
    color: '#F44336',
    icon: '👨‍💻'
  },
  [USER_ROLES.ADMIN]: {
    name: 'System Admin',
    description: 'Full system access and control',
    color: '#212121',
    icon: '👑'
  }
};

// Set user role in Firestore
export const setUserRole = async (userId, role) => {
  try {
    if (!Object.values(USER_ROLES).includes(role)) {
      throw new Error('Invalid role');
    }
    
    const userRoleRef = doc(db, 'userRoles', userId);
    await setDoc(userRoleRef, {
      userId,
      role,
      assignedAt: new Date(),
      assignedBy: 'system' // In real app, this would be current user
    }, { merge: true });
    
    return {
      success: true,
      message: `User role set to ${ROLE_INFO[role].name} successfully`
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Get user role from Firestore
export const getUserRole = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    const userRoleRef = doc(db, 'userRoles', userId);
    const roleSnap = await getDoc(userRoleRef);
    
    if (roleSnap.exists()) {
      const roleData = roleSnap.data();
      return {
        success: true,
        role: roleData.role,
        data: roleData
      };
    } else {
      // Default role for new users
      return {
        success: true,
        role: USER_ROLES.OPERATOR, // Default role
        data: {
          userId,
          role: USER_ROLES.OPERATOR,
          assignedAt: new Date(),
          assignedBy: 'system'
        }
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (userRole, permissions = []) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Check if user has all specified permissions
export const hasAllPermissions = (userRole, permissions = []) => {
  if (!userRole || !Array.isArray(permissions)) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Get accessible modules for a role
export const getAccessibleModules = (userRole) => {
  const permissions = getRolePermissions(userRole);
  const modules = {
    wellTest: false,
    wellServices: false,
    administration: false,
    userManagement: false
  };
  
  // Check Well Test access
  if (permissions.some(p => p.startsWith('well_test_'))) {
    modules.wellTest = true;
  }
  
  // Check Well Services access
  if (permissions.some(p => p.startsWith('well_services_'))) {
    modules.wellServices = true;
  }
  
  // Check Administration access
  if (permissions.some(p => p.startsWith('admin_'))) {
    modules.administration = true;
  }
  
  // Check User Management access
  if (permissions.includes(PERMISSIONS.USER_MANAGEMENT)) {
    modules.userManagement = true;
  }
  
  return modules;
};

// Initialize default role for new user
export const initializeUserRole = async (userId, email) => {
  try {
    // Check if user already has a role
    const existingRole = await getUserRole(userId);
    
    if (existingRole.success && existingRole.data.assignedBy !== 'system') {
      // User already has an assigned role
      return existingRole;
    }
    
    // Assign default role based on email domain or other logic
    let defaultRole = USER_ROLES.OPERATOR;
    
    // Example: Admin emails get admin role
    if (email && email.includes('admin')) {
      defaultRole = USER_ROLES.ADMIN;
    } else if (email && email.includes('supervisor')) {
      defaultRole = USER_ROLES.SUPERVISOR;
    }
    
    const result = await setUserRole(userId, defaultRole);
    
    if (result.success) {
      return {
        success: true,
        role: defaultRole,
        message: `Initialized with ${ROLE_INFO[defaultRole].name} role`
      };
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};