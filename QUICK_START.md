# Quick Start Guide

Get up and running with the PDF Scanner in 5 minutes!

## ⚡ Fast Setup

### Windows Users

1. **Open Command Prompt or PowerShell** in the `pdf-scanner` folder
2. **Run:**
   ```bash
   npm install
   ```
3. **Start the app:**
   - Double-click `start.bat`, OR
   - Run: `npm start`

4. **Open browser:** http://localhost:3000

### Mac/Linux Users

1. **Open Terminal** in the `pdf-scanner` folder
2. **Make startup script executable:**
   ```bash
   chmod +x start.sh
   ```
3. **Run:**
   ```bash
   npm install
   ./start.sh
   ```

4. **Open browser:** http://localhost:3000

## 📝 First Steps

### Step 1: Add a Class (30 seconds)

1. Click **"📂 Ayarlar"** (Settings) in the sidebar
2. Select **"--- Yeni Sınıf Ekle ---"** from dropdown
3. Enter class name (e.g., "5-A")
4. Click **"Sınıfı Oluştur"** (Create Class)

### Step 2: Add Students

**Option A: Add One Student (1 minute)**

1. Stay on the Ayarlar page
2. Go to **"Tek Öğrenci Ekle"** tab
3. Fill in:
   - Student Name: `MEHMET GÜL`
   - School Number: `001`
   - (Parent info is optional)
4. Click **"Öğrenciyi Ekle/Güncelle"**

**Option B: Import from Excel (2 minutes)**

1. Prepare an Excel file with columns:
   - `Ad Soyad` (Student Name)
   - `Okul No` (School Number)
   - Plus optional parent info columns

2. Go to **"Excel ile Toplu Yükleme"** tab
3. Upload your Excel file
4. Click **"Excel Listesini Kaydet..."**

See [EXCEL_TEMPLATE.md](EXCEL_TEMPLATE.md) for detailed Excel format.

### Step 3: Parse a PDF (1 minute)

1. Click **"⚙️ PDF Ayrıştırma"** in sidebar
2. Select your class from dropdown
3. Upload your PDF file
4. Click **"Ayrıştırma İşlemini Başlat"**
5. Wait for processing to complete

### Step 4: Download Results

1. Review found students in the table
2. Download options:
   - **ZIP (Okul No)**: Files named by school numbers
   - **ZIP (İsim)**: Files named by student names
   - **İndir (Individual)**: Download specific PDFs

## 🎯 Common Use Cases

### Use Case 1: LGS Exam Results

**Scenario:** You have a PDF with 30 students' exam results, need individual PDFs.

**Solution:**
1. Add all 30 students to a class (use Excel import)
2. Upload the exam results PDF
3. Click parse - get 30 individual PDFs in seconds
4. Download as ZIP and distribute

### Use Case 2: Report Cards

**Scenario:** Monthly report cards for multiple classes.

**Solution:**
1. Create separate classes (5-A, 5-B, 5-C, etc.)
2. Add students to each class
3. Parse each class's report card PDF separately
4. Download organized by class and student

### Use Case 3: Certificate Distribution

**Scenario:** 50 certificates in one PDF, need to email individually.

**Solution:**
1. Import student list with email addresses
2. Parse certificate PDF
3. Download individual PDFs
4. Use email addresses from student data to distribute

## 💡 Pro Tips

### Tip 1: Name Matching
For best PDF parsing results:
- Use **UPPERCASE** student names
- Include **full names** (first + last, minimum 2 parts)
- Match **exact spelling** in PDF

### Tip 2: School Numbers
- Keep **leading zeros** if they appear in PDFs (e.g., 0099 not 99)
- Use **consistent format** across all students

### Tip 3: Handling Duplicates
If a student appears multiple times in the PDF:
- Files are auto-numbered (e.g., 001.pdf, 001_1.pdf)
- Review and delete unwanted matches before downloading
- Check the **"Eşleşme Bağlamı"** column to verify correct matches

### Tip 4: Missing Students
If students aren't found:
- Check the **"Bulunamayan Öğrenciler"** section
- Verify name spelling matches PDF exactly
- Look for extra spaces or special characters
- Try both "Name Surname" and "Surname Name" formats

## 🔧 Troubleshooting

### Problem: PDF not parsing

**Quick Fix:**
- Ensure PDF is not password-protected
- Verify PDF contains text (not just scanned images)
- Try with a smaller test PDF first

### Problem: No students found

**Quick Fix:**
- Check student names match PDF exactly
- Use the Edit feature to update names if needed
- Verify students have school numbers entered

### Problem: Port 3000 in use

**Quick Fix:**
```bash
# Windows PowerShell
$env:PORT=8080; npm start

# Mac/Linux
PORT=8080 npm start
```

## 📚 Next Steps

Once you're comfortable with the basics:

1. **Read the full documentation:**
   - [README.md](README.md) - Complete feature overview
   - [INSTALLATION.md](INSTALLATION.md) - Detailed setup
   - [EXCEL_TEMPLATE.md](EXCEL_TEMPLATE.md) - Excel formatting

2. **Explore advanced features:**
   - Edit and update student information
   - Delete unwanted parsed results
   - Manage multiple classes

3. **Data management:**
   - Backup `data/student_data.json` regularly
   - Export student lists for records
   - Keep data organized by academic year

## ❓ Need Help?

### Resources
- Check browser console (F12) for error messages
- Review server terminal output for backend errors
- Verify all dependencies installed correctly

### Common Questions

**Q: Can I edit student info after adding?**  
A: Yes! Use the "Mevcut Öğrenciyi Düzenle/Sil" tab.

**Q: What Excel format do I need?**  
A: `.xlsx` with columns "Ad Soyad" and "Okul No" at minimum.

**Q: How do I update student names?**  
A: Edit the student, change the name, and save - creates a new entry.

**Q: Can I delete parsed results?**  
A: Yes! Click the ❌ button next to any report before downloading.

**Q: Where is my data stored?**  
A: In `pdf-scanner/data/student_data.json` - back this up regularly!

## 🚀 You're Ready!

That's it! You now know enough to:
- ✅ Add and manage students
- ✅ Parse PDF documents
- ✅ Download individual or bulk results
- ✅ Handle common issues

Happy parsing! 🎉

