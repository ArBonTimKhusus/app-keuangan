# ArBonKas - Android Application Package

![ArBonKas](https://img.shields.io/badge/Platform-Android-green.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Min SDK](https://img.shields.io/badge/Min%20SDK-21-orange.svg)

## 📱 Tentang Aplikasi

**ArBonKas Android** adalah versi aplikasi mobile dari ArBonKas Web, dikemas dalam aplikasi Android native menggunakan WebView. Aplikasi ini memungkinkan pengguna untuk mengelola keuangan mereka langsung dari smartphone Android.

### Fitur Utama
- ✅ Dashboard keuangan real-time
- ✅ Manajemen transaksi (pemasukan & pengeluaran)
- ✅ Multi dompet/akun
- ✅ Laporan keuangan dengan berbagai periode
- ✅ Tracking hutang & piutang
- ✅ Offline-first (data tersimpan lokal)
- ✅ Responsive design untuk berbagai ukuran layar

## 🏗️ Struktur Proyek

```
android-package/
├── app/
│   ├── build.gradle                  # Konfigurasi build aplikasi
│   ├── proguard-rules.pro           # Aturan ProGuard
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml  # Manifest aplikasi
│           ├── java/
│           │   └── com/arbonkas/app/
│           │       └── MainActivity.java  # Activity utama
│           ├── res/
│           │   ├── layout/
│           │   │   └── activity_main.xml  # Layout activity
│           │   └── values/
│           │       ├── strings.xml        # String resources
│           │       └── styles.xml         # Style resources
│           └── assets/
│               ├── index.html        # Web app HTML
│               ├── css/              # Stylesheet
│               └── js/               # JavaScript
├── build.gradle                     # Build script root
├── gradle.properties               # Gradle properties
└── settings.gradle                 # Gradle settings
```

## 📋 Persyaratan

### Untuk Build Aplikasi
- Android Studio Arctic Fox (2020.3.1) atau lebih baru
- JDK 8 atau lebih tinggi
- Android SDK API Level 33
- Gradle 7.4.2 atau lebih baru

### Untuk Menjalankan Aplikasi
- Android device/emulator dengan API Level 21 (Android 5.0) atau lebih tinggi
- Minimal 50 MB ruang penyimpanan

## 🚀 Cara Build Aplikasi

### Menggunakan Android Studio

1. **Buka Proyek**
   ```
   - Ekstrak file ZIP
   - Buka Android Studio
   - File > Open > Pilih folder "android-package"
   - Wait for Gradle sync
   ```

2. **Build APK**
   ```
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK akan tersimpan di: app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Build Release APK (Signed)**
   ```
   - Build > Generate Signed Bundle / APK
   - Pilih APK
   - Create new keystore atau gunakan existing
   - Finish
   ```

### Menggunakan Command Line

1. **Build Debug APK**
   ```bash
   cd android-package
   ./gradlew assembleDebug
   ```

2. **Build Release APK**
   ```bash
   cd android-package
   ./gradlew assembleRelease
   ```

3. **Install ke Device**
   ```bash
   ./gradlew installDebug
   ```

## 📦 Instalasi APK

### Di Device Android

1. **Enable Unknown Sources**
   - Buka Settings > Security
   - Enable "Install from Unknown Sources" atau "Install Unknown Apps"

2. **Install APK**
   - Transfer file APK ke device
   - Buka file APK menggunakan File Manager
   - Tap Install
   - Tap Open setelah instalasi selesai

3. **Grant Permissions**
   - Aplikasi mungkin meminta permission untuk storage
   - Klik Allow untuk fitur optimal

## 🔧 Konfigurasi

### Mengubah Package Name
Edit file `app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.yourcompany.yourapp"  // Ubah ini
    ...
}
```

### Mengubah App Name
Edit file `app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Your App Name</string>
```

### Mengubah Icon
Ganti icon di folder:
- `app/src/main/res/mipmap-hdpi/`
- `app/src/main/res/mipmap-mdpi/`
- `app/src/main/res/mipmap-xhdpi/`
- `app/src/main/res/mipmap-xxhdpi/`
- `app/src/main/res/mipmap-xxxhdpi/`

### Mengubah Web Content
Edit files di `app/src/main/assets/`:
- `index.html` - Main HTML
- `css/styles.css` - Stylesheet
- `js/app.js` - JavaScript logic

## 🎨 Kustomisasi

### Mengubah Theme Color
Edit `app/src/main/res/values/styles.xml`:
```xml
<item name="android:colorPrimary">#YourColor</item>
<item name="android:colorPrimaryDark">#YourDarkColor</item>
<item name="android:colorAccent">#YourAccentColor</item>
```

### Menambahkan Splash Screen
1. Buat layout splash screen
2. Buat SplashActivity
3. Ubah launcher activity di AndroidManifest.xml

### Menambahkan Firebase
1. Tambahkan dependency di `app/build.gradle`
2. Download `google-services.json`
3. Letakkan di folder `app/`

## 🔒 Permissions

Aplikasi meminta permissions berikut:

- **INTERNET** - Untuk akses ke URL eksternal (jika diperlukan)
- **ACCESS_NETWORK_STATE** - Untuk cek koneksi internet
- **WRITE_EXTERNAL_STORAGE** - Untuk menyimpan data (API < 29)
- **READ_EXTERNAL_STORAGE** - Untuk membaca data (API < 29)

## 📊 Teknologi

- **Platform**: Android
- **Language**: Java
- **UI**: WebView
- **Web Framework**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: WebView LocalStorage
- **Min SDK**: API 21 (Android 5.0 Lollipop)
- **Target SDK**: API 33 (Android 13)

## 🐛 Troubleshooting

### Build Errors

**Error: SDK not found**
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=/path/to/Android/Sdk
```

**Error: Gradle sync failed**
```bash
# Clear Gradle cache
./gradlew clean
# Or in Android Studio: File > Invalidate Caches / Restart
```

### Runtime Issues

**WebView tidak load**
- Check AndroidManifest.xml has INTERNET permission
- Check WebView settings in MainActivity.java

**localStorage tidak bekerja**
- Ensure `setDomStorageEnabled(true)` in WebView settings
- Check `setDatabaseEnabled(true)` is set

**Back button tidak bekerja**
- Check `onKeyDown()` method in MainActivity.java

## 📱 Testing

### Emulator
```bash
# Create AVD
avdmanager create avd -n test -k "system-images;android-33;google_apis;x86_64"

# Run emulator
emulator -avd test

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Real Device
```bash
# Enable USB debugging on device
# Connect device via USB

# Check device
adb devices

# Install
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📚 Resources

- [Android Developer Guide](https://developer.android.com/)
- [WebView Documentation](https://developer.android.com/reference/android/webkit/WebView)
- [Gradle Build Tool](https://gradle.org/)

## 🔄 Update Aplikasi

Untuk update web content tanpa rebuild APK:
1. Ubah files di `app/src/main/assets/`
2. Rebuild APK
3. Redistribute APK baru

Untuk update versi:
1. Ubah `versionCode` dan `versionName` di `app/build.gradle`
2. Rebuild APK

## 📄 Lisensi

© 2026 ArBonKas - [ArBon Carbon Modifikasi](https://www.arboncarbonmodifikasi.com)

## 📞 Support

Untuk pertanyaan atau masalah, hubungi:
- Website: https://www.arboncarbonmodifikasi.com
- Repository: https://github.com/Hendra829/app-keuangan

---

**ArBonKas Android** - Aplikasi Laporan Keuangan untuk Android
