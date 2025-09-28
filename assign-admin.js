// Admin Assignment Script - Run in Browser Console
// Manual assignment for UID: O5CQO3E2CuUm4ajBzDwYBB2hBum2

console.log('🚀 Starting admin assignment process...');

// Method 1: Direct role assignment through Firebase/localStorage
const assignAdminDirectly = async () => {
  const targetUID = 'O5CQO3E2CuUm4ajBzDwYBB2hBum2';
  
  try {
    // Try to get the role service from the running app
    if (window.location.href.includes('localhost:8081')) {
      // Use localStorage as a direct method
      const adminRoleData = {
        userId: targetUID,
        role: 'admin',
        assignedAt: new Date().toISOString(),
        assignedBy: 'manual_console',
        permissions: 'all'
      };
      
      // Store in localStorage
      localStorage.setItem(`userRole_${targetUID}`, JSON.stringify(adminRoleData));
      
      console.log('✅ Admin role stored in localStorage');
      console.log('👑 UID', targetUID, 'is now ADMIN');
      console.log('🔄 Please reload the page to see changes');
      
      // Also try to trigger a page reload
      setTimeout(() => {
        if (confirm('Admin role assigned! Reload page to apply changes?')) {
          window.location.reload();
        }
      }, 1000);
      
      return true;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

// Method 2: Force refresh user role
const forceRefreshRole = () => {
  console.log('🔄 Forcing role refresh...');
  // Clear any cached role data
  const targetUID = 'O5CQO3E2CuUm4ajBzDwYBB2hBum2';
  localStorage.removeItem(`userRole_${targetUID}`);
  localStorage.removeItem(`userProfile_${targetUID}`);
  
  // Reload page to trigger role re-initialization
  window.location.reload();
};

// Execute the assignment
assignAdminDirectly().then(success => {
  if (success) {
    console.log('🎉 Admin assignment completed successfully!');
  } else {
    console.log('⚠️ Trying alternative method...');
    forceRefreshRole();
  }
});

console.log('📋 Admin Assignment Script Info:');
console.log('Target UID:', 'O5CQO3E2CuUm4ajBzDwYBB2hBum2');
console.log('Expected Role:', 'admin (System Admin)');
console.log('Expected Permissions:', 'ALL modules (wellTest, wellServices, administration, userManagement)');