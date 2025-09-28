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

// ADMIN USERS - Specific UIDs that get automatic admin access
export const ADMIN_USERS = [
  // First user will be automatically made admin
  // You can add specific UIDs here if needed later
];

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

// Set user role in Firestore (Firebase-based)
export const setUserRole = async (userId, role) => {
  try {
    if (!Object.values(USER_ROLES).includes(role)) {
      throw new Error('Invalid role');
    }
    
    console.log(`🔧 Setting role ${role} for user ${userId} in Firebase...`);
    
    const userRoleRef = doc(db, 'userRoles', userId);
    const roleData = {
      userId,
      role,
      assignedAt: new Date(),
      assignedBy: 'system', // In real app, this would be current admin user
      updatedAt: new Date()
    };
    
    await setDoc(userRoleRef, roleData, { merge: true });
    
    // Also store in localStorage as backup
    localStorage.setItem(`userRole_${userId}`, JSON.stringify(roleData));
    
    console.log(`✅ Role ${role} set successfully in Firebase for user ${userId}`);
    
    return {
      success: true,
      message: `User role set to ${ROLE_INFO[role].name} successfully`
    };
  } catch (error) {
    console.error('❌ Error setting user role in Firebase:', error);
    
    // Fallback to localStorage if Firebase fails
    try {
      const roleData = {
        userId,
        role,
        assignedAt: new Date(),
        assignedBy: 'system',
        updatedAt: new Date(),
        fallbackMode: true
      };
      
      localStorage.setItem(`userRole_${userId}`, JSON.stringify(roleData));
      console.log(`⚠️ Role ${role} set in localStorage as fallback`);
      
      return {
        success: true,
        message: `User role set to ${ROLE_INFO[role].name} (stored locally)`,
        fallback: true
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: error.code || 'unknown',
        message: error.message || 'Failed to set user role'
      };
    }
  }
};

// Get user role from Firestore (Firebase-based)
export const getUserRole = async (userId) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    console.log(`🔍 Getting role for user ${userId} from Firebase...`);
    
    const userRoleRef = doc(db, 'userRoles', userId);
    const roleSnap = await getDoc(userRoleRef);
    
    if (roleSnap.exists()) {
      const roleData = roleSnap.data();
      console.log(`✅ Role found in Firebase: ${roleData.role}`);
      
      // Also update localStorage cache
      localStorage.setItem(`userRole_${userId}`, JSON.stringify(roleData));
      
      return {
        success: true,
        role: roleData.role,
        data: roleData,
        source: 'firebase'
      };
    } else {
      console.log('⚠️ No role found in Firebase, checking localStorage...');
      
      // Try localStorage fallback
      const localRoleData = localStorage.getItem(`userRole_${userId}`);
      if (localRoleData) {
        const parsedRole = JSON.parse(localRoleData);
        console.log(`✅ Role found in localStorage: ${parsedRole.role}`);
        
        return {
          success: true,
          role: parsedRole.role,
          data: parsedRole,
          source: 'localStorage'
        };
      }
      
      // Default role for new users (should not happen with new system)
      console.log('🔄 No role found anywhere, assigning default role...');
      const defaultRole = USER_ROLES.OPERATOR;
      
      // Try to set default role in Firebase
      const setResult = await setUserRole(userId, defaultRole);
      
      return {
        success: true,
        role: defaultRole,
        data: {
          userId,
          role: defaultRole,
          assignedAt: new Date(),
          assignedBy: 'system',
          isDefault: true
        },
        source: 'default'
      };
    }
  } catch (error) {
    console.error('❌ Error getting user role from Firebase:', error);
    
    // Fallback to localStorage
    try {
      const localRoleData = localStorage.getItem(`userRole_${userId}`);
      if (localRoleData) {
        const parsedRole = JSON.parse(localRoleData);
        console.log(`⚠️ Using localStorage fallback: ${parsedRole.role}`);
        
        return {
          success: true,
          role: parsedRole.role,
          data: parsedRole,
          source: 'localStorage_fallback'
        };
      }
    } catch (localError) {
      console.error('❌ localStorage fallback also failed:', localError);
    }
    
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to get user role'
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
  
  // Special case for ADMIN - has access to everything
  if (userRole === USER_ROLES.ADMIN) {
    console.log('👑 ADMIN role detected - granting full access');
    return {
      wellTest: true,
      wellServices: true,
      administration: true,
      userManagement: true
    };
  }
  
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
  
  console.log('🔍 Role:', userRole, 'Permissions:', permissions.length, 'Modules:', modules);
  return modules;
};

// Initialize default role for new user
export const initializeUserRole = async (userId, email) => {
  try {
    // FIRST USER CHECK: Make the first registered user an admin
    const isFirstUser = await checkIfFirstUser();
    
    if (isFirstUser) {
      console.log('🎯 FIRST USER DETECTED! Making this user an admin...');
      console.log('👑 User ID:', userId);
      console.log('📧 Email:', email);
      
      const result = await setUserRole(userId, USER_ROLES.ADMIN);
      if (result.success) {
        console.log('✅ FIRST USER assigned ADMIN role successfully');
        console.log('🎉 Welcome to KGOC! You are now the system administrator.');
        
        // Mark that we have our first admin
        await markFirstUserCreated(userId);
        
        return {
          success: true,
          role: USER_ROLES.ADMIN,
          message: `First user automatically assigned ADMIN role`,
          isFirstUser: true
        };
      } else {
        console.error('❌ Failed to assign ADMIN role to first user:', result.message);
      }
    }
    
    // PRIORITY CHECK: If this user ID is in the admin list, ALWAYS make them admin
    if (ADMIN_USERS.includes(userId)) {
      console.log('🎯 Admin UID detected:', userId);
      console.log('🔧 Forcing ADMIN role assignment (overriding existing role)...');
      
      const result = await setUserRole(userId, USER_ROLES.ADMIN);
      if (result.success) {
        console.log('✅ ADMIN role assigned successfully');
        console.log('👑 User now has access to all modules');
        return {
          success: true,
          role: USER_ROLES.ADMIN,
          message: `Forced ADMIN role assignment for UID: ${userId}`
        };
      } else {
        console.error('❌ Failed to assign ADMIN role:', result.message);
      }
    }
    
    // Check if user already has a role (only for non-admin users)
    const existingRole = await getUserRole(userId);
    
    if (existingRole.success && existingRole.data.assignedBy !== 'system') {
      // User already has an assigned role (and it's not admin)
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

// Helper function to check if user is a predefined admin
export const isPredefinedAdmin = (userId) => {
  return ADMIN_USERS.includes(userId);
};

// Force admin role assignment for specific user
export const forceAdminRole = async (userId) => {
  if (!ADMIN_USERS.includes(userId)) {
    return {
      success: false,
      message: 'User not in predefined admin list'
    };
  }
  
  try {
    console.log('🔄 Force changing role to ADMIN for:', userId);
    const result = await setUserRole(userId, USER_ROLES.ADMIN);
    if (result.success) {
      console.log('👑 Force assigned ADMIN role to:', userId);
      return {
        success: true,
        role: USER_ROLES.ADMIN,
        message: `Force assigned ADMIN role to ${userId}`
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

// Override existing role for admin users
export const overrideToAdminRole = async (userId) => {
  if (!ADMIN_USERS.includes(userId)) {
    console.log('❌ UID not in admin list:', userId);
    return {
      success: false,
      message: `UID ${userId} is not in the predefined admin list`
    };
  }
  
  try {
    console.log('🎯 Overriding existing role to ADMIN for:', userId);
    
    // Force set admin role (overriding any existing role)
    const result = await setUserRole(userId, USER_ROLES.ADMIN);
    
    if (result.success) {
      console.log('✅ Successfully overrode role to ADMIN');
      console.log('👑 User', userId, 'is now ADMIN with full permissions');
      
      // Verify the role was set correctly
      const verifyResult = await getUserRole(userId);
      if (verifyResult.success && verifyResult.role === USER_ROLES.ADMIN) {
        console.log('🔍 Verification: Role is correctly set to ADMIN');
        return {
          success: true,
          role: USER_ROLES.ADMIN,
          message: `Successfully changed ${userId} from operator to admin`,
          verification: 'passed'
        };
      } else {
        console.log('⚠️ Verification failed, role may not be set correctly');
        return {
          success: true,
          role: USER_ROLES.ADMIN,
          message: `Role change attempted for ${userId}`,
          verification: 'failed'
        };
      }
    } else {
      console.error('❌ Failed to override role:', result.message);
      return result;
    }
  } catch (error) {
    console.error('❌ Error overriding role:', error);
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Unknown error occurred'
    };
  }
};

// Check if this is the first user in the system (Firebase-based)
export const checkIfFirstUser = async () => {
  try {
    // Check Firebase first for existing users
    if (typeof db !== 'undefined') {
      try {
        const { collection, getDocs, query, limit } = await import('firebase/firestore');
        
        // Check userRoles collection for any existing users
        const userRolesQuery = query(collection(db, 'userRoles'), limit(1));
        const userRolesSnapshot = await getDocs(userRolesQuery);
        
        if (!userRolesSnapshot.empty) {
          console.log('📋 Users already exist in Firebase (', userRolesSnapshot.size, 'users)');
          return false;
        }
        
        // Also check users collection if it exists
        const usersQuery = query(collection(db, 'users'), limit(1));
        const usersSnapshot = await getDocs(usersQuery);
        
        if (!usersSnapshot.empty) {
          console.log('📋 Users found in users collection (', usersSnapshot.size, 'users)');
          return false;
        }
        
        console.log('🎯 Firebase is empty - This is the FIRST USER!');
        return true;
        
      } catch (firebaseError) {
        console.error('❌ Firebase check failed:', firebaseError.message);
        console.log('⚠️ Falling back to localStorage check...');
        
        // Fallback to localStorage if Firebase fails
        const firstUserMarked = localStorage.getItem('firstUserCreated');
        if (firstUserMarked) {
          console.log('📋 First user already exists (localStorage fallback)');
          return false;
        }
        
        const localKeys = Object.keys(localStorage);
        const existingUserRoles = localKeys.filter(key => key.startsWith('userRole_'));
        
        if (existingUserRoles.length > 0) {
          console.log('📋 Existing user roles found in localStorage:', existingUserRoles.length);
          return false;
        }
        
        console.log('🎯 No users found anywhere - This appears to be the FIRST USER!');
        return true;
      }
    } else {
      console.log('⚠️ Firebase not available, using localStorage only');
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking first user:', error.message);
    return false;
  }
};

// Mark that the first user has been created (Firebase-based)
export const markFirstUserCreated = async (userId) => {
  try {
    const firstUserData = {
      userId: userId,
      createdAt: new Date(),
      role: 'admin',
      isFirstUser: true,
      markedAt: new Date().toISOString()
    };
    
    // Store in Firebase first
    if (typeof db !== 'undefined') {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'systemConfig', 'firstUser'), firstUserData);
        console.log('✅ First user marked in Firebase systemConfig');
      } catch (firebaseError) {
        console.error('❌ Firebase marking failed:', firebaseError.message);
      }
    }
    
    // Also store in localStorage as backup
    localStorage.setItem('firstUserCreated', JSON.stringify(firstUserData));
    console.log('✅ First user marked successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error marking first user:', error.message);
    return false;
  }
};