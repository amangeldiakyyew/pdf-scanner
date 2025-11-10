# Excel Template for Student Import

## Required Columns

Your Excel file **must** include these column headers (exact names, case-sensitive):

| Column Header | Description | Required | Example |
|--------------|-------------|----------|---------|
| Ad Soyad | Student's full name | **Yes** | MEHMET GÜL |
| Okul No | School number | **Yes** | 000185 |
| Anne Adı Soyadı | Mother's full name | No | AYŞE GÜL |
| Anne E-posta | Mother's email | No | ayse@email.com |
| Anne Telefon | Mother's phone | No | 5551234567 |
| Baba Adı Soyadı | Father's full name | No | NECİP GÜL |
| Baba E-posta | Father's email | No | necip@email.com |
| Baba Telefon | Father's phone | No | 5557654321 |

## Important Notes

### Name Format
- Student names should have at least 2 parts (first name and last name)
- Use UPPERCASE for better PDF matching
- Examples:
  - ✅ MEHMET GÜL
  - ✅ AYŞEGÜL YILMAZ
  - ✅ ELİF NAZ ŞEKER
  - ❌ Mehmet (only one part)

### School Number Format
- Can include leading zeros (e.g., 000185, 001, 08)
- The system preserves the format you provide
- Examples:
  - ✅ 000185
  - ✅ 001
  - ✅ 78
  - ✅ 0099

### File Format
- Save as `.xlsx` format (Excel 2007 or later)
- The first row must contain column headers
- Empty rows will be skipped automatically

## Sample Excel Structure

```
| Ad Soyad           | Okul No | Anne Adı Soyadı | Anne E-posta      | Anne Telefon | Baba Adı Soyadı | Baba E-posta      | Baba Telefon |
|-------------------|---------|-----------------|-------------------|--------------|-----------------|-------------------|--------------|
| MEHMET GÜL        | 587     | AYŞE GÜL        | ayse@email.com    | 5059832374   | NECİP GÜL       | necip@email.com   | 5027486010   |
| ATASOY ELİF NAZ   | 000185  | BAHRYE ATASOY   | bahriye@email.com | 5265245800   | HASAN ATASOY    | hasan@email.com   | 6525487000   |
| ELİF NAZ ŞEKER    | 08      | KÜBRA ŞEKER     | kubra@email.com   | 5458545600   | SAMİ ŞEKER      | sami@email.com    | 6565540000   |
```

## Creating the Template

### Method 1: Microsoft Excel

1. Open Microsoft Excel
2. Create a new workbook
3. In the first row, type these headers:
   ```
   Ad Soyad | Okul No | Anne Adı Soyadı | Anne E-posta | Anne Telefon | Baba Adı Soyadı | Baba E-posta | Baba Telefon
   ```
4. Fill in your student data in the rows below
5. Save as `.xlsx` format

### Method 2: Google Sheets

1. Open Google Sheets
2. Create a new spreadsheet
3. Add the column headers in the first row
4. Fill in your student data
5. Download as "Microsoft Excel (.xlsx)"

### Method 3: LibreOffice Calc

1. Open LibreOffice Calc
2. Create a new spreadsheet
3. Add the column headers in the first row
4. Fill in your student data
5. Save As → choose "Excel 2007-365 (.xlsx)"

## Tips for Best Results

### 1. Consistent Naming
Ensure student names in your Excel file **exactly match** the names in your PDF documents:
- Same spelling
- Same capitalization (UPPERCASE recommended)
- Same spacing

### 2. Data Validation
Before importing:
- Check for duplicate entries
- Verify all school numbers are correct
- Remove any test or placeholder data

### 3. Parent Information
While parent information is optional, it's useful for:
- Future communication features
- Complete record keeping
- Report generation

### 4. School Numbers
- Use consistent formatting (all with zeros, or all without)
- Match the format used in your PDF documents
- Keep leading zeros if that's how they appear in PDFs (e.g., 0099 not 99)

## Common Errors and Solutions

### Error: "Excel dosyanızda eksik kritik sütun başlıkları var"
**Problem:** Missing required columns

**Solution:** Ensure your file has both "Ad Soyad" and "Okul No" columns with exact spelling

### Error: No students imported
**Problem:** Empty or invalid data in required fields

**Solution:** 
- Check that "Ad Soyad" column has at least 2-word names
- Verify "Okul No" column is not empty
- Remove any rows with "nan" or empty values

### Students not found during PDF parsing
**Problem:** Names in Excel don't match names in PDF

**Solution:**
- Compare names character by character
- Check for extra spaces
- Ensure same capitalization
- Look for special characters (Turkish characters: ğ, ü, ş, ı, ö, ç)

## Example Excel Files

Create a test file with sample data to verify your format is correct:

**Example 1: Minimal (Required fields only)**
```
Ad Soyad        | Okul No
AHMET YILMAZ    | 001
ZEYNEP KARA     | 002
MEHMET ALI DEMIR| 003
```

**Example 2: Complete (All fields)**
```
Ad Soyad     | Okul No | Anne Adı Soyadı | Anne E-posta    | Anne Telefon | Baba Adı Soyadı | Baba E-posta    | Baba Telefon
AHMET YILMAZ | 001     | AYŞE YILMAZ     | ayse@email.com  | 5551111111   | MEHMET YILMAZ   | mehmet@email.com| 5552222222
```

## After Import

Once imported successfully:
1. Go to the Settings page
2. Verify the student count is correct
3. Check the student table to ensure all data is displayed properly
4. Make any necessary corrections using the Edit function

## Bulk Updates

To update existing students:
1. Export or note current student data
2. Prepare an Excel file with both existing and new students
3. Upload the file - it will add new students and update existing ones based on names
4. Names are used as unique identifiers, so updating a name will create a new student entry

