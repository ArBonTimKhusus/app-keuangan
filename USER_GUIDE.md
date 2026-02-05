# User Guide - Aplikasi Keuangan

## Panduan Lengkap Penggunaan

### 1. Memulai Aplikasi

1. Buka file `index.html` di browser web Anda
2. Aplikasi akan langsung siap digunakan
3. Data akan tersimpan otomatis di browser

### 2. Mengelola Kategori

#### Menambah Kategori Baru
1. Masukkan nama kategori di field "Nama kategori baru..."
2. Klik tombol "Tambah Kategori"
3. Kategori baru akan muncul di daftar kategori

#### Menghapus Kategori
1. Klik tombol "×" di samping kategori yang ingin dihapus
2. Konfirmasi penghapusan
3. Kategori akan dihapus dari sistem

**Kategori Default:**
- Gaji
- Makanan
- Transport
- Belanja
- Hiburan
- Lainnya

### 3. Mencatat Transaksi Keuangan

#### Menambah Catatan Pemasukan/Pengeluaran
1. **Pilih Tanggal**: Pilih tanggal transaksi (default: hari ini)
2. **Pilih Tipe**: Pilih "Pemasukan" atau "Pengeluaran"
3. **Pilih Kategori**: Pilih kategori dari dropdown
4. **Masukkan Jumlah**: Ketik jumlah uang (Rupiah)
5. **Tambah Deskripsi**: (Opsional) Tambahkan keterangan
6. Klik "Tambah Catatan"

#### Menghapus Catatan
1. Klik tombol "Hapus" di baris catatan yang ingin dihapus
2. Konfirmasi penghapusan

### 4. Melihat Ringkasan

Dashboard menampilkan 3 informasi penting:
- **Total Pemasukan**: Jumlah semua pemasukan (hijau)
- **Total Pengeluaran**: Jumlah semua pengeluaran (merah)
- **Saldo**: Selisih pemasukan dikurangi pengeluaran (biru)

### 5. Mengekspor Data

Aplikasi mendukung 5 format ekspor:

#### CSV (Recommended)
- ✅ Bekerja offline
- ✅ Tidak perlu koneksi internet
- ✅ Kompatibel dengan Excel, Google Sheets
- ✅ File kecil dan cepat

**Cara Menggunakan:**
1. Klik tombol "📊 CSV"
2. File `laporan-keuangan.csv` akan otomatis terunduh

#### PDF
- 📄 Format profesional untuk laporan
- Memerlukan koneksi internet
- Berisi tabel dan ringkasan

**Cara Menggunakan:**
1. Pastikan ada koneksi internet
2. Klik tombol "📄 PDF"
3. File `laporan-keuangan.pdf` akan otomatis terunduh

#### Excel
- 📊 File .xlsx untuk analisis di Microsoft Excel
- Memerlukan koneksi internet
- Berisi data detail dan ringkasan

**Cara Menggunakan:**
1. Pastikan ada koneksi internet
2. Klik tombol "📊 Excel"
3. File `laporan-keuangan.xlsx` akan otomatis terunduh

#### Word
- 📝 Dokumen .docx yang dapat diedit
- Memerlukan koneksi internet
- Format dokumen profesional

**Cara Menggunakan:**
1. Pastikan ada koneksi internet
2. Klik tombol "📝 Word"
3. File `laporan-keuangan.docx` akan otomatis terunduh

#### PowerPoint
- 📽️ Presentasi .pptx dengan slide ringkasan
- Memerlukan koneksi internet
- Cocok untuk presentasi laporan

**Cara Menggunakan:**
1. Pastikan ada koneksi internet
2. Klik tombol "📽️ PowerPoint"
3. File `laporan-keuangan.pptx` akan otomatis terunduh

### 6. Tips dan Trik

#### Backup Data
- Gunakan fitur ekspor CSV secara berkala untuk backup
- Simpan file CSV di tempat aman (cloud storage, USB, dll)

#### Restore Data
- Jangan hapus cache/data browser jika ingin data tetap tersimpan
- Untuk restore, input ulang data dari file CSV backup

#### Organisasi Kategori
- Buat kategori spesifik sesuai kebutuhan
- Contoh: "Tagihan Listrik", "Bensin", "Makan Siang"
- Gunakan nama kategori yang jelas dan mudah diingat

#### Deskripsi Detail
- Tambahkan deskripsi detail untuk setiap transaksi
- Contoh: "Bensin Pertamax 10 liter", "Makan di Resto X"
- Memudahkan pelacakan di kemudian hari

#### Penggunaan Multi-Device
- Data tersimpan per-browser
- Untuk sinkronisasi antar device, gunakan ekspor-import CSV

### 7. Troubleshooting

#### Export PDF/Excel/Word/PPT Tidak Berfungsi
**Penyebab:** Library eksternal tidak dapat dimuat (offline atau diblokir)
**Solusi:** 
- Periksa koneksi internet
- Gunakan export CSV sebagai alternatif
- Refresh halaman dan coba lagi

#### Data Hilang
**Penyebab:** Browser cache/data dihapus
**Solusi:**
- Restore dari file CSV backup
- Untuk mencegah: export CSV secara berkala

#### Kategori Tidak Muncul di Dropdown
**Penyebab:** Error saat menambah kategori
**Solusi:**
- Refresh halaman
- Tambahkan kategori lagi

#### Tanggal Salah
**Penyebab:** Timezone browser
**Solusi:** 
- Sudah diperbaiki di versi terbaru
- Pastikan timezone sistem sudah benar

### 8. Fitur Keamanan

✅ **Data Aman**
- Data tersimpan lokal di browser Anda
- Tidak dikirim ke server manapun
- Privasi terjaga 100%

✅ **Proteksi XSS**
- Input otomatis disanitasi
- Aman dari serangan injeksi

✅ **Integrity Check**
- Library eksternal terverifikasi dengan SRI
- Aman dari script berbahaya

### 9. Frequently Asked Questions (FAQ)

**Q: Apakah data saya aman?**
A: Ya, data tersimpan 100% di browser Anda sendiri, tidak ada yang dikirim ke server.

**Q: Bisakah digunakan offline?**
A: Ya untuk fitur utama. Export PDF/Excel/Word/PPT memerlukan internet, gunakan CSV untuk offline.

**Q: Apakah ada batasan jumlah catatan?**
A: Tergantung kapasitas localStorage browser (biasanya 5-10 MB, cukup untuk ribuan catatan).

**Q: Bisakah digunakan di HP?**
A: Ya, aplikasi responsive dan dapat digunakan di smartphone.

**Q: Bagaimana cara backup data?**
A: Export ke CSV secara berkala dan simpan file di tempat aman.

**Q: Apakah bisa multi-user?**
A: Tidak, aplikasi ini single-user per-browser.

### 10. Kontak dan Dukungan

Untuk pertanyaan, saran, atau laporan bug:
- Buka issue di GitHub repository
- Atau hubungi developer

---

**Selamat mengelola keuangan Anda! 💰📊**
