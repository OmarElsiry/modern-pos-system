# تعليمات البناء والتوزيع - Build Instructions

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

- **Node.js**: الإصدار 18 أو أحدث
- **npm**: يأتي مع Node.js
- **Git**: لاستنساخ المشروع

### التحقق من التثبيت

```bash
node --version  # يجب أن يكون >= 18.0.0
npm --version   # يجب أن يكون >= 9.0.0
```

## الإعداد الأولي

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd pos-cashier-system
```

### 2. تثبيت المكتبات

```bash
npm install
```

هذا سيقوم بتثبيت جميع المكتبات المطلوبة بما في ذلك:
- React & React DOM
- Electron
- TypeScript
- SQLite (better-sqlite3)
- Jest & fast-check للاختبارات
- electron-builder للتوزيع

## التطوير

### تشغيل وضع التطوير

```bash
npm run dev
```

هذا سيقوم بـ:
1. تشغيل Vite dev server للواجهة (React)
2. تشغيل Electron في وضع التطوير
3. Hot reload للتغييرات

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات مرة واحدة
npm test

# تشغيل الاختبارات في وضع المراقبة
npm run test:watch
```

### فحص الكود (Linting)

```bash
npm run lint
```

## البناء للإنتاج

### 1. بناء التطبيق

```bash
npm run build
```

هذا سيقوم بـ:
1. تجميع TypeScript إلى JavaScript
2. بناء React app باستخدام Vite
3. تجميع Electron main process
4. إنشاء مجلد `dist/` مع الملفات المبنية

### 2. اختبار البناء

بعد البناء، يمكنك اختبار التطبيق:

```bash
npm run pack
```

هذا سينشئ نسخة غير مضغوطة في مجلد `release/` للاختبار.

## إنشاء ملفات التثبيت

### Windows Installer

```bash
npm run dist:win
```

**الناتج:**
- `release/نظام الكاشير Setup X.X.X.exe` - ملف التثبيت NSIS
- يدعم معماريات x64 و ia32
- يتضمن اختصارات سطح المكتب وقائمة ابدأ

**المتطلبات:**
- يعمل على Windows 10/11
- يمكن البناء من Windows, Linux, أو macOS

### Linux Packages

```bash
npm run dist:linux
```

**الناتج:**
- `release/نظام-الكاشير-X.X.X.AppImage` - ملف AppImage محمول
- `release/نظام-الكاشير_X.X.X_amd64.deb` - حزمة Debian/Ubuntu

**المتطلبات:**
- يفضل البناء من Linux
- يمكن البناء من Windows/macOS مع أدوات إضافية

### جميع المنصات

```bash
npm run dist
```

هذا سينشئ ملفات تثبيت لجميع المنصات المدعومة.

## تخصيص البناء

### تغيير الإصدار

عدّل `version` في `package.json`:

```json
{
  "version": "1.0.0"
}
```

### تغيير الأيقونة

ضع الأيقونات في مجلد `build/`:

- `build/icon.ico` - لـ Windows
- `build/icon.png` - لـ Linux
- `build/icon.icns` - لـ macOS

**متطلبات الأيقونة:**
- Windows: 256x256 pixels, .ico format
- Linux: 512x512 pixels, .png format
- macOS: 512x512 pixels, .icns format

### تخصيص إعدادات البناء

عدّل قسم `build` في `package.json`:

```json
{
  "build": {
    "appId": "com.yourcompany.pos",
    "productName": "نظام الكاشير",
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

## البناء للتوزيع

### 1. التحضير

```bash
# تأكد من نجاح جميع الاختبارات
npm test

# تأكد من عدم وجود أخطاء في الكود
npm run lint

# نظف المجلدات القديمة
rm -rf dist release
```

### 2. البناء

```bash
# بناء التطبيق
npm run build

# إنشاء ملفات التثبيت
npm run dist:win  # لـ Windows
```

### 3. الاختبار

1. قم بتثبيت التطبيق من ملف التثبيت
2. اختبر جميع الميزات الأساسية:
   - إضافة فئات ومنتجات
   - عمليات البيع
   - التقارير
   - النسخ الاحتياطي
3. اختبر على جهاز ضعيف المواصفات

### 4. التوزيع

ملفات التثبيت جاهزة في مجلد `release/`:

```
release/
├── نظام الكاشير Setup 1.0.0.exe      # Windows installer
├── نظام-الكاشير-1.0.0.AppImage        # Linux AppImage
└── نظام-الكاشير_1.0.0_amd64.deb      # Debian package
```

## حل مشاكل البناء

### خطأ في تثبيت better-sqlite3

```bash
# أعد بناء المكتبة للمنصة الحالية
npm rebuild better-sqlite3
```

### خطأ في electron-builder

```bash
# نظف الـ cache
rm -rf node_modules
npm install
```

### مشاكل الأذونات (Linux/macOS)

```bash
# أعط أذونات التنفيذ
chmod +x release/*.AppImage
```

### حجم الملف كبير جداً

1. تأكد من استخدام production build
2. تحقق من عدم تضمين ملفات غير ضرورية
3. استخدم tree shaking في Vite

## التحسينات

### تقليل حجم البناء

1. **استبعاد ملفات التطوير:**

عدّل `files` في قسم `build`:

```json
{
  "build": {
    "files": [
      "dist/**/*",
      "!dist/**/*.map",
      "node_modules/**/*",
      "!node_modules/**/test/**",
      "package.json"
    ]
  }
}
```

2. **ضغط الملفات:**

```json
{
  "build": {
    "compression": "maximum"
  }
}
```

### تسريع البناء

1. استخدم cache:

```bash
npm run build -- --cache
```

2. بناء منصة واحدة فقط:

```bash
npm run dist:win  # بدلاً من npm run dist
```

## البناء التلقائي (CI/CD)

### GitHub Actions

أنشئ `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm install
      - run: npm test
      - run: npm run dist
      
      - uses: actions/upload-artifact@v3
        with:
          name: release-${{ matrix.os }}
          path: release/*
```

## الملاحظات الأمنية

### قبل التوزيع

1. **تحديث المكتبات:**

```bash
npm audit
npm audit fix
```

2. **فحص الثغرات:**

```bash
npm audit --production
```

3. **توقيع الكود (Code Signing):**

للتوزيع الرسمي، يُنصح بتوقيع الكود:

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/cert.pfx",
      "certificatePassword": "password"
    }
  }
}
```

## الدعم

للمساعدة في البناء والتوزيع:

1. راجع [electron-builder documentation](https://www.electron.build/)
2. راجع [Vite documentation](https://vitejs.dev/)
3. افتح Issue في صفحة المشروع

---

**بالتوفيق في بناء وتوزيع التطبيق!** 🚀
