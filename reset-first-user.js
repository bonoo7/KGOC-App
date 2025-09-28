// RESET FIRST USER FLAG
// Run this in browser console if you need to reset the first user detection

console.log('🔄 Resetting first user detection...');

// Clear localStorage flags
localStorage.removeItem('firstUserCreated');

// Clear any existing user roles
const keys = Object.keys(localStorage);
const userRoleKeys = keys.filter(key => key.startsWith('userRole_'));
const userProfileKeys = keys.filter(key => key.startsWith('userProfile_'));
const userSettingsKeys = keys.filter(key => key.startsWith('userSettings_'));

console.log('🗑️ Clearing existing user data:');
console.log('- User roles:', userRoleKeys.length);
console.log('- User profiles:', userProfileKeys.length);
console.log('- User settings:', userSettingsKeys.length);

// Remove all user-related data
[...userRoleKeys, ...userProfileKeys, ...userSettingsKeys].forEach(key => {
  localStorage.removeItem(key);
});

console.log('✅ First user flag reset complete!');
console.log('🎯 The next user to register will become admin automatically');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Create a new account (sign up)');
console.log('2. Login with the new account');
console.log('3. System will detect this as the first user');
console.log('4. Account will be automatically assigned admin role');
console.log('5. User will have access to all modules');

// Optional: Show confirmation
setTimeout(() => {
  if (confirm('First user reset complete! Refresh page to apply changes?')) {
    window.location.reload();
  }
}, 1000);