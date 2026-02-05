// ========================================
// ArBonKas Finance Manager - Original Implementation
// ========================================

(function() {
    'use strict';

    // ========================================
    // Core Configuration
    // ========================================
    const AppConfig = {
        storage: {
            mainKey: 'arbonkas_data',
            snapshotKey: 'arbonkas_snapshot',
            writeWait: 500
        },
        limits: {
            displayRows: 1000,
            categoryLength: 50,
            maxValue: 999999999999
        },
        timers: {
            notification: 3000,
            autoSave: 300000
        }
    };

    // ========================================
    // Data Store Manager
    // ========================================
    class DataStore {
        constructor() {
            this.categoryList = [];
            this.transactionLog = [];
            this.pendingSave = null;
        }

        initialize() {
            const stored = this._retrieveFromStorage();
            if (stored) {
                this.categoryList = stored.cats || this._getDefaultCategories();
                this.transactionLog = stored.trans || [];
            } else {
                this.categoryList = this._getDefaultCategories();
                this.transactionLog = [];
                this.persist();
            }
        }

        _getDefaultCategories() {
            return ['Gaji', 'Makanan', 'Transport', 'Belanja', 'Hiburan', 'Lainnya'];
        }

        _retrieveFromStorage() {
            try {
                const raw = localStorage.getItem(AppConfig.storage.mainKey);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                NotificationService.alert('Gagal memuat data', 'error');
                return null;
            }
        }

        persist() {
            if (this.pendingSave) {
                clearTimeout(this.pendingSave);
            }

            this.pendingSave = setTimeout(() => {
                try {
                    const payload = {
                        cats: this.categoryList,
                        trans: this.transactionLog
                    };
                    localStorage.setItem(AppConfig.storage.mainKey, JSON.stringify(payload));
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        NotificationService.alert('Storage penuh! Kurangi data.', 'error');
                    } else {
                        NotificationService.alert('Tidak bisa menyimpan', 'error');
                    }
                }
            }, AppConfig.storage.writeWait);
        }

        takeSnapshot() {
            try {
                const snapshot = {
                    time: new Date().toISOString(),
                    cats: [...this.categoryList],
                    trans: [...this.transactionLog]
                };
                localStorage.setItem(AppConfig.storage.snapshotKey, JSON.stringify(snapshot));
                NotificationService.alert('Snapshot berhasil', 'success');
                return true;
            } catch (e) {
                NotificationService.alert('Snapshot gagal', 'error');
                return false;
            }
        }

        loadSnapshot() {
            try {
                const raw = localStorage.getItem(AppConfig.storage.snapshotKey);
                if (!raw) {
                    NotificationService.alert('Tidak ada snapshot', 'info');
                    return false;
                }

                const snapshot = JSON.parse(raw);
                this.categoryList = snapshot.cats;
                this.transactionLog = snapshot.trans;
                this.persist();
                NotificationService.alert('Snapshot dipulihkan', 'success');
                return true;
            } catch (e) {
                NotificationService.alert('Restore gagal', 'error');
                return false;
            }
        }
    }

    // ========================================
    // Notification Service
    // ========================================
    class NotificationService {
        static alert(msg, level) {
            const container = this._getContainer();
            container.textContent = msg;
            container.className = `app-toast app-toast-${level}`;
            
            requestAnimationFrame(() => {
                container.classList.add('visible');
            });

            if (this.hideTimer) clearTimeout(this.hideTimer);
            this.hideTimer = setTimeout(() => {
                container.classList.remove('visible');
            }, AppConfig.timers.notification);
        }

        static _getContainer() {
            let elem = document.getElementById('appToast');
            if (!elem) {
                elem = document.createElement('div');
                elem.id = 'appToast';
                document.body.appendChild(elem);
            }
            return elem;
        }
    }

    // ========================================
    // Loading Indicator Service
    // ========================================
    class LoadingIndicator {
        static show(text) {
            let elem = document.getElementById('appLoader');
            if (!elem) {
                elem = document.createElement('div');
                elem.id = 'appLoader';
                elem.className = 'app-loader';
                elem.innerHTML = `<div class="spinner-ring"></div><p>${text}</p>`;
                document.body.appendChild(elem);
            }
            elem.style.display = 'flex';
        }

        static hide() {
            const elem = document.getElementById('appLoader');
            if (elem) elem.style.display = 'none';
        }
    }

    // ========================================
    // Formatters with Memoization
    // ========================================
    class FormatService {
        static init() {
            this.moneyFormat = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            });

            this.dateFormat = new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        }

        static money(val) {
            return this.moneyFormat ? this.moneyFormat.format(val) : `Rp ${val.toLocaleString('id-ID')}`;
        }

        static date(str) {
            const dt = new Date(str + 'T00:00:00');
            return this.dateFormat ? this.dateFormat.format(dt) : dt.toLocaleDateString('id-ID');
        }
    }

    // ========================================
    // Security & Validation
    // ========================================
    class SecurityHelper {
        static clean(input) {
            const temp = document.createElement('div');
            temp.textContent = input;
            return temp.innerHTML;
        }

        static generateId() {
            const stamp = Date.now();
            const rand = Math.random().toString(36).slice(2, 11);
            const extra = Math.random().toString(36).slice(2, 6);
            return `${stamp}-${rand}${extra}`;
        }
    }

    class ValidationService {
        static categoryName(name) {
            if (!name) {
                NotificationService.alert('Nama kategori wajib diisi!', 'error');
                return false;
            }
            if (name.length > AppConfig.limits.categoryLength) {
                NotificationService.alert(`Max ${AppConfig.limits.categoryLength} karakter!`, 'error');
                return false;
            }
            if (dataStore.categoryList.includes(name)) {
                NotificationService.alert('Kategori sudah ada!', 'error');
                return false;
            }
            return true;
        }

        static transactionData(dt, cat, amt) {
            if (!dt || !cat) {
                NotificationService.alert('Tanggal dan kategori wajib!', 'error');
                return false;
            }
            if (!amt || amt <= 0) {
                NotificationService.alert('Jumlah harus > 0!', 'error');
                return false;
            }
            if (amt > AppConfig.limits.maxValue) {
                NotificationService.alert('Nilai terlalu besar!', 'error');
                return false;
            }
            return true;
        }

        static categoryInUse(name) {
            return dataStore.transactionLog.some(t => t.cat === name);
        }
    }

    // ========================================
    // Category Controller
    // ========================================
    class CategoryController {
        static add() {
            const field = this._getField('categoryInput');
            if (!field) return;

            const cleaned = SecurityHelper.clean(field.value.trim());
            if (!ValidationService.categoryName(cleaned)) return;

            dataStore.categoryList.push(cleaned);
            dataStore.persist();
            this.renderAll();
            UIController.updateDropdown();
            field.value = '';
            NotificationService.alert('Kategori ditambahkan', 'success');
        }

        static remove(name) {
            if (ValidationService.categoryInUse(name)) {
                NotificationService.alert('Kategori sedang dipakai!', 'error');
                return;
            }

            if (confirm(`Hapus "${name}"?`)) {
                dataStore.categoryList = dataStore.categoryList.filter(c => c !== name);
                dataStore.persist();
                this.renderAll();
                UIController.updateDropdown();
                NotificationService.alert('Kategori dihapus', 'success');
            }
        }

        static renderAll() {
            const container = this._getField('categoryList');
            if (!container) return;

            const frag = document.createDocumentFragment();
            
            dataStore.categoryList.forEach(cat => {
                const box = document.createElement('div');
                box.className = 'category-tag';
                
                const label = document.createElement('span');
                label.textContent = cat;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'delete-btn';
                removeBtn.textContent = '×';
                removeBtn.onclick = () => this.remove(cat);
                
                box.appendChild(label);
                box.appendChild(removeBtn);
                frag.appendChild(box);
            });

            container.innerHTML = '';
            container.appendChild(frag);
        }

        static _getField(id) {
            const el = document.getElementById(id);
            if (!el) console.warn(`Missing: ${id}`);
            return el;
        }
    }

    // ========================================
    // Transaction Controller
    // ========================================
    class TransactionController {
        static add() {
            const fields = {
                dt: this._getField('recordDate'),
                typ: this._getField('recordType'),
                cat: this._getField('recordCategory'),
                amt: this._getField('recordAmount'),
                desc: this._getField('recordDescription')
            };

            if (!fields.dt || !fields.typ || !fields.cat || !fields.amt || !fields.desc) {
                NotificationService.alert('Form tidak lengkap', 'error');
                return;
            }

            const amount = parseFloat(fields.amt.value);
            if (!ValidationService.transactionData(fields.dt.value, fields.cat.value, amount)) {
                return;
            }

            const entry = {
                uid: SecurityHelper.generateId(),
                dt: fields.dt.value,
                typ: fields.typ.value,
                cat: fields.cat.value,
                amt: amount,
                desc: SecurityHelper.clean(fields.desc.value.trim())
            };

            dataStore.transactionLog.unshift(entry);
            dataStore.persist();
            this.renderAll();
            SummaryController.update();
            this._clearInputs(fields);
            NotificationService.alert('Transaksi ditambahkan', 'success');
        }

        static remove(uid) {
            if (confirm('Hapus transaksi?')) {
                dataStore.transactionLog = dataStore.transactionLog.filter(t => t.uid !== uid);
                dataStore.persist();
                this.renderAll();
                SummaryController.update();
                NotificationService.alert('Transaksi dihapus', 'success');
            }
        }

        static renderAll() {
            const tbody = this._getField('recordsBody');
            if (!tbody) return;

            if (dataStore.transactionLog.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;">Belum ada data</td></tr>';
                return;
            }

            const frag = document.createDocumentFragment();
            const max = Math.min(dataStore.transactionLog.length, AppConfig.limits.displayRows);

            for (let i = 0; i < max; i++) {
                const item = dataStore.transactionLog[i];
                const row = this._buildRow(item);
                frag.appendChild(row);
            }

            tbody.innerHTML = '';
            tbody.appendChild(frag);

            if (dataStore.transactionLog.length > AppConfig.limits.displayRows) {
                tbody.appendChild(this._buildInfoRow());
            }
        }

        static _buildRow(item) {
            const row = document.createElement('tr');

            const cells = [
                this._makeCell(FormatService.date(item.dt)),
                this._makeCell(item.cat),
                this._makeTypeBadge(item.typ),
                this._makeCell(item.desc || '-'),
                this._makeCell(FormatService.money(item.amt)),
                this._makeActionCell(item.uid)
            ];

            cells.forEach(cell => row.appendChild(cell));
            return row;
        }

        static _makeCell(text) {
            const cell = document.createElement('td');
            cell.textContent = text;
            return cell;
        }

        static _makeTypeBadge(type) {
            const cell = document.createElement('td');
            const badge = document.createElement('span');
            badge.className = `type-badge ${type}`;
            badge.textContent = type;
            cell.appendChild(badge);
            return cell;
        }

        static _makeActionCell(uid) {
            const cell = document.createElement('td');
            const btn = document.createElement('button');
            btn.className = 'delete-record-btn';
            btn.textContent = 'Hapus';
            btn.onclick = () => this.remove(uid);
            cell.appendChild(btn);
            return cell;
        }

        static _buildInfoRow() {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.style.cssText = 'text-align:center;padding:20px;font-style:italic;color:#888;';
            cell.textContent = `Tampil ${AppConfig.limits.displayRows} dari ${dataStore.transactionLog.length} data`;
            row.appendChild(cell);
            return row;
        }

        static _clearInputs(fields) {
            if (fields.amt) fields.amt.value = '';
            if (fields.desc) fields.desc.value = '';
            if (fields.cat) fields.cat.value = '';
        }

        static _getField(id) {
            return document.getElementById(id);
        }
    }

    // ========================================
    // Summary Controller
    // ========================================
    class SummaryController {
        static update() {
            const stats = this._calculate();

            const elemIn = document.getElementById('totalPemasukan');
            const elemOut = document.getElementById('totalPengeluaran');
            const elemBal = document.getElementById('saldo');

            if (elemIn) elemIn.textContent = FormatService.money(stats.incoming);
            if (elemOut) elemOut.textContent = FormatService.money(stats.outgoing);
            if (elemBal) {
                elemBal.textContent = FormatService.money(stats.balance);
                elemBal.style.color = stats.balance >= 0 ? '#27ae60' : '#e74c3c';
            }
        }

        static _calculate() {
            let incoming = 0;
            let outgoing = 0;

            dataStore.transactionLog.forEach(t => {
                if (t.typ === 'pemasukan') {
                    incoming += t.amt;
                } else {
                    outgoing += t.amt;
                }
            });

            return {
                incoming,
                outgoing,
                balance: incoming - outgoing
            };
        }
    }

    // ========================================
    // UI Controller
    // ========================================
    class UIController {
        static updateDropdown() {
            const select = document.getElementById('recordCategory');
            if (!select) return;

            const frag = document.createDocumentFragment();
            
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Pilih Kategori';
            frag.appendChild(placeholder);

            dataStore.categoryList.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                frag.appendChild(opt);
            });

            select.innerHTML = '';
            select.appendChild(frag);
        }

        static setDefaultDate() {
            const field = document.getElementById('recordDate');
            if (field) field.valueAsDate = new Date();
        }

        static refreshAll() {
            CategoryController.renderAll();
            this.updateDropdown();
            TransactionController.renderAll();
            SummaryController.update();
        }
    }

    // ========================================
    // Export Manager
    // ========================================
    class ExportManager {
        static toPDF() {
            LoadingIndicator.show('Export PDF...');

            try {
                if (typeof window.jspdf === 'undefined') {
                    throw new Error('PDF lib missing');
                }

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                const stats = SummaryController._calculate();

                pdf.setFontSize(18);
                pdf.text('Laporan Keuangan', 14, 20);

                pdf.setFontSize(12);
                pdf.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
                pdf.text(`Pemasukan: ${FormatService.money(stats.incoming)}`, 14, 40);
                pdf.text(`Pengeluaran: ${FormatService.money(stats.outgoing)}`, 14, 50);
                pdf.text(`Saldo: ${FormatService.money(stats.balance)}`, 14, 60);

                const rows = dataStore.transactionLog.map(t => [
                    FormatService.date(t.dt),
                    t.cat,
                    t.typ,
                    t.desc || '-',
                    FormatService.money(t.amt)
                ]);

                pdf.autoTable({
                    head: [['Tanggal', 'Kategori', 'Tipe', 'Deskripsi', 'Jumlah']],
                    body: rows,
                    startY: 70,
                    styles: { fontSize: 10 }
                });

                pdf.save('laporan-keuangan.pdf');
                LoadingIndicator.hide();
                NotificationService.alert('PDF berhasil', 'success');
            } catch (e) {
                LoadingIndicator.hide();
                NotificationService.alert('PDF gagal, pakai CSV', 'error');
                this.toCSV();
            }
        }

        static toExcel() {
            LoadingIndicator.show('Export Excel...');

            try {
                if (typeof XLSX === 'undefined') {
                    throw new Error('Excel lib missing');
                }

                const stats = SummaryController._calculate();
                const rows = dataStore.transactionLog.map(t => ({
                    'Tanggal': t.dt,
                    'Kategori': t.cat,
                    'Tipe': t.typ,
                    'Deskripsi': t.desc || '-',
                    'Jumlah': t.amt
                }));

                rows.push({});
                rows.push({ 'Tanggal': 'RINGKASAN' });
                rows.push({ 'Tanggal': 'Total Pemasukan', 'Jumlah': stats.incoming });
                rows.push({ 'Tanggal': 'Total Pengeluaran', 'Jumlah': stats.outgoing });
                rows.push({ 'Tanggal': 'Saldo', 'Jumlah': stats.balance });

                const sheet = XLSX.utils.json_to_sheet(rows);
                const book = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(book, sheet, 'Laporan');
                XLSX.writeFile(book, 'laporan-keuangan.xlsx');

                LoadingIndicator.hide();
                NotificationService.alert('Excel berhasil', 'success');
            } catch (e) {
                LoadingIndicator.hide();
                NotificationService.alert('Excel gagal, pakai CSV', 'error');
                this.toCSV();
            }
        }

        static toWord() {
            LoadingIndicator.show('Export Word...');

            try {
                if (typeof docx === 'undefined') {
                    throw new Error('Word lib missing');
                }

                const { Document, Paragraph, TextRun, Table, TableCell, TableRow, WidthType } = docx;
                const stats = SummaryController._calculate();

                const rows = [
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

                dataStore.transactionLog.forEach(t => {
                    rows.push(
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(FormatService.date(t.dt))] }),
                                new TableCell({ children: [new Paragraph(t.cat)] }),
                                new TableCell({ children: [new Paragraph(t.typ)] }),
                                new TableCell({ children: [new Paragraph(t.desc || '-')] }),
                                new TableCell({ children: [new Paragraph(FormatService.money(t.amt))] }),
                            ],
                        })
                    );
                });

                const doc = new Document({
                    sections: [{
                        children: [
                            new Paragraph({ children: [new TextRun({ text: 'Laporan Keuangan', bold: true, size: 32 })] }),
                            new Paragraph({ children: [new TextRun({ text: `Tanggal: ${new Date().toLocaleDateString('id-ID')}` })] }),
                            new Paragraph(''),
                            new Paragraph({ children: [new TextRun({ text: `Pemasukan: ${FormatService.money(stats.incoming)}` })] }),
                            new Paragraph({ children: [new TextRun({ text: `Pengeluaran: ${FormatService.money(stats.outgoing)}` })] }),
                            new Paragraph({ children: [new TextRun({ text: `Saldo: ${FormatService.money(stats.balance)}`, bold: true })] }),
                            new Paragraph(''),
                            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rows }),
                        ],
                    }],
                });

                docx.Packer.toBlob(doc).then(blob => {
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = 'laporan-keuangan.docx';
                    link.click();
                    window.URL.revokeObjectURL(link.href);
                    LoadingIndicator.hide();
                    NotificationService.alert('Word berhasil', 'success');
                });
            } catch (e) {
                LoadingIndicator.hide();
                NotificationService.alert('Word gagal, pakai CSV', 'error');
                this.toCSV();
            }
        }

        static toPPT() {
            LoadingIndicator.show('Export PowerPoint...');

            try {
                if (typeof PptxGenJS === 'undefined') {
                    throw new Error('PPT lib missing');
                }

                const ppt = new PptxGenJS();
                const stats = SummaryController._calculate();

                const s1 = ppt.addSlide();
                s1.background = { color: '667eea' };
                s1.addText('Laporan Keuangan', { x: 1, y: 1.5, w: 8, h: 1, fontSize: 44, bold: true, color: 'FFFFFF', align: 'center' });
                s1.addText(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { x: 1, y: 3, w: 8, h: 0.5, fontSize: 18, color: 'FFFFFF', align: 'center' });

                const s2 = ppt.addSlide();
                s2.addText('Ringkasan', { x: 0.5, y: 0.5, w: 9, h: 0.75, fontSize: 32, bold: true, color: '667eea' });
                s2.addText(`Pemasukan: ${FormatService.money(stats.incoming)}`, { x: 1, y: 2, w: 8, h: 0.5, fontSize: 24, color: '27ae60', bold: true });
                s2.addText(`Pengeluaran: ${FormatService.money(stats.outgoing)}`, { x: 1, y: 2.8, w: 8, h: 0.5, fontSize: 24, color: 'e74c3c', bold: true });
                s2.addText(`Saldo: ${FormatService.money(stats.balance)}`, { x: 1, y: 3.6, w: 8, h: 0.5, fontSize: 28, color: '2980b9', bold: true });

                const s3 = ppt.addSlide();
                s3.addText('Detail Transaksi', { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 24, bold: true, color: '667eea' });

                const tblData = [
                    [
                        { text: 'Tanggal', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                        { text: 'Kategori', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                        { text: 'Tipe', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                        { text: 'Deskripsi', options: { bold: true, color: 'FFFFFF', fill: '667eea' } },
                        { text: 'Jumlah', options: { bold: true, color: 'FFFFFF', fill: '667eea' } }
                    ]
                ];

                dataStore.transactionLog.slice(0, 10).forEach(t => {
                    tblData.push([
                        FormatService.date(t.dt),
                        t.cat,
                        t.typ,
                        t.desc || '-',
                        FormatService.money(t.amt)
                    ]);
                });

                s3.addTable(tblData, { x: 0.5, y: 1.2, w: 9, fontSize: 10, border: { pt: 1, color: 'CCCCCC' } });

                if (dataStore.transactionLog.length > 10) {
                    s3.addText(`* Tampil 10 dari ${dataStore.transactionLog.length} data`, { x: 0.5, y: 5.2, w: 9, h: 0.3, fontSize: 10, color: '999999', italic: true });
                }

                ppt.writeFile({ fileName: 'laporan-keuangan.pptx' });
                LoadingIndicator.hide();
                NotificationService.alert('PowerPoint berhasil', 'success');
            } catch (e) {
                LoadingIndicator.hide();
                NotificationService.alert('PPT gagal, pakai CSV', 'error');
                this.toCSV();
            }
        }

        static toCSV() {
            LoadingIndicator.show('Export CSV...');

            try {
                const stats = SummaryController._calculate();
                let output = 'Tanggal,Kategori,Tipe,Deskripsi,Jumlah\n';

                dataStore.transactionLog.forEach(t => {
                    const line = [t.dt, t.cat, t.typ, t.desc || '-', t.amt];
                    output += line.map(f => `"${f}"`).join(',') + '\n';
                });

                output += '\nRINGKASAN\n';
                output += `Pemasukan,,,,${stats.incoming}\n`;
                output += `Pengeluaran,,,,${stats.outgoing}\n`;
                output += `Saldo,,,,${stats.balance}\n`;

                const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'laporan-keuangan.csv';
                link.click();
                window.URL.revokeObjectURL(link.href);

                LoadingIndicator.hide();
                NotificationService.alert('CSV berhasil', 'success');
            } catch (e) {
                LoadingIndicator.hide();
                NotificationService.alert('CSV gagal', 'error');
            }
        }
    }

    // ========================================
    // App Initializer
    // ========================================
    class AppInitializer {
        static start() {
            try {
                FormatService.init();
                dataStore.initialize();
                UIController.refreshAll();
                UIController.setDefaultDate();
                this._setupEvents();
                this._startAutoBackup();
                NotificationService.alert('Aplikasi siap', 'info');
            } catch (e) {
                console.error('Init error:', e);
                NotificationService.alert('Error saat memuat', 'error');
            }
        }

        static _setupEvents() {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    dataStore.takeSnapshot();
                }
            });
        }

        static _startAutoBackup() {
            setInterval(() => {
                dataStore.takeSnapshot();
            }, AppConfig.timers.autoSave);
        }
    }

    // ========================================
    // Global State & Exports
    // ========================================
    const dataStore = new DataStore();

    window.StorageManager = {
        createBackup: () => dataStore.takeSnapshot(),
        restoreBackup: () => {
            const success = dataStore.loadSnapshot();
            if (success) UIController.refreshAll();
            return success;
        }
    };

    window.addCategory = () => CategoryController.add();
    window.deleteCategory = (name) => CategoryController.remove(name);
    window.addRecord = () => TransactionController.add();
    window.deleteRecord = (uid) => TransactionController.remove(uid);
    window.exportToPDF = () => ExportManager.toPDF();
    window.exportToExcel = () => ExportManager.toExcel();
    window.exportToWord = () => ExportManager.toWord();
    window.exportToPPT = () => ExportManager.toPPT();
    window.exportToCSV = () => ExportManager.toCSV();

    // ========================================
    // Bootstrap
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AppInitializer.start());
    } else {
        AppInitializer.start();
    }

})();
