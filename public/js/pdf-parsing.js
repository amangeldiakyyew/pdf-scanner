// pdf-parsing.js - Frontend JavaScript for PDF Parsing

let currentClass = '';
let parseResults = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadClasses();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('classSelectPdf').addEventListener('change', async (e) => {
        currentClass = e.target.value;
        if (currentClass) {
            await loadClassInfo(currentClass);
        } else {
            document.getElementById('classInfo').style.display = 'none';
        }
        checkEnableParseButton();
    });

    document.getElementById('pdfFile').addEventListener('change', () => {
        const file = document.getElementById('pdfFile').files[0];
        if (file) {
            document.getElementById('uploadInfo').style.display = 'block';
            document.getElementById('uploadInfo').textContent = `Dosya yüklendi: ${file.name}`;
        } else {
            document.getElementById('uploadInfo').style.display = 'none';
        }
        checkEnableParseButton();
    });
}

// Check if parse button should be enabled
function checkEnableParseButton() {
    const hasClass = currentClass !== '';
    const hasFile = document.getElementById('pdfFile').files.length > 0;
    document.getElementById('parseButton').disabled = !(hasClass && hasFile);
}

// Load all classes
async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('classSelectPdf');
            select.innerHTML = '<option value="">-- Sınıf Seçin --</option>';
            
            data.classes.sort().forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                select.appendChild(option);
            });

            if (data.classes.length === 0) {
                showNotification('Lütfen önce Ayarlar sayfasında bir sınıf oluşturun', 'error');
            }
        }
    } catch (error) {
        showNotification('Sınıflar yüklenirken hata oluştu', 'error');
    }
}

// Load class info (student count)
async function loadClassInfo(className) {
    try {
        const response = await fetch(`/api/classes/${encodeURIComponent(className)}/students`);
        const data = await response.json();

        if (data.success) {
            const studentCount = Object.keys(data.students).length;
            document.getElementById('studentCount').textContent = studentCount;
            document.getElementById('classInfo').style.display = 'block';

            if (studentCount === 0) {
                showNotification('Bu sınıfta öğrenci bulunmuyor. Lütfen önce öğrenci ekleyin.', 'error');
            }
        }
    } catch (error) {
        showNotification('Sınıf bilgileri yüklenirken hata oluştu', 'error');
    }
}

// Parse PDF
async function parsePdf() {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];

    if (!file || !currentClass) {
        showNotification('Lütfen sınıf ve PDF dosyası seçin', 'error');
        return;
    }

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('parseButton').disabled = true;
    document.getElementById('resultsSection').style.display = 'none';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('className', currentClass);

    try {
        const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            parseResults = data;
            displayResults(data);
            showNotification(`İşlem tamamlandı! ${data.foundCount} sayfa bulundu.`, 'success');
        } else {
            showNotification(data.error || 'PDF işlenirken hata oluştu', 'error');
        }
    } catch (error) {
        console.error('Parse error:', error);
        showNotification('PDF işlenirken hata oluştu', 'error');
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('parseButton').disabled = false;
    }
}

// Display parse results
function displayResults(data) {
    document.getElementById('resultsSection').style.display = 'block';

    // Display missing students
    if (data.missingStudents && data.missingStudents.length > 0) {
        document.getElementById('missingStudents').style.display = 'block';
        document.getElementById('missingCount').textContent = 
            `Toplam ${data.missingStudents.length} öğrencinin raporu bulunamadı.`;
        
        const missingList = document.getElementById('missingList');
        missingList.innerHTML = '<strong>Bulunamayanlar Listesi:</strong><ul>' +
            data.missingStudents.map(name => `<li>${name}</li>`).join('') +
            '</ul>';
    } else {
        document.getElementById('missingStudents').style.display = 'none';
    }

    // Display found reports
    if (data.reports && data.reports.length > 0) {
        document.getElementById('foundReports').style.display = 'block';
        document.getElementById('foundCount').textContent = data.foundCount;

        // Show duplicate warning if needed
        if (data.hasDuplicates) {
            document.getElementById('duplicateWarning').style.display = 'block';
        } else {
            document.getElementById('duplicateWarning').style.display = 'none';
        }

        displayReportsTable(data.reports);
    } else {
        document.getElementById('foundReports').style.display = 'none';
    }
}

// Display reports in table
function displayReportsTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';

    reports.forEach(report => {
        const row = document.createElement('tr');

        // Truncate matched text if too long
        let matchedText = report.matchedText.replace(/\n/g, ' ').replace(/\r/g, '').trim();
        if (matchedText.length > 100) {
            matchedText = matchedText.substring(0, 97) + '...';
        }

        row.innerHTML = `
            <td>${report.studentName}</td>
            <td><code class="match-context">${matchedText}</code></td>
            <td>${report.fileNameSchoolNo}</td>
            <td>
                <button onclick="downloadSinglePdf('${report.id}')" class="btn btn-secondary btn-sm">
                    İndir
                </button>
            </td>
            <td>
                <button onclick="deleteReport('${report.id}')" class="btn btn-danger btn-sm">
                    ❌ Sil
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Download ZIP with all PDFs
async function downloadZip(namingMode) {
    try {
        const response = await fetch(`/api/download-zip/${namingMode}`);
        
        if (!response.ok) {
            showNotification('ZIP dosyası oluşturulamadı', 'error');
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentClass}_Raporlar_${namingMode === 'schoolNo' ? 'OkulNo' : 'Isim'}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('ZIP dosyası indiriliyor', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('İndirme sırasında hata oluştu', 'error');
    }
}

// Download single PDF
async function downloadSinglePdf(reportId) {
    try {
        const response = await fetch(`/api/download-pdf/${reportId}`);
        
        if (!response.ok) {
            showNotification('PDF indirilemedi', 'error');
            return;
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'report.pdf';
        
        if (contentDisposition) {
            const matches = /filename="(.+)"/.exec(contentDisposition);
            if (matches && matches[1]) {
                fileName = matches[1];
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showNotification('PDF indiriliyor', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('İndirme sırasında hata oluştu', 'error');
    }
}

// Delete a report
async function deleteReport(reportId) {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`/api/reports/${reportId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            // Remove from local results
            if (parseResults && parseResults.reports) {
                parseResults.reports = parseResults.reports.filter(r => r.id !== reportId);
                parseResults.foundCount = parseResults.reports.length;
                displayResults(parseResults);
                showNotification('Rapor silindi', 'success');
            }
        } else {
            showNotification(data.error || 'Rapor silinemedi', 'error');
        }
    } catch (error) {
        showNotification('Rapor silinirken hata oluştu', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

