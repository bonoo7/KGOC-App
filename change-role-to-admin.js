// ROLE CHANGE SCRIPT - Operator to Admin
// For existing user: O5CQO3E2CuUm4ajBzDwYBB2hBum2
// Copy and paste this entire script into browser console (F12)

console.log('🚀 Starting role change: Operator → Admin');
console.log('Target UID: O5CQO3E2CuUm4ajBzDwYBB2hBum2');

const TARGET_UID = 'O5CQO3E2CuUm4ajBzDwYBB2hBum2';

// Method 1: Direct localStorage override
const overrideRoleInLocalStorage = () => {
  console.log('📝 Method 1: Overriding role in localStorage...');
  
  // Clear any existing role data
  localStorage.removeItem(`userRole_${TARGET_UID}`);
  localStorage.removeItem(`userProfile_${TARGET_UID}`);
  localStorage.removeItem(`userSettings_${TARGET_UID}`);
  
  // Set new admin role
  const adminRoleData = {
    userId: TARGET_UID,
    role: 'admin',
    assignedAt: new Date(),
    assignedBy: 'manual_override',
    permissions: 'all',
    modules: {
      wellTest: true,
      wellServices: true,
      administration: true,
      userManagement: true
    }
  };
  
  // Store the admin role
  localStorage.setItem(`userRole_${TARGET_UID}`, JSON.stringify(adminRoleData));
  
  console.log('✅ Admin role stored in localStorage');
  console.log('📋 Role data:', adminRoleData);
  
  return true;
};

// Method 2: Force Firebase role change (if Firebase is working)
const overrideRoleInFirebase = async () => {
  console.log('🔥 Method 2: Attempting Firebase role override...');
  
  try {
    // Check if we can access Firebase
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      const userRoleRef = db.collection('userRoles').doc(TARGET_UID);
      
      const adminRoleData = {
        userId: TARGET_UID,
        role: 'admin',
        assignedAt: new Date(),
        assignedBy: 'manual_override'
      };
      
      await userRoleRef.set(adminRoleData, { merge: true });
      console.log('✅ Admin role updated in Firebase');
      return true;
    } else {
      console.log('⚠️ Firebase not available, skipping...');
      return false;
    }
  } catch (error) {
    console.log('❌ Firebase method failed:', error.message);
    return false;
  }
};

// Method 3: Trigger role refresh
const triggerRoleRefresh = () => {
  console.log('🔄 Method 3: Triggering role refresh...');
  
  // Create a custom event to trigger role reload
  const roleChangeEvent = new CustomEvent('roleChanged', {
    detail: {
      userId: TARGET_UID,
      newRole: 'admin',
      timestamp: new Date()
    }
  });
  
  window.dispatchEvent(roleChangeEvent);
  console.log('📡 Role change event dispatched');
};

// Execute all methods
const executeRoleChange = async () => {
  console.log('⚡ Executing role change sequence...');
  
  // Step 1: Override in localStorage
  const localStorageSuccess = overrideRoleInLocalStorage();
  
  // Step 2: Try Firebase (if available)
  const firebaseSuccess = await overrideRoleInFirebase();
  
  // Step 3: Trigger refresh
  triggerRoleRefresh();
  
  // Step 4: Show results
  console.log('📊 Role Change Results:');
  console.log('- localStorage:', localStorageSuccess ? '✅ Success' : '❌ Failed');
  console.log('- Firebase:', firebaseSuccess ? '✅ Success' : '⚠️ Skipped/Failed');
  console.log('- Event Trigger: ✅ Dispatched');
  
  // Step 5: Recommend next action
  console.log('');
  console.log('🎯 NEXT STEPS:');
  console.log('1. Refresh the page to apply changes');
  console.log('2. Login with the target account');
  console.log('3. Check for "System Admin" role badge');
  console.log('4. Verify all 4 modules are accessible');
  
  // Auto-refresh option
  setTimeout(() => {
    if (confirm('Role change completed! Refresh page now to apply changes?')) {
      window.location.reload();
    }
  }, 2000);
};

// Start the process
executeRoleChange().catch(error => {
  console.error('❌ Error during role change:', error);
});

console.log('');
console.log('📋 Expected Result After Refresh:');
console.log('- Role: admin (System Admin)');
console.log('- Badge: 👑 Black badge');
console.log('- wellTest: ✅ true');
console.log('- wellServices: ✅ true'); 
console.log('- administration: ✅ true');
console.log('- userManagement: ✅ true');