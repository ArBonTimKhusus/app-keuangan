// Data storage
let categories = [];
let records = [];

// Load data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCategories();
    updateCategoryDropdown();
    renderRecords();
    updateSummary();
    
    // Set today's date as default
    document.getElementById('recordDate').valueAsDate = new Date();
});

// Load data from localStorage
function loadData() {
    const savedCategories = localStorage.getItem('categories');
    const savedRecords = localStorage.getItem('records');
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        // Default categories
        categories = ['Gaji', 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Lainnya'];
        saveData();
    }
    
    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('records', JSON.stringify(records));
}

// Category Management
function addCategory() {
    const input = document.getElementById('categoryInput');
    const categoryName = input.value.trim();
    
    if (!categoryName) {
        alert('Nama kategori tidak boleh kosong!');
        return;
    }
    
    if (categories.includes(categoryName)) {
        alert('Kategori sudah ada!');
        return;
    }
    
    categories.push(categoryName);
    saveData();
    renderCategories();
    updateCategoryDropdown();
    input.value = '';
}

function deleteCategory(categoryName) {
    if (confirm(`Hapus kategori "${categoryName}"?`)) {
        categories = categories.filter(cat => cat !== categoryName);
        saveData();
        renderCategories();
        updateCategoryDropdown();
    }
}

function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.innerHTML = `
            <span>${category}</span>
            <button class="delete-btn" onclick="deleteCategory('${category}')">×</button>
        `;
        categoryList.appendChild(tag);
    });
}

function updateCategoryDropdown() {
    const select = document.getElementById('recordCategory');
    select.innerHTML = '<option value="">Pilih Kategori</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Record Management
function addRecord() {
    const date = document.getElementById('recordDate').value;
    const type = document.getElementById('recordType').value;
    const category = document.getElementById('recordCategory').value;
    const amount = parseFloat(document.getElementById('recordAmount').value);
    const description = document.getElementById('recordDescription').value.trim();
    
    if (!date || !category || !amount || amount <= 0) {
        alert('Mohon lengkapi semua field yang diperlukan!');
        return;
    }
    
    const record = {
        id: Date.now(),
        date,
        type,
        category,
        amount,
        description
    };
    
    records.unshift(record);
    saveData();
    renderRecords();
    updateSummary();
    
    // Reset form
    document.getElementById('recordAmount').value = '';
    document.getElementById('recordDescription').value = '';
    document.getElementById('recordCategory').value = '';
}

function deleteRecord(id) {
    if (confirm('Hapus catatan ini?')) {
        records = records.filter(record => record.id !== id);
        saveData();
        renderRecords();
        updateSummary();
    }
}

function renderRecords() {
    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';
    
    if (records.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Belum ada catatan keuangan</td></tr>';
        return;
    }
    
    records.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>${record.category}</td>
            <td><span class="type-badge ${record.type}">${record.type}</span></td>
            <td>${record.description || '-'}</td>
            <td>${formatCurrency(record.amount)}</td>
            <td><button class="delete-record-btn" onclick="deleteRecord(${record.id})">Hapus</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateSummary() {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    records.forEach(record => {
        if (record.type === 'pemasukan') {
            totalPemasukan += record.amount;
        } else {
            totalPengeluaran += record.amount;
        }
    });
    
    const saldo = totalPemasukan - totalPengeluaran;
    
    document.getElementById('totalPemasukan').textContent = formatCurrency(totalPemasukan);
    document.getElementById('totalPengeluaran').textContent = formatCurrency(totalPengeluaran);
    document.getElementById('saldo').textContent = formatCurrency(saldo);
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

// Export Functions
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Laporan Keuangan', 14, 20);
    
    // Summary
    doc.setFontSize(12);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    records.forEach(record => {
        if (record.type === 'pemasukan') totalPemasukan += record.amount;
        else totalPengeluaran += record.amount;
    });
    const saldo = totalPemasukan - totalPengeluaran;
    
    doc.text(`Total Pemasukan: ${formatCurrency(totalPemasukan)}`, 14, 40);
    doc.text(`Total Pengeluaran: ${formatCurrency(totalPengeluaran)}`, 14, 50);
    doc.text(`Saldo: ${formatCurrency(saldo)}`, 14, 60);
    
    // Table
    const tableData = records.map(record => [
        formatDate(record.date),
        record.category,
        record.type,
        record.description || '-',
        formatCurrency(record.amount)
    ]);
    
    doc.autoTable({
        head: [['Tanggal', 'Kategori', 'Tipe', 'Deskripsi', 'Jumlah']],
        body: tableData,
        startY: 70,
        styles: { fontSize: 10 }
    });
    
    doc.save('laporan-keuangan.pdf');
}

function exportToExcel() {
    const data = records.map(record => ({
        'Tanggal': record.date,
        'Kategori': record.category,
        'Tipe': record.type,
        'Deskripsi': record.description || '-',
        'Jumlah': record.amount
    }));
    
    // Add summary at the end
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    records.forEach(record => {
        if (record.type === 'pemasukan') totalPemasukan += record.amount;
        else totalPengeluaran += record.amount;
    });
    
    data.push({});
    data.push({
        'Tanggal': 'RINGKASAN',
        'Kategori': '',
        'Tipe': '',
        'Deskripsi': '',
        'Jumlah': ''
    });
    data.push({
        'Tanggal': 'Total Pemasukan',
        'Kategori': '',
        'Tipe': '',
        'Deskripsi': '',
        'Jumlah': totalPemasukan
    });
    data.push({
        'Tanggal': 'Total Pengeluaran',
        'Kategori': '',
        'Tipe': '',
        'Deskripsi': '',
        'Jumlah': totalPengeluaran
    });
    data.push({
        'Tanggal': 'Saldo',
        'Kategori': '',
        'Tipe': '',
        'Deskripsi': '',
        'Jumlah': totalPemasukan - totalPengeluaran
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
    XLSX.writeFile(wb, 'laporan-keuangan.xlsx');
}

function exportToWord() {
    const { Document, Paragraph, TextRun, Table, TableCell, TableRow, WidthType } = docx;
    
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    records.forEach(record => {
        if (record.type === 'pemasukan') totalPemasukan += record.amount;
        else totalPengeluaran += record.amount;
    });
    const saldo = totalPemasukan - totalPengeluaran;
    
    // Create table rows
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
    
    records.forEach(record => {
        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(formatDate(record.date))] }),
                    new TableCell({ children: [new Paragraph(record.category)] }),
                    new TableCell({ children: [new Paragraph(record.type)] }),
                    new TableCell({ children: [new Paragraph(record.description || '-')] }),
                    new TableCell({ children: [new Paragraph(formatCurrency(record.amount))] }),
                ],
            })
        );
    });
    
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Laporan Keuangan',
                            bold: true,
                            size: 32,
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
                        }),
                    ],
                }),
                new Paragraph(''),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Total Pemasukan: ${formatCurrency(totalPemasukan)}`,
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Total Pengeluaran: ${formatCurrency(totalPengeluaran)}`,
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Saldo: ${formatCurrency(saldo)}`,
                            bold: true,
                        }),
                    ],
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
    });
}

function exportToPPT() {
    const pptx = new PptxGenJS();
    
    // Title Slide
    const slide1 = pptx.addSlide();
    slide1.background = { color: '667eea' };
    slide1.addText('Laporan Keuangan', {
        x: 1,
        y: 1.5,
        w: 8,
        h: 1,
        fontSize: 44,
        bold: true,
        color: 'FFFFFF',
        align: 'center'
    });
    slide1.addText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, {
        x: 1,
        y: 3,
        w: 8,
        h: 0.5,
        fontSize: 18,
        color: 'FFFFFF',
        align: 'center'
    });
    
    // Summary Slide
    const slide2 = pptx.addSlide();
    slide2.addText('Ringkasan', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.75,
        fontSize: 32,
        bold: true,
        color: '667eea'
    });
    
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    records.forEach(record => {
        if (record.type === 'pemasukan') totalPemasukan += record.amount;
        else totalPengeluaran += record.amount;
    });
    const saldo = totalPemasukan - totalPengeluaran;
    
    slide2.addText(`Total Pemasukan: ${formatCurrency(totalPemasukan)}`, {
        x: 1,
        y: 2,
        w: 8,
        h: 0.5,
        fontSize: 24,
        color: '27ae60',
        bold: true
    });
    slide2.addText(`Total Pengeluaran: ${formatCurrency(totalPengeluaran)}`, {
        x: 1,
        y: 2.8,
        w: 8,
        h: 0.5,
        fontSize: 24,
        color: 'e74c3c',
        bold: true
    });
    slide2.addText(`Saldo: ${formatCurrency(saldo)}`, {
        x: 1,
        y: 3.6,
        w: 8,
        h: 0.5,
        fontSize: 28,
        color: '2980b9',
        bold: true
    });
    
    // Data Slide
    const slide3 = pptx.addSlide();
    slide3.addText('Detail Catatan Keuangan', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: '667eea'
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
    
    records.slice(0, 10).forEach(record => {
        tableData.push([
            formatDate(record.date),
            record.category,
            record.type,
            record.description || '-',
            formatCurrency(record.amount)
        ]);
    });
    
    slide3.addTable(tableData, {
        x: 0.5,
        y: 1.2,
        w: 9,
        fontSize: 10,
        border: { pt: 1, color: 'CCCCCC' }
    });
    
    if (records.length > 10) {
        slide3.addText(`* Menampilkan 10 dari ${records.length} catatan`, {
            x: 0.5,
            y: 5.2,
            w: 9,
            h: 0.3,
            fontSize: 10,
            color: '999999',
            italic: true
        });
    }
    
    pptx.writeFile({ fileName: 'laporan-keuangan.pptx' });
}
