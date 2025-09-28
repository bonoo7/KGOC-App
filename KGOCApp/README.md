# 🚀 KGOC Mobile Application

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**تطبيق React Native متكامل للويب والموبايل مع Firebase**

[التوثيق](#documentation) • [التشغيل](#getting-started) • [الميزات](#features) • [المساهمة](#contributing)

</div>

---

## 📋 نظرة عامة - Overview

تطبيق KGOC هو تطبيق React Native متكامل يدعم الويب والموبايل (Android/iOS) مع نظام Firebase للمصادقة وقاعدة البيانات. يوفر التطبيق تجربة مستخدم حديثة ومتكاملة مع إمكانيات متقدمة لإدارة الملفات الشخصية والإعدادات.

## ✨ الميزات الرئيسية - Key Features

### 🔐 نظام المصادقة المتكامل
- تسجيل الدخول بالإيميل وكلمة المرور
- تسجيل الدخول عبر Google OAuth
- إنشاء حسابات جديدة
- إعادة تعيين كلمة المرور عبر الإيميل
- تغيير كلمة المرور داخل التطبيق
- حفظ جلسة المستخدم تلقائياً

### 📊 لوحة التحكم الذكية
- **Dashboard** رئيسية تظهر بعد تسجيل الدخول
- أزرار سريعة للخدمات الرئيسية
- زر البروفايل السريع في أعلى الشاشة
- تصميم عصري وجذاب

### 👥 نظام الأدوار والصلاحيات
- 6 أنواع مختلفة من المستخدمين:
  - **Well Tester** - مختص اختبار الآبار
  - **Operator** - مشغل
  - **Supervisor** - مشرف  
  - **Coordinator** - منسق
  - **Administrator** - مدير
  - **Admin** - المدير العام
- ربط الأدوار مع Firebase Authentication
- عرض الدور في الملف الشخصي

### 📱 واجهات مستخدم متجاوبة
- **لوحة التحكم**: الصفحة الرئيسية مع أزرار الخدمات
- **الملف الشخصي**: إدارة البيانات الشخصية والدور
- **الإعدادات**: تخصيص التطبيق وتغيير كلمة المرور
- **تصميم متجاوب**: يعمل على جميع أحجام الشاشات

### 🗄️ قاعدة بيانات متقدمة
- حفظ بيانات المستخدمين في Firestore
- تخزين الإعدادات والتفضيلات
- تسجيل الأنشطة والعمليات
- تحديث البيانات في الوقت الفعلي

### 📲 دعم متعدد المنصات
- **الويب**: يعمل في جميع المتصفحات الحديثة
- **Android**: دعم كامل لأندرويد 7.0+
- **iOS**: دعم كامل لـ iOS 11.0+
- **Expo Go**: اختبار فوري على الأجهزة

## 🚀 البدء السريع - Getting Started

### المتطلبات الأساسية
```bash
Node.js 16.0+ 
npm أو yarn
Expo CLI (اختياري)
```

### 1. تحميل المشروع
```bash
git clone [repository-url]
cd KGOCApp
```

### 2. تثبيت المتطلبات
```bash
npm install
```

### 3. تشغيل التطبيق
```bash
# للتشغيل على الويب
npm run web

# للتشغيل على الموبايل (QR Code)
npm start

# للتشغيل على Android
npm run android

# للتشغيل على iOS
npm run ios
```

### 4. فتح التطبيق
- **الويب**: http://localhost:8081
- **الموبايل**: امسح QR Code بتطبيق Expo Go

## 🏗️ الهيكل التقني - Architecture

### التقنيات المستخدمة
- **Frontend**: React Native 0.81.4
- **Framework**: Expo SDK 54
- **Navigation**: React Navigation 6
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **State Management**: React Hooks

### هيكل المشروع
```
KGOCApp/
├── src/
│   ├── components/          # المكونات المعاد استخدامها
│   ├── screens/            # شاشات التطبيق
│   │   ├── LoginScreen.js  # شاشة تسجيل الدخول
│   │   ├── HomeScreen.js   # الشاشة الرئيسية
│   │   ├── DashboardScreen.js # لوحة التحكم الرئيسية  
│   │   ├── ProfileScreen.js# شاشة الملف الشخصي
│   │   ├── SettingsScreen.js# شاشة الإعدادات
│   │   └── RoleManagementScreen.js # إدارة الأدوار
│   ├── navigation/         # إعدادات التنقل
│   │   └── AppNavigator.js # التنقل الرئيسي
│   ├── services/           # خدمات الـ API
│   │   ├── authService.js  # خدمات المصادقة
│   │   ├── firestoreService.js# خدمات قاعدة البيانات
│   │   ├── rolesService.js # خدمات الأدوار
│   │   └── localStorageService.js# التخزين المحلي
│   └── config/             # إعدادات Firebase
│       └── firebase.js     # تكوين Firebase
├── assets/                 # الصور والملفات
├── App.js                  # الملف الرئيسي
├── PROJECT_PLAN.md         # خطة المشروع
├── DEVELOPMENT_LOG.md      # سجل التطوير
└── README.md              # هذا الملف
```

## 🔧 الإعدادات - Configuration

### إعداد Firebase
1. أنشئ مشروع Firebase جديد
2. فعّل Authentication و Firestore
3. احصل على Firebase config
4. استبدل الإعدادات في `src/config/firebase.js`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### إعداد Google Sign-in
1. في Firebase Console، فعّل Google provider
2. أضف domains المسموحة للويب
3. للموبايل، أضف SHA-1 fingerprint

## 📱 اختبار التطبيق - Testing

### الاختبار على الويب
```bash
npm run web
# افتح http://localhost:8081
```

### الاختبار على الموبايل
```bash
# ثبت Expo Go على هاتفك
npm start
# امسح QR Code بتطبيق Expo Go
```

### بناء التطبيق للإنتاج
```bash
# ثبت EAS CLI
npm install -g @expo/eas-cli

# اعمل login
eas login

# بناء Android
eas build -p android

# بناء iOS
eas build -p ios
```

## 📚 التوثيق التفصيلي - Documentation

### ملفات المرجع
- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) - خطة المشروع المفصلة
- [`COMPLETED_FEATURES.md`](./COMPLETED_FEATURES.md) - سجل الميزات المكتملة
- [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) - سجل التطوير اليومي
- [`MOBILE_SETUP.md`](./MOBILE_SETUP.md) - دليل إعداد الموبايل

### الواجهات البرمجية

#### خدمات إدارة الأدوار (`rolesService.js`)
```javascript
// إدارة الأدوار
getUserRole(userId)
setUserRole(userId, role)
getAllowedRoles()
checkRolePermission(userRole, requiredRole)

// أنواع الأدوار المتاحة
ROLES = {
  WELLTESTER: 'welltester',
  OPERATOR: 'operator', 
  SUPERVISOR: 'supervisor',
  COORDINATOR: 'coordinator',
  ADMINISTRATOR: 'administrator',
  ADMIN: 'admin'
}
```

#### خدمات المصادقة (`authService.js`)
```javascript
// تسجيل الدخول
signInWithEmail(email, password)
signInWithGoogle()

// إدارة الحساب
createAccount(email, password)
resetPassword(email)
changePassword(currentPassword, newPassword)
logout()
```

#### خدمات قاعدة البيانات (`firestoreService.js`)
```javascript
// إدارة الملف الشخصي
createUserProfile(userId, profileData)
getUserProfile(userId)
updateUserProfile(userId, updates)

// إدارة الإعدادات
saveUserSettings(userId, settings)
getUserSettings(userId)
```

## 🤝 المساهمة - Contributing

### كيفية المساهمة
1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. اعمل commit للتغييرات (`git commit -m 'Add amazing feature'`)
4. ادفع للـ branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

### قواعد الكود
- اتبع نمط الكود الموجود
- أضف تعليقات للوظائف المعقدة
- اختبر التغييرات قبل الإرسال
- حدّث التوثيق عند الحاجة

## 🐛 الإبلاغ عن المشاكل - Bug Reports

لإبلاغ عن مشكلة، يرجى فتح Issue جديد مع:
- وصف المشكلة بالتفصيل
- خطوات إعادة إنتاج المشكلة
- لقطات شاشة (إن أمكن)
- معلومات البيئة (OS, Browser, Device)

## 📜 الترخيص - License

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل - Contact

- **المطور**: GitHub Profile
- **الإيميل**: contact@example.com
- **الموقع**: https://example.com

## 🙏 الشكر والتقدير - Acknowledgments

- [React Native](https://reactnative.dev/) للإطار العمل الرائع
- [Expo](https://expo.dev/) لتسهيل عملية التطوير
- [Firebase](https://firebase.google.com/) للخدمات السحابية
- [React Navigation](https://reactnavigation.org/) لنظام التنقل

---

<div align="center">

**مطور بـ ❤️ لمجتمع KGOC**

[⬆ العودة للأعلى](#-kgoc-mobile-application)

</div>