# 📱 Panduan Instalasi ArBonKas Android

## Cara 1: Build dari Source Code (Untuk Developer)

### Persyaratan
- Android Studio (versi terbaru)
- JDK 8 atau lebih tinggi
- Android SDK

### Langkah-langkah

1. **Ekstrak file ZIP**
   ```bash
   unzip arbonkas-android.zip
   cd android-package
   ```

2. **Buka di Android Studio**
   - Jalankan Android Studio
   - Pilih "Open an Existing Project"
   - Navigasi ke folder `android-package`
   - Klik "OK"
   - Tunggu Gradle sync selesai

3. **Build APK Debug**
   - Klik Menu: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Atau gunakan command line:
     ```bash
     ./gradlew assembleDebug
     ```
   - APK akan tersimpan di: `app/build/outputs/apk/debug/app-debug.apk`

4. **Install ke Device Android**
   
   **Opsi A: Via USB**
   - Enable USB Debugging di device Android
   - Hubungkan device ke komputer
   - Di Android Studio, klik Run (tombol play hijau)
   
   **Opsi B: Manual Install**
   - Transfer file `app-debug.apk` ke device Android
   - Buka file menggunakan File Manager
   - Tap untuk install

## Cara 2: Install APK Langsung (Untuk End User)

Jika sudah ada file APK yang telah di-build:

### Di Device Android

1. **Enable Install from Unknown Sources**
   
   **Android 8.0+:**
   - Settings > Apps & notifications > Special app access > Install unknown apps
   - Pilih browser/file manager yang akan digunakan untuk install
   - Enable "Allow from this source"
   
   **Android 7.0 dan sebelumnya:**
   - Settings > Security
   - Enable "Unknown sources"

2. **Download atau Transfer APK**
   - Download APK dari sumber terpercaya
   - Atau transfer dari komputer ke device

3. **Install APK**
   - Buka File Manager di Android
   - Navigasi ke folder Downloads (atau lokasi APK)
   - Tap file `arbonkas-app.apk` atau `app-debug.apk`
   - Tap "Install"
   - Tunggu proses instalasi selesai
   - Tap "Open" untuk membuka aplikasi

4. **Grant Permissions** (jika diminta)
   - Aplikasi mungkin meminta permission untuk:
     - Storage access
     - Internet access
   - Tap "Allow" untuk semua permissions

## Cara 3: Install via ADB (Android Debug Bridge)

Untuk developer atau advanced user:

### Persyaratan
- ADB terinstall di komputer
- USB Debugging enabled di device Android

### Langkah-langkah

1. **Connect Device**
   ```bash
   # Check device terhubung
   adb devices
   ```

2. **Install APK**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```
   
   Atau jika sudah ada APK:
   ```bash
   adb install /path/to/arbonkas-app.apk
   ```

3. **Launch App**
   ```bash
   adb shell am start -n com.arbonkas.app/.MainActivity
   ```

## Verifikasi Instalasi

Setelah instalasi berhasil:

1. **Cek App Launcher**
   - Buka App Drawer
   - Cari icon "ArBonKas"
   - Tap untuk membuka

2. **Test Fitur**
   - Dashboard harus tampil
   - Coba tambah transaksi
   - Data tersimpan lokal (tidak perlu internet)

## Troubleshooting

### "App not installed"
- **Penyebab**: Signature conflict dengan versi sebelumnya
- **Solusi**: Uninstall versi lama terlebih dahulu

### "Installation blocked"
- **Penyebab**: Unknown sources tidak di-enable
- **Solusi**: Enable di Settings > Security

### "App keeps closing"
- **Penyebab**: Incompatible Android version
- **Solusi**: Pastikan Android minimal versi 5.0 (API 21)

### WebView tidak load
- **Penyebab**: WebView outdated atau disabled
- **Solusi**: 
  - Update Android System WebView dari Play Store
  - Enable WebView di Settings > Apps

### Data tidak tersimpan
- **Penyebab**: Storage permission tidak di-grant
- **Solusi**: Settings > Apps > ArBonKas > Permissions > Enable Storage

## Update Aplikasi

### Via APK Baru
1. Download/build APK versi terbaru
2. Install seperti biasa
3. Data lama akan tetap tersimpan (jika package name sama)

### Via Android Studio
1. Build APK baru dengan versionCode lebih tinggi
2. Install APK baru
3. App akan ter-update otomatis

## Uninstall

### Via Settings
1. Settings > Apps > ArBonKas
2. Tap "Uninstall"
3. Konfirmasi

### Via ADB
```bash
adb uninstall com.arbonkas.app
```

**⚠️ PERHATIAN**: Uninstall akan menghapus semua data aplikasi!

## Tips Keamanan

1. ✅ Hanya install APK dari sumber terpercaya
2. ✅ Periksa permissions yang diminta aplikasi
3. ✅ Backup data secara berkala
4. ✅ Disable "Unknown sources" setelah instalasi
5. ✅ Update aplikasi secara teratur

## Support

Jika mengalami masalah:
- Baca dokumentasi di README.md
- Check GitHub issues
- Hubungi: https://www.arboncarbonmodifikasi.com

---

**ArBonKas Android** - © 2026 ArBon Carbon Modifikasi
