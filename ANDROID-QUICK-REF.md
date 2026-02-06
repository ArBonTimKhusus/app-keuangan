# 🚀 ArBonKas Android - Quick Reference

## 📦 File ZIP

**Nama File**: `arbonkas-android.zip`  
**Ukuran**: 27 KB (27,648 bytes)  
**Total Files**: 39 files  
**MD5 Checksum**: e50dc73953252c6a9ce6f302520732dc

## 📁 Struktur Package

```
arbonkas-android.zip
└── android-package/
    ├── README.md              (7 KB)  - Dokumentasi lengkap
    ├── INSTALL.md             (4 KB)  - Panduan instalasi
    ├── build.gradle           - Root build config
    ├── settings.gradle        - Gradle settings
    ├── gradle.properties      - Gradle properties
    ├── gradlew               - Gradle wrapper script
    ├── gradle/wrapper/        - Gradle wrapper files
    └── app/
        ├── build.gradle       - App build config
        ├── proguard-rules.pro - ProGuard rules
        └── src/main/
            ├── AndroidManifest.xml         - App manifest
            ├── java/com/arbonkas/app/
            │   └── MainActivity.java       - Main activity (75 lines)
            ├── res/
            │   ├── layout/
            │   │   └── activity_main.xml   - WebView layout
            │   └── values/
            │       ├── strings.xml         - App name & strings
            │       └── styles.xml          - App theme
            └── assets/
                ├── index.html              (16 KB) - Web app
                ├── css/styles.css          (15 KB) - Styles
                └── js/app.js               (28 KB) - JavaScript
```

## ⚡ Quick Commands

### Ekstrak ZIP
```bash
unzip arbonkas-android.zip
cd android-package
```

### Build Debug APK
```bash
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Build Release APK
```bash
./gradlew assembleRelease
# Perlu keystore untuk signing
```

### Install ke Device
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Clean Build
```bash
./gradlew clean
```

## 📱 App Info

| Property | Value |
|----------|-------|
| **Package Name** | com.arbonkas.app |
| **App Name** | ArBonKas |
| **Version Code** | 1 |
| **Version Name** | 1.0.0 |
| **Min SDK** | 21 (Android 5.0 Lollipop) |
| **Target SDK** | 33 (Android 13) |
| **Compile SDK** | 33 |

## 🔧 Key Files Explanation

### MainActivity.java
```java
// WebView wrapper dengan features:
// - JavaScript enabled
// - LocalStorage enabled
// - Database enabled
// - Back button navigation
// - Full-screen WebView
```

### AndroidManifest.xml
```xml
<!-- Permissions yang digunakan:
- INTERNET
- ACCESS_NETWORK_STATE
- WRITE_EXTERNAL_STORAGE
- READ_EXTERNAL_STORAGE
-->
```

### activity_main.xml
```xml
<!-- Simple layout dengan WebView penuh -->
```

### build.gradle (app)
```gradle
// Configuration:
// - applicationId: com.arbonkas.app
// - minSdkVersion: 21
// - targetSdkVersion: 33
// - versionCode: 1
// - versionName: "1.0.0"
```

## 🎨 Customization Points

### 1. Change App Name
**File**: `app/src/main/res/values/strings.xml`
```xml
<string name="app_name">Your App Name</string>
```

### 2. Change Package Name
**File**: `app/build.gradle`
```gradle
applicationId "com.yourcompany.yourapp"
```

### 3. Change Theme Colors
**File**: `app/src/main/res/values/styles.xml`
```xml
<item name="android:colorPrimary">#YourColor</item>
```

### 4. Modify Web Content
**Location**: `app/src/main/assets/`
- Edit `index.html`
- Edit `css/styles.css`
- Edit `js/app.js`

### 5. Update Version
**File**: `app/build.gradle`
```gradle
versionCode 2           // Increment for each release
versionName "1.1.0"     // Semantic versioning
```

## 🔒 Security Checklist

- [ ] Enable ProGuard for release builds
- [ ] Remove debug logs for production
- [ ] Use signed APK for distribution
- [ ] Request only necessary permissions
- [ ] Validate all user inputs
- [ ] Encrypt sensitive data
- [ ] Use HTTPS for external resources
- [ ] Implement proper error handling

## 📊 Build Sizes

| Build Type | APK Size (Approx) |
|------------|-------------------|
| **Debug** | ~2-3 MB |
| **Release** | ~1-2 MB |
| **Release + ProGuard** | ~800 KB - 1.5 MB |

## 🐛 Common Issues & Solutions

### Issue: "SDK not found"
```bash
export ANDROID_HOME=/path/to/Android/Sdk
```

### Issue: "Gradle sync failed"
```bash
./gradlew clean
# Or invalidate caches in Android Studio
```

### Issue: "WebView blank screen"
- Check INTERNET permission
- Verify assets are in correct folder
- Check WebView settings in MainActivity

### Issue: "App crashes on start"
- Check logs: `adb logcat`
- Verify AndroidManifest is valid
- Check minimum SDK version

## 📚 Resources

### Dalam Package
- `README.md` - Full documentation
- `INSTALL.md` - Installation guide
- `MainActivity.java` - Source code with comments

### External
- [Android Developer Docs](https://developer.android.com)
- [WebView Guide](https://developer.android.com/reference/android/webkit/WebView)
- [Gradle Documentation](https://docs.gradle.org)

## 🎯 Next Steps

### Untuk Developer
1. ✅ Extract ZIP
2. ✅ Open in Android Studio
3. ✅ Sync Gradle
4. ✅ Build APK
5. ✅ Test on device/emulator
6. ✅ Customize as needed
7. ✅ Release to users

### Untuk User
1. ✅ Get APK file (from developer)
2. ✅ Enable "Unknown Sources"
3. ✅ Install APK
4. ✅ Grant permissions
5. ✅ Start using app

## 💡 Pro Tips

1. **Test on Multiple Devices**: Test on different Android versions
2. **Use Emulator**: Test without physical device
3. **Enable Logs**: Use `adb logcat` for debugging
4. **Version Control**: Keep track of version changes
5. **Backup Keystore**: Never lose your signing key
6. **Update WebView**: Keep Android System WebView updated
7. **Monitor Performance**: Check memory & battery usage
8. **User Feedback**: Listen to user reports

## 📞 Support

**Issues?** Check:
1. `README.md` in package
2. `INSTALL.md` for installation help
3. GitHub repository issues
4. Android developer documentation

**Contact:**
- Website: https://www.arboncarbonmodifikasi.com
- Repository: https://github.com/Hendra829/app-keuangan

---

**Last Updated**: February 5, 2026  
**Package Version**: 1.0.0  
**ArBonKas** - © 2026 ArBon Carbon Modifikasi
