// Complete Firebase User Management Service
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { USER_ROLES, ROLE_INFO, setUserRole, getUserRole } from './rolesService';

// Create complete user document in Firebase when user signs up/in
export const createFirebaseUser = async (authUser) => {
  try {
    if (!authUser || !authUser.uid) {
      throw new Error('Invalid user data provided');
    }

    const userId = authUser.uid;
    const email = authUser.email;
    const displayName = authUser.displayName || email.split('@')[0];
    const photoURL = authUser.photoURL || null;

    console.log('🔥 Creating Firebase user document for:', userId);

    // Check if this is the first user in the system
    const isFirstUser = await checkIfFirstUserInFirebase();
    
    // Determine role based on first user check
    const userRole = isFirstUser ? USER_ROLES.ADMIN : USER_ROLES.OPERATOR;
    
    // Create main user document
    const userRef = doc(db, 'users', userId);
    const userData = {
      uid: userId,
      email: email,
      displayName: displayName,
      photoURL: photoURL,
      role: userRole,
      isFirstUser: isFirstUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
      provider: authUser.providerData?.[0]?.providerId || 'email'
    };

    await setDoc(userRef, userData, { merge: true });
    console.log('✅ User document created in users collection');

    // Create user role document
    const roleResult = await setUserRole(userId, userRole);
    if (roleResult.success) {
      console.log('✅ User role set successfully');
    }

    // Create user profile document
    const profileRef = doc(db, 'userProfiles', userId);
    const profileData = {
      userId: userId,
      displayName: displayName,
      email: email,
      photoURL: photoURL,
      bio: '',
      phone: '',
      location: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(profileRef, profileData, { merge: true });
    console.log('✅ User profile created in userProfiles collection');

    // Create user settings document
    const settingsRef = doc(db, 'userSettings', userId);
    const settingsData = {
      userId: userId,
      notifications: true,
      darkMode: false,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(settingsRef, settingsData, { merge: true });
    console.log('✅ User settings created in userSettings collection');

    // Mark first user if applicable
    if (isFirstUser) {
      await markFirstUserInFirebase(userId);
      console.log('👑 First user marked in Firebase');
    }

    // Log activity
    await logUserActivity(userId, {
      action: 'user_created',
      description: `User account created${isFirstUser ? ' (First User - Admin)' : ''}`,
      metadata: {
        email: email,
        provider: userData.provider,
        role: userRole,
        isFirstUser: isFirstUser
      }
    });

    return {
      success: true,
      user: userData,
      role: userRole,
      isFirstUser: isFirstUser,
      message: isFirstUser ? 
        'Welcome! You are the first user and have been granted admin privileges.' :
        'User account created successfully!'
    };

  } catch (error) {
    console.error('❌ Error creating Firebase user:', error);
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to create user in Firebase'
    };
  }
};

// Update user last login time
export const updateUserLastLogin = async (userId) => {
  try {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Last login updated for user:', userId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating last login:', error);
    return { success: false, error: error.message };
  }
};

// Check if this is the first user in Firebase
export const checkIfFirstUserInFirebase = async () => {
  try {
    // Check if systemConfig/firstUser exists
    const firstUserRef = doc(db, 'systemConfig', 'firstUser');
    const firstUserSnap = await getDoc(firstUserRef);
    
    if (firstUserSnap.exists()) {
      console.log('📋 First user already exists in systemConfig');
      return false;
    }

    // Check if any users exist in users collection
    const usersQuery = query(collection(db, 'users'), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (!usersSnapshot.empty) {
      console.log('📋 Users already exist in users collection');
      return false;
    }

    // Check userRoles collection as backup
    const rolesQuery = query(collection(db, 'userRoles'), limit(1));
    const rolesSnapshot = await getDocs(rolesQuery);
    
    if (!rolesSnapshot.empty) {
      console.log('📋 User roles already exist in userRoles collection');
      return false;
    }

    console.log('🎯 No users found in Firebase - This is the FIRST USER!');
    return true;

  } catch (error) {
    console.error('❌ Error checking first user in Firebase:', error);
    // Default to false on error to be safe
    return false;
  }
};

// Mark first user in Firebase
export const markFirstUserInFirebase = async (userId) => {
  try {
    const firstUserRef = doc(db, 'systemConfig', 'firstUser');
    const firstUserData = {
      userId: userId,
      createdAt: serverTimestamp(),
      role: USER_ROLES.ADMIN,
      isFirstUser: true
    };

    await setDoc(firstUserRef, firstUserData);
    console.log('✅ First user marked in Firebase systemConfig');
    return { success: true };
  } catch (error) {
    console.error('❌ Error marking first user:', error);
    return { success: false, error: error.message };
  }
};

// Get complete user data from Firebase
export const getFirebaseUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user document
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: 'User not found in Firebase'
      };
    }

    const userData = userSnap.data();

    // Get user role
    const roleResult = await getUserRole(userId);
    const userRole = roleResult.success ? roleResult.role : USER_ROLES.OPERATOR;

    // Get user profile
    const profileRef = doc(db, 'userProfiles', userId);
    const profileSnap = await getDoc(profileRef);
    const profileData = profileSnap.exists() ? profileSnap.data() : {};

    // Get user settings
    const settingsRef = doc(db, 'userSettings', userId);
    const settingsSnap = await getDoc(settingsRef);
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};

    return {
      success: true,
      user: userData,
      profile: profileData,
      settings: settingsData,
      role: userRole,
      roleInfo: ROLE_INFO[userRole]
    };

  } catch (error) {
    console.error('❌ Error getting Firebase user:', error);
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to get user from Firebase'
    };
  }
};

// Update user role (admin function)
export const updateUserRoleInFirebase = async (targetUserId, newRole, adminUserId) => {
  try {
    if (!Object.values(USER_ROLES).includes(newRole)) {
      throw new Error('Invalid role specified');
    }

    // Update role in userRoles collection
    const roleResult = await setUserRole(targetUserId, newRole);
    if (!roleResult.success) {
      throw new Error(roleResult.message);
    }

    // Update role in main user document
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
      roleUpdatedBy: adminUserId,
      roleUpdatedAt: serverTimestamp()
    });

    // Log the role change activity
    await logUserActivity(targetUserId, {
      action: 'role_changed',
      description: `User role changed to ${ROLE_INFO[newRole].name}`,
      metadata: {
        newRole: newRole,
        changedBy: adminUserId,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ User ${targetUserId} role updated to ${newRole} by ${adminUserId}`);

    return {
      success: true,
      message: `User role updated to ${ROLE_INFO[newRole].name} successfully`
    };

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to update user role'
    };
  }
};

// Log user activity
export const logUserActivity = async (userId, activity) => {
  try {
    const activityRef = collection(db, 'userActivities');
    const activityData = {
      userId: userId,
      ...activity,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    await setDoc(doc(activityRef), activityData);
    console.log('✅ User activity logged:', activity.action);
    return { success: true };
  } catch (error) {
    console.error('❌ Error logging activity:', error);
    return { success: false, error: error.message };
  }
};

// Get all users (admin function)
export const getAllUsers = async (limitCount = 50) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Get role for each user
      const roleResult = await getUserRole(userData.uid);
      const userRole = roleResult.success ? roleResult.role : USER_ROLES.OPERATOR;

      users.push({
        id: userDoc.id,
        ...userData,
        role: userRole,
        roleInfo: ROLE_INFO[userRole]
      });
    }

    return {
      success: true,
      users: users,
      count: users.length
    };

  } catch (error) {
    console.error('❌ Error getting all users:', error);
    return {
      success: false,
      error: error.code || 'unknown',
      message: error.message || 'Failed to get users from Firebase'
    };
  }
};

// Check if user exists in Firebase
export const checkUserExistsInFirebase = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('❌ Error checking user existence:', error);
    return false;
  }
};

export default {
  createFirebaseUser,
  updateUserLastLogin,
  checkIfFirstUserInFirebase,
  markFirstUserInFirebase,
  getFirebaseUser,
  updateUserRoleInFirebase,
  logUserActivity,
  getAllUsers,
  checkUserExistsInFirebase
};