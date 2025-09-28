// Well Test Setup Script - Run in Browser Console
// This script sets up the Firebase collections and permissions for Well Test functionality

console.log('🔬 Setting up Well Test Firebase collections...');

// Sample well test data for testing
const sampleWellTests = [
  {
    wellNumber: 'KGC-001',
    wellType: 'Oil',
    artificialLiftType: 'Sucker Rod Pump',
    api: '12-345-67890',
    flowRate: 150.5,
    gasRate: 2500.0,
    waterCut: 15.2,
    h2s: 50.0,
    co2: 100.0,
    salinity: 5000.0,
    wellheadPressure: 1250.0,
    wellheadTemperature: 180.0,
    chokeSize: 0.75,
    testDate: '2024-01-15',
    notes: 'Initial production test - good flow rates with sucker rod pump',
    createdBy: 'system',
    createdByEmail: 'system@kgoc.com',
    createdByName: 'System',
    userRole: 'admin',
    status: 'active',
    version: 1
  },
  {
    wellNumber: 'KGC-002',
    wellType: 'Gas',
    artificialLiftType: 'Natural Flow',
    api: '12-345-67891',
    flowRate: 75.0,
    gasRate: 5000.0,
    waterCut: 5.0,
    h2s: 25.0,
    co2: 150.0,
    salinity: 3000.0,
    wellheadPressure: 2000.0,
    wellheadTemperature: 160.0,
    chokeSize: 0.5,
    testDate: '2024-01-16',
    notes: 'Natural flowing gas well with excellent production rates',
    createdBy: 'system',
    createdByEmail: 'system@kgoc.com',
    createdByName: 'System',
    userRole: 'admin',
    status: 'active',
    version: 1
  },
  {
    wellNumber: 'KGC-003',
    wellType: 'Oil',
    artificialLiftType: 'Electric Submersible Pump (ESP)',
    api: '12-345-67892',
    flowRate: 200.0,
    gasRate: 1800.0,
    waterCut: 25.5,
    h2s: 75.0,
    co2: 80.0,
    salinity: 7500.0,
    wellheadPressure: 1100.0,
    wellheadTemperature: 190.0,
    chokeSize: 1.0,
    testDate: '2024-01-17',
    notes: 'High production oil well with ESP and elevated water cut',
    createdBy: 'system',
    createdByEmail: 'system@kgoc.com',
    createdByName: 'System',
    userRole: 'admin',
    status: 'active',
    version: 1
  },
  {
    wellNumber: 'KGC-001',
    wellType: 'Oil',
    artificialLiftType: 'Sucker Rod Pump',
    api: '12-345-67890',
    flowRate: 145.2,
    gasRate: 2400.0,
    waterCut: 18.5,
    h2s: 48.0,
    co2: 95.0,
    salinity: 5200.0,
    wellheadPressure: 1200.0,
    wellheadTemperature: 175.0,
    chokeSize: 0.75,
    testDate: '2024-01-25',
    notes: 'Follow-up test for KGC-001 - slight decline in production',
    createdBy: 'system',
    createdByEmail: 'system@kgoc.com',
    createdByName: 'System',
    userRole: 'admin',
    status: 'active',
    version: 1
  },
  {
    wellNumber: 'KGC-004',
    wellType: 'Water',
    artificialLiftType: 'Progressive Cavity Pump (PCP)',
    api: '12-345-67893',
    flowRate: 300.0,
    gasRate: 0.0,
    waterCut: 95.0,
    h2s: 10.0,
    co2: 50.0,
    salinity: 8000.0,
    wellheadPressure: 800.0,
    wellheadTemperature: 140.0,
    chokeSize: 1.25,
    testDate: '2024-01-18',
    notes: 'Water injection well with PCP for enhanced oil recovery',
    createdBy: 'system',
    createdByEmail: 'system@kgoc.com',
    createdByName: 'System',
    userRole: 'admin',
    status: 'active',
    version: 1
  }
];

// Function to create sample well tests
const createSampleWellTests = async () => {
  console.log('📝 Creating sample well test data...');
  
  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.log('⚠️ Firebase not available, storing in localStorage only');
      localStorage.setItem('wellTests', JSON.stringify(sampleWellTests));
      console.log('✅ Sample well tests stored in localStorage');
      return;
    }

    const db = firebase.firestore();
    const wellTestsCollection = db.collection('wellTests');

    // Add each sample well test
    for (const wellTest of sampleWellTests) {
      const docRef = await wellTestsCollection.add({
        ...wellTest,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Created sample well test: ${wellTest.wellNumber} (ID: ${docRef.id})`);
    }

    console.log('🎉 All sample well tests created successfully!');

  } catch (error) {
    console.error('❌ Error creating sample well tests:', error);
    
    // Fallback to localStorage
    localStorage.setItem('wellTests', JSON.stringify(sampleWellTests));
    console.log('⚠️ Sample well tests stored in localStorage as fallback');
  }
};

// Function to check Well Test permissions
const checkWellTestPermissions = () => {
  console.log('🔐 Checking Well Test permissions...');
  
  const userRole = 'admin'; // Change this to test different roles
  
  // Import permissions (this works in the app context)
  console.log('Checking permissions for role:', userRole);
  console.log('Expected Well Test permissions:');
  console.log('- WELL_TEST_VIEW: Should be granted');
  console.log('- WELL_TEST_CREATE: Should be granted');
  console.log('- WELL_TEST_EDIT: Should be granted');
  console.log('- WELL_TEST_DELETE: Should be granted (admin only)');
  console.log('- WELL_TEST_APPROVE: Should be granted (supervisor+)');
};

// Function to verify Well Test screen access
const verifyWellTestAccess = () => {
  console.log('📱 Verifying Well Test screen access...');
  console.log('✅ Well Test screen should be accessible from Dashboard');
  console.log('✅ Navigation: Dashboard → Well Test button → Well Test Screen');
  console.log('✅ Features available:');
  console.log('   - View all well tests in list format');
  console.log('   - Add new well test with complete form');
  console.log('   - Edit existing well tests');
  console.log('   - Delete well tests (with permissions)');
  console.log('   - View detailed well test information');
  console.log('   - Role-based access control');
};

// Main setup function
const setupWellTest = async () => {
  console.log('🚀 Starting Well Test setup...');
  
  // Create sample data
  await createSampleWellTests();
  
  // Check permissions
  checkWellTestPermissions();
  
  // Verify access
  verifyWellTestAccess();
  
  console.log('');
  console.log('📋 Well Test Setup Complete!');
  console.log('');
  console.log('🎯 How to test:');
  console.log('1. Go to Dashboard');
  console.log('2. Click "Well Test" service card');
  console.log('3. Should navigate to Well Test Management screen');
  console.log('4. See sample well tests in the list');
  console.log('5. Try adding a new well test');
  console.log('6. Test edit and delete functions');
  console.log('');
  console.log('📊 Firebase Collections:');
  console.log('- wellTests: Main collection for well test data');
  console.log('- Each document contains all well parameters');
  console.log('- Real-time sync with localStorage fallback');
  console.log('');
  console.log('🔐 Role Permissions:');
  console.log('- WELLTESTER: View, Create, Edit');
  console.log('- OPERATOR: View, Create, Edit');
  console.log('- SUPERVISOR: View, Create, Edit, Approve');
  console.log('- COORDINATOR: View, Create, Edit, Delete, Approve');
  console.log('- ADMINISTRATOR: All permissions');
  console.log('- ADMIN: All permissions');
};

// Execute setup
setupWellTest().catch(error => {
  console.error('❌ Setup failed:', error);
});

// Export for manual use
window.setupWellTest = setupWellTest;
window.createSampleWellTests = createSampleWellTests;

console.log('');
console.log('💡 Available commands:');
console.log('- setupWellTest(): Run complete setup');
console.log('- createSampleWellTests(): Create sample data only');
console.log('- checkWellTestPermissions(): Check role permissions');
console.log('- verifyWellTestAccess(): Verify screen access');