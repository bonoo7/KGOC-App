// مسح localStorage للتأكد من أن المستخدم الأول سيصبح admin
// Clear localStorage to ensure first user becomes admin
// انسخ والصق هذا الكود في console المتصفح

console.log('🧹 مسح بيانات localStorage...');
console.log('🧹 Clearing localStorage data...');

// مسح علامة المستخدم الأول
localStorage.removeItem('firstUserCreated');

// مسح جميع بيانات المستخدمين المحفوظة محلياً
const allKeys = Object.keys(localStorage);
const userKeys = allKeys.filter(key => 
  key.startsWith('userRole_') || 
  key.startsWith('userProfile_') || 
  key.startsWith('userSettings_') ||
  key.startsWith('user_')
);

console.log('🗂️ المفاتيح الموجودة:', allKeys.length);
console.log('👥 مفاتيح المستخدمين:', userKeys.length);

// مسح جميع بيانات المستخدمين
userKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ تم مسح:', key);
});

// مسح أي بيانات إضافية
localStorage.removeItem('systemConfig');
localStorage.removeItem('adminUsers');

console.log('✅ تم مسح localStorage بنجاح!');
console.log('✅ localStorage cleared successfully!');
console.log('');
console.log('🎯 النظام الآن جاهز للمستخدم الأول');
console.log('🎯 System is now ready for first user');
console.log('');
console.log('📋 الخطوات التالية:');
console.log('📋 Next steps:');
console.log('1. إنشاء حساب جديد (التسجيل)');
console.log('1. Create new account (Sign up)');
console.log('2. تسجيل الدخول بالحساب الجديد');
console.log('2. Login with new account');
console.log('3. سيتم اكتشاف أنه المستخدم الأول تلقائياً');
console.log('3. System will auto-detect as first user');
console.log('4. سيحصل على صلاحيات الإدارة كاملة');
console.log('4. Will get full admin permissions');

// إعادة تحميل الصفحة
setTimeout(() => {
  if (confirm('localStorage تم مسح البيانات! هل تريد إعادة تحميل الصفحة؟\nData cleared! Refresh page?')) {
    window.location.reload();
  }
}, 2000);