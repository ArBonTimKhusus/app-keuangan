// ========================================
// CONFIGURATION CONSTANTS
// ========================================
const CONFIG = {
    MAX_RECORDS_DISPLAY: 1000,
    DEBOUNCE_DELAY: 500,
    AUTO_BACKUP_INTERVAL: 300000, // 5 minutes
    TOAST_DURATION: 3000,
    MAX_CATEGORY_LENGTH: 50,
    MAX_AMOUNT: 999999999999,
    BACKUP_KEY: 'arbonkas_backup'
};

// ========================================
// STATE MANAGEMENT
// ========================================
let appState = {
    categories: [],
    records: [],
    formatters: {
        currency: null,
        date: null
    }
};

let schedulers = {
    save: null,
    toast: null
};

// ========================================
// INITIALIZATION
// ========================================
window.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    try {
        setupFormatters();
        loadStorageData();
        renderUI();
        setupEventListeners();
        startAutoBackup();
        showToast('Aplikasi siap digunakan', 'info');
    } catch (err) {
        console.error('Initialization error:', err);
        showToast('Terjadi kesalahan saat memuat aplikasi', 'error');
    }
}

function setupFormatters() {
    appState.formatters.currency = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    });
    
    appState.formatters.date = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function renderUI() {
    renderCategories();
    updateCategoryDropdown();
    renderRecords();
    updateSummary();
    
    const dateInput = safeGetElement('recordDate');
    if (dateInput) dateInput.valueAsDate = new Date();
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function startAutoBackup() {
    setInterval(() => {
        createBackup();
    }, CONFIG.AUTO_BACKUP_INTERVAL);
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        createBackup();
    }
}

// ========================================
// STORAGE OPERATIONS
// ========================================
function loadStorageData() {
    try {
        const savedCategories = localStorage.getItem('categories');
        const savedRecords = localStorage.getItem('records');
        
        if (savedCategories) {
            appState.categories = JSON.parse(savedCategories);
        } else {
            appState.categories = ['Gaji', 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Lainnya'];
            saveStorageData();
        }
        
        if (savedRecords) {
            appState.records = JSON.parse(savedRecords);
        }
    } catch (err) {
        console.error('Load error:', err);
        showToast('Gagal memuat data', 'error');
    }
}

function saveStorageData() {
    if (schedulers.save) clearTimeout(schedulers.save);
    
    schedulers.save = setTimeout(() => {
        try {
            localStorage.setItem('categories', JSON.stringify(appState.categories));
            localStorage.setItem('records', JSON.stringify(appState.records));
        } catch (err) {
            if (err.name === 'QuotaExceededError') {
                showToast('Penyimpanan penuh! Hapus catatan lama.', 'error');
            } else {
                showToast('Gagal menyimpan data', 'error');
            }
        }
    }, CONFIG.DEBOUNCE_DELAY);
}

function createBackup() {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            categories: appState.categories,
            records: appState.records
        };
        localStorage.setItem(CONFIG.BACKUP_KEY, JSON.stringify(backup));
        showToast('Backup berhasil dibuat', 'success');
        return true;
    } catch (err) {
        showToast('Gagal membuat backup', 'error');
        return false;
    }
}

function restoreBackup() {
    try {
        const backupData = localStorage.getItem(CONFIG.BACKUP_KEY);
        if (!backupData) {
            showToast('Tidak ada backup tersedia', 'info');
            return false;
        }
        
        const backup = JSON.parse(backupData);
        appState.categories = backup.categories;
        appState.records = backup.records;
        saveStorageData();
        renderUI();
        showToast('Backup berhasil dipulihkan', 'success');
        return true;
    } catch (err) {
        showToast('Gagal memulihkan backup', 'error');
        return false;
    }
}

// Expose globally for console access
window.StorageManager = {
    createBackup: createBackup,
    restoreBackup: restoreBackup
};

// ========================================
// CATEGORY MANAGEMENT
// ========================================
function addCategory() {
    const input = safeGetElement('categoryInput');
    if (!input) return;
    
    const name = sanitizeInput(input.value.trim());
    
    if (!validateCategoryName(name)) {
        return;
    }
    
    appState.categories.push(name);
    saveStorageData();
    renderCategories();
    updateCategoryDropdown();
    input.value = '';
    showToast('Kategori berhasil ditambahkan', 'success');
}

function deleteCategory(name) {
    if (isCategoryInUse(name)) {
        showToast('Kategori masih digunakan pada catatan!', 'error');
        return;
    }
    
    if (confirm(`Hapus kategori "${name}"?`)) {
        appState.categories = appState.categories.filter(cat => cat !== name);
        saveStorageData();
        renderCategories();
        updateCategoryDropdown();
        showToast('Kategori berhasil dihapus', 'success');
    }
}

function validateCategoryName(name) {
    if (!name) {
        showToast('Nama kategori tidak boleh kosong!', 'error');
        return false;
    }
    
    if (name.length > CONFIG.MAX_CATEGORY_LENGTH) {
        showToast(`Nama kategori maksimal ${CONFIG.MAX_CATEGORY_LENGTH} karakter!`, 'error');
        return false;
    }
    
    if (appState.categories.includes(name)) {
        showToast('Kategori sudah ada!', 'error');
        return false;
    }
    
    return true;
}

function isCategoryInUse(categoryName) {
    return appState.records.some(rec => rec.category === categoryName);
}

// ========================================
// RECORD MANAGEMENT
// ========================================
function addRecord() {
    const dateInput = safeGetElement('recordDate');
    const typeInput = safeGetElement('recordType');
    const categoryInput = safeGetElement('recordCategory');
    const amountInput = safeGetElement('recordAmount');
    const descInput = safeGetElement('recordDescription');
    
    if (!dateInput || !typeInput || !categoryInput || !amountInput || !descInput) {
        showToast('Form tidak lengkap', 'error');
        return;
    }
    
    const date = dateInput.value;
    const type = typeInput.value;
    const category = categoryInput.value;
    const amount = parseFloat(amountInput.value);
    const description = descInput.value.trim();
    
    if (!validateRecord(date, category, amount)) {
        return;
    }
    
    const record = {
        id: generateUniqueId(),
        date,
        type,
        category,
        amount,
        description: sanitizeInput(description)
    };
    
    appState.records.unshift(record);
    saveStorageData();
    renderRecords();
    updateSummary();
    clearRecordForm();
    showToast('Catatan berhasil ditambahkan', 'success');
}

function deleteRecord(id) {
    if (confirm('Hapus catatan ini?')) {
        appState.records = appState.records.filter(rec => rec.id !== id);
        saveStorageData();
        renderRecords();
        updateSummary();
        showToast('Catatan berhasil dihapus', 'success');
    }
}

function validateRecord(date, category, amount) {
    if (!date || !category) {
        showToast('Mohon lengkapi tanggal dan kategori!', 'error');
        return false;
    }
    
    if (!amount || amount <= 0) {
        showToast('Jumlah harus lebih dari 0!', 'error');
        return false;
    }
    
    if (amount > CONFIG.MAX_AMOUNT) {
        showToast('Jumlah terlalu besar!', 'error');
        return false;
    }
    
    return true;
}

function clearRecordForm() {
    const amountInput = safeGetElement('recordAmount');
    const descInput = safeGetElement('recordDescription');
    const categoryInput = safeGetElement('recordCategory');
    
    if (amountInput) amountInput.value = '';
    if (descInput) descInput.value = '';
    if (categoryInput) categoryInput.value = '';
}

// ========================================
// UI RENDERING
// ========================================
function renderCategories() {
    const list = safeGetElement('categoryList');
    if (!list) return;
    
    const fragment = document.createDocumentFragment();
    
    appState.categories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        
        const span = document.createElement('span');
        span.textContent = category;
        
        const btn = document.createElement('button');
        btn.className = 'delete-btn';
        btn.textContent = '×';
        btn.onclick = () => deleteCategory(category);
        
        tag.appendChild(span);
        tag.appendChild(btn);
        fragment.appendChild(tag);
    });
    
    list.innerHTML = '';
    list.appendChild(fragment);
}

function updateCategoryDropdown() {
    const select = safeGetElement('recordCategory');
    if (!select) return;
    
    const fragment = document.createDocumentFragment();
    
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Pilih Kategori';
    fragment.appendChild(defaultOpt);
    
    appState.categories.forEach(category => {
        const opt = document.createElement('option');
        opt.value = category;
        opt.textContent = category;
        fragment.appendChild(opt);
    });
    
    select.innerHTML = '';
    select.appendChild(fragment);
}

function renderRecords() {
    const tbody = safeGetElement('recordsBody');
    if (!tbody) return;
    
    if (appState.records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Belum ada catatan keuangan</td></tr>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    const limit = Math.min(appState.records.length, CONFIG.MAX_RECORDS_DISPLAY);
    
    for (let i = 0; i < limit; i++) {
        const record = appState.records[i];
        const row = createRecordRow(record);
        fragment.appendChild(row);
    }
    
    tbody.innerHTML = '';
    tbody.appendChild(fragment);
    
    if (appState.records.length > CONFIG.MAX_RECORDS_DISPLAY) {
        const infoRow = createLimitInfoRow();
        tbody.appendChild(infoRow);
    }
}

function createRecordRow(record) {
    const tr = document.createElement('tr');
    
    const tdDate = document.createElement('td');
    tdDate.textContent = formatDate(record.date);
    
    const tdCategory = document.createElement('td');
    tdCategory.textContent = record.category;
    
    const tdType = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `type-badge ${record.type}`;
    badge.textContent = record.type;
    tdType.appendChild(badge);
    
    const tdDesc = document.createElement('td');
    tdDesc.textContent = record.description || '-';
    
    const tdAmount = document.createElement('td');
    tdAmount.textContent = formatCurrency(record.amount);
    
    const tdAction = document.createElement('td');
    const btn = document.createElement('button');
    btn.className = 'delete-record-btn';
    btn.textContent = 'Hapus';
    btn.onclick = () => deleteRecord(record.id);
    tdAction.appendChild(btn);
    
    tr.appendChild(tdDate);
    tr.appendChild(tdCategory);
    tr.appendChild(tdType);
    tr.appendChild(tdDesc);
    tr.appendChild(tdAmount);
    tr.appendChild(tdAction);
    
    return tr;
}

function createLimitInfoRow() {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.style.cssText = 'text-align:center;padding:20px;font-style:italic;color:#666;';
    cell.textContent = `Menampilkan ${CONFIG.MAX_RECORDS_DISPLAY} dari ${appState.records.length} catatan`;
    row.appendChild(cell);
    return row;
}

function updateSummary() {
    const totals = calculateTotals();
    
    const pemasukanEl = safeGetElement('totalPemasukan');
    const pengeluaranEl = safeGetElement('totalPengeluaran');
    const saldoEl = safeGetElement('saldo');
    
    if (pemasukanEl) pemasukanEl.textContent = formatCurrency(totals.pemasukan);
    if (pengeluaranEl) pengeluaranEl.textContent = formatCurrency(totals.pengeluaran);
    if (saldoEl) {
        saldoEl.textContent = formatCurrency(totals.saldo);
        saldoEl.style.color = totals.saldo >= 0 ? '#27ae60' : '#e74c3c';
    }
}

function calculateTotals() {
    let pemasukan = 0;
    let pengeluaran = 0;
    
    appState.records.forEach(rec => {
        if (rec.type === 'pemasukan') {
            pemasukan += rec.amount;
        } else {
            pengeluaran += rec.amount;
        }
    });
    
    return {
        pemasukan,
        pengeluaran,
        saldo: pemasukan - pengeluaran
    };
}

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================
function showToast(message, type = 'info') {
    const toast = getOrCreateToastContainer();
    toast.textContent = message;
    toast.className = `app-toast app-toast-${type}`;
    
    setTimeout(() => toast.classList.add('visible'), 10);
    
    if (schedulers.toast) clearTimeout(schedulers.toast);
    schedulers.toast = setTimeout(() => {
        toast.classList.remove('visible');
    }, CONFIG.TOAST_DURATION);
}

function getOrCreateToastContainer() {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    return toast;
}

// ========================================
// LOADING OVERLAY
// ========================================
function showLoader(message = 'Memproses...') {
    let loader = document.getElementById('appLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'appLoader';
        loader.className = 'app-loader';
        loader.innerHTML = `
            <div class="spinner-ring"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('appLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateUniqueId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${timestamp}-${random}`;
}

function formatCurrency(amount) {
    if (!appState.formatters.currency) {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }
    return appState.formatters.currency.format(amount);
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    if (!appState.formatters.date) {
        return date.toLocaleDateString('id-ID');
    }
    return appState.formatters.date.format(date);
}

function safeGetElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Element with id "${id}" not found`);
    }
    return el;
}

// ========================================
// EXPORT FUNCTIONS
// ========================================
function exportToPDF() {
    showLoader('Mengekspor ke PDF...');
    
    try {
        if (typeof window.jspdf === 'undefined') {
            hideLoader();
            showToast('Library PDF tidak tersedia, menggunakan CSV', 'error');
            exportToCSV();
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const totals = calculateTotals();
        
        doc.setFontSize(18);
        doc.text('Laporan Keuangan', 14, 20);
        
        doc.setFontSize(12);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
        doc.text(`Total Pemasukan: ${formatCurrency(totals.pemasukan)}`, 14, 40);
        doc.text(`Total Pengeluaran: ${formatCurrency(totals.pengeluaran)}`, 14, 50);
        doc.text(`Saldo: ${formatCurrency(totals.saldo)}`, 14, 60);
        
        const tableData = appState.records.map(rec => [
            formatDate(rec.date),
            rec.category,
            rec.type,
            rec.description || '-',
            formatCurrency(rec.amount)
        ]);
        
        doc.autoTable({
            head: [['Tanggal', 'Kategori', 'Tipe', 'Deskripsi', 'Jumlah']],
            body: tableData,
            startY: 70,
            styles: { fontSize: 10 }
        });
        
        doc.save('laporan-keuangan.pdf');
        hideLoader();
        showToast('PDF berhasil diekspor', 'success');
    } catch (err) {
        hideLoader();
        showToast('Gagal mengekspor PDF, menggunakan CSV', 'error');
        exportToCSV();
    }
}

function exportToExcel() {
    showLoader('Mengekspor ke Excel...');
    
    try {
        if (typeof XLSX === 'undefined') {
            hideLoader();
            showToast('Library Excel tidak tersedia, menggunakan CSV', 'error');
            exportToCSV();
            return;
        }
        
        const totals = calculateTotals();
        const data = appState.records.map(rec => ({
            'Tanggal': rec.date,
            'Kategori': rec.category,
            'Tipe': rec.type,
            'Deskripsi': rec.description || '-',
            'Jumlah': rec.amount
        }));
        
        data.push({});
        data.push({ 'Tanggal': 'RINGKASAN' });
        data.push({ 'Tanggal': 'Total Pemasukan', 'Jumlah': totals.pemasukan });
        data.push({ 'Tanggal': 'Total Pengeluaran', 'Jumlah': totals.pengeluaran });
        data.push({ 'Tanggal': 'Saldo', 'Jumlah': totals.saldo });
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
        XLSX.writeFile(wb, 'laporan-keuangan.xlsx');
        
        hideLoader();
        showToast('Excel berhasil diekspor', 'success');
    } catch (err) {
        hideLoader();
        showToast('Gagal mengekspor Excel, menggunakan CSV', 'error');
        exportToCSV();
    }
}

function exportToWord() {
    showLoader('Mengekspor ke Word...');
    
    try {
        if (typeof docx === 'undefined') {
            hideLoader();
            showToast('Library Word tidak tersedia, menggunakan CSV', 'error');
            exportToCSV();
            return;
        }
        
        const { Document, Paragraph, TextRun, Table, TableCell, TableRow, WidthType } = docx;
        const totals = calculateTotals();
        
        const tableRows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tanggal', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kategori', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tipe', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jumlah', bold: true })] })] }),
                ],
            }),
        ];
        
        appState.records.forEach(rec => {
            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(formatDate(rec.date))] }),
                        new TableCell({ children: [new Paragraph(rec.category)] }),
                        new TableCell({ children: [new Paragraph(rec.type)] }),
                        new TableCell({ children: [new Paragraph(rec.description || '-')] }),
                        new TableCell({ children: [new Paragraph(formatCurrency(rec.amount))] }),
                    ],
                })
            );
        });
        
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: 'Laporan Keuangan', bold: true, size: 32 })],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Tanggal: ${new Date().toLocaleDateString('id-ID')}` })],
                    }),
                    new Paragraph(''),
                    new Paragraph({
                        children: [new TextRun({ text: `Total Pemasukan: ${formatCurrency(totals.pemasukan)}` })],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Total Pengeluaran: ${formatCurrency(totals.pengeluaran)}` })],
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: `Saldo: ${formatCurrency(totals.saldo)}`, bold: true })],
                    }),
                    new Paragraph(''),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: tableRows,
                    }),
                ],
            }],
        });
        
        docx.Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'laporan-keuangan.docx';
            a.click();
            window.URL.revokeObjectURL(url);
            hideLoader();
            showToast('Word berhasil diekspor', 'success');
        });
    } catch (err) {
        hideLoader();
        showToast('Gagal mengekspor Word, menggunakan CSV', 'error');
        exportToCSV();
    }
}

function exportToPPT() {
    showLoader('Mengekspor ke PowerPoint...');
    
    try {
        if (typeof PptxGenJS === 'undefined') {
            hideLoader();
            showToast('Library PowerPoint tidak tersedia, menggunakan CSV', 'error');
            exportToCSV();
            return;
        }
        
        const pptx = new PptxGenJS();
        const totals = calculateTotals();
        
        const slide1 = pptx.addSlide();
        slide1.background = { color: '667eea' };
        slide1.addText('Laporan Keuangan', {
            x: 1, y: 1.5, w: 8, h: 1,
            fontSize: 44, bold: true, color: 'FFFFFF', align: 'center'
        });
        slide1.addText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, {
            x: 1, y: 3, w: 8, h: 0.5,
            fontSize: 18, color: 'FFFFFF', align: 'center'
        });
        
        const slide2 = pptx.addSlide();
        slide2.addText('Ringkasan', {
            x: 0.5, y: 0.5, w: 9, h: 0.75,
            fontSize: 32, bold: true, color: '667eea'
        });
        slide2.addText(`Total Pemasukan: ${formatCurrency(totals.pemasukan)}`, {
            x: 1, y: 2, w: 8, h: 0.5,
            fontSize: 24, color: '27ae60', bold: true
        });
        slide2.addText(`Total Pengeluaran: ${formatCurrency(totals.pengeluaran)}`, {
            x: 1, y: 2.8, w: 8, h: 0.5,
            fontSize: 24, color: 'e74c3c', bold: true
        });
        slide2.addText(`Saldo: ${formatCurrency(totals.saldo)}`, {
            x: 1, y: 3.6, w: 8, h: 0.5,
            fontSize: 28, color: '2980b9', bold: true
        });
        
        const slide3 = pptx.addSlide();
        slide3.addText('Detail Catatan Keuangan', {
            x: 0.5, y: 0.5, w: 9, h: 0.5,
            fontSize: 24, bold: true, color: '667eea'
        });
        
        const tableData = [
            [
                { text: 'Tanggal', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                { text: 'Kategori', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                { text: 'Tipe', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                { text: 'Deskripsi', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                { text: 'Jumlah', options: { bold: true, color: 'FFFFFF', fill: '667eea' } }
            ]
        ];
        
        appState.records.slice(0, 10).forEach(rec => {
            tableData.push([
                formatDate(rec.date),
                rec.category,
                rec.type,
                rec.description || '-',
                formatCurrency(rec.amount)
            ]);
        });
        
        slide3.addTable(tableData, {
            x: 0.5, y: 1.2, w: 9,
            fontSize: 10, border: { pt: 1, color: 'CCCCCC' }
        });
        
        if (appState.records.length > 10) {
            slide3.addText(`* Menampilkan 10 dari ${appState.records.length} catatan`, {
                x: 0.5, y: 5.2, w: 9, h: 0.3,
                fontSize: 10, color: '999999', italic: true
            });
        }
        
        pptx.writeFile({ fileName: 'laporan-keuangan.pptx' });
        hideLoader();
        showToast('PowerPoint berhasil diekspor', 'success');
    } catch (err) {
        hideLoader();
        showToast('Gagal mengekspor PowerPoint, menggunakan CSV', 'error');
        exportToCSV();
    }
}

function exportToCSV() {
    showLoader('Mengekspor ke CSV...');
    
    try {
        const totals = calculateTotals();
        let csv = 'Tanggal,Kategori,Tipe,Deskripsi,Jumlah\n';
        
        appState.records.forEach(rec => {
            const row = [
                rec.date,
                rec.category,
                rec.type,
                rec.description || '-',
                rec.amount
            ];
            csv += row.map(field => `"${field}"`).join(',') + '\n';
        });
        
        csv += '\n';
        csv += 'RINGKASAN\n';
        csv += `Total Pemasukan,,,,${totals.pemasukan}\n`;
        csv += `Total Pengeluaran,,,,${totals.pengeluaran}\n`;
        csv += `Saldo,,,,${totals.saldo}\n`;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'laporan-keuangan.csv';
        link.click();
        window.URL.revokeObjectURL(url);
        
        hideLoader();
        showToast('CSV berhasil diekspor', 'success');
    } catch (err) {
        hideLoader();
        showToast('Gagal mengekspor CSV', 'error');
    }
}
