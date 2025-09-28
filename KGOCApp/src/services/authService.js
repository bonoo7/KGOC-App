// Authentication service
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

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user,
      message: 'Successfully signed in with Google!'
    };
  } catch (error) {
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
    return {
      success: true,
      user: result.user,
      message: 'Successfully signed in!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: error.message
    };
  }
};

// Create account with email and password
export const createAccount = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: result.user,
      message: 'Account created successfully!'
    };
  } catch (error) {
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

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};