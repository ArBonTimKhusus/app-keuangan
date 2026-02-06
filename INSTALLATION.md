# Panduan Instalasi

## Cara Menggunakan Aplikasi

### Opsi 1: Langsung Buka (Untuk Development)
1. Clone repository ini
2. Buka file `index.html` langsung di browser
3. Aplikasi akan berjalan dengan koneksi internet (untuk library CDN)

### Opsi 2: Menggunakan Web Server Lokal
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# PHP
php -S localhost:8080

# Node.js (jika ada npx)
npx http-server
```

Lalu buka `http://localhost:8080` di browser.

## Library yang Digunakan

Aplikasi ini menggunakan library eksternal dari CDN:
- **jsPDF** - Export ke PDF
- **jsPDF AutoTable** - Tabel di PDF
- **SheetJS (xlsx)** - Export ke Excel
- **docx.js** - Export ke Word
- **PptxGenJS** - Export ke PowerPoint

## Catatan Penting

- Data disimpan di localStorage browser
- Pastikan JavaScript diaktifkan di browser
- Untuk fitur export, diperlukan koneksi internet untuk mengunduh library dari CDN
- Untuk production, disarankan download library dan host secara lokal

## Browser yang Didukung

- Google Chrome (Recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Troubleshooting

### Export tidak berfungsi
- Pastikan ada koneksi internet
- Periksa console browser untuk error
- Coba refresh halaman

### Data hilang
- Data tersimpan di localStorage browser
- Jangan clear browser data jika ingin mempertahankan data
- Untuk backup, gunakan fitur export
