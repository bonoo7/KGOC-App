// Authentication service with Firebase user creation
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { createFirebaseUser, updateUserLastLogin, checkUserExistsInFirebase } from './userManagementService';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firebase, if not create them
    const userExists = await checkUserExistsInFirebase(user.uid);
    
    if (!userExists) {
      console.log('🆕 New Google user detected, creating Firebase user...');
      const createResult = await createFirebaseUser(user);
      
      if (createResult.success) {
        console.log('✅ Firebase user created for Google sign-in');
        return {
          success: true,
          user: user,
          isNewUser: true,
          isFirstUser: createResult.isFirstUser,
          role: createResult.role,
          message: createResult.message
        };
      } else {
        console.error('❌ Failed to create Firebase user for Google sign-in');
      }
    } else {
      // Update last login for existing user
      await updateUserLastLogin(user.uid);
      console.log('✅ Existing Google user signed in');
    }

    return {
      success: true,
      user: user,
      isNewUser: false,
      message: 'Successfully signed in with Google!'
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Check if user exists in Firebase, if not create them
    const userExists = await checkUserExistsInFirebase(user.uid);
    
    if (!userExists) {
      console.log('🆕 Existing auth user not in Firebase, creating user document...');
      const createResult = await createFirebaseUser(user);
      
      if (createResult.success) {
        console.log('✅ Firebase user document created for existing auth user');
        return {
          success: true,
          user: user,
          isNewUser: true,
          isFirstUser: createResult.isFirstUser,
          role: createResult.role,
          message: createResult.message
        };
      }
    } else {
      // Update last login for existing user
      await updateUserLastLogin(user.uid);
      console.log('✅ User signed in successfully');
    }

    return {
      success: true,
      user: user,
      isNewUser: false,
      message: 'Successfully signed in!'
    };
  } catch (error) {
    console.error('❌ Email sign-in error:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Create account with email and password
export const createAccount = async (email, password, displayName = null) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName: displayName });
      // Refresh user object to get updated displayName
      user.displayName = displayName;
    }
    
    console.log('🆕 New account created, creating Firebase user document...');
    
    // Create complete user document in Firebase
    const createResult = await createFirebaseUser(user);
    
    if (createResult.success) {
      console.log('✅ Firebase user document created for new account');
      
      return {
        success: true,
        user: user,
        isNewUser: true,
        isFirstUser: createResult.isFirstUser,
        role: createResult.role,
        message: createResult.message
      };
    } else {
      console.error('❌ Failed to create Firebase user document');
      return {
        success: true, // Auth succeeded even if Firebase failed
        user: user,
        isNewUser: true,
        warning: 'Account created but Firebase setup failed',
        message: 'Account created successfully!'
      };
    }
  } catch (error) {
    console.error('❌ Account creation error:', error);
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Successfully signed out!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Update user profile
export const updateUserProfile = async (displayName, photoURL) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL
    });

    return {
      success: true,
      message: 'Profile updated successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Update password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    return {
      success: true,
      message: 'Password updated successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Listen to auth state changes with Firebase user creation
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Check if user exists in Firebase
      const userExists = await checkUserExistsInFirebase(user.uid);
      
      if (!userExists) {
        console.log('🔄 Auth state changed for user not in Firebase, creating user document...');
        await createFirebaseUser(user);
      } else {
        // Update last login
        await updateUserLastLogin(user.uid);
      }
    }
    
    callback(user);
  });
};