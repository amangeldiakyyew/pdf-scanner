# PDF Scanner - Student Management & PDF Parsing System

A modern Node.js web application for managing student records and automatically parsing PDF documents to extract individual student reports.

## Features

### 📂 Student Management (Settings)
- Create and manage multiple classes
- Add, edit, and delete students
- Store comprehensive student information (name, school number, parent contacts)
- Bulk import students via Excel files
- View all students in a organized table

### ⚙️ PDF Parsing
- Upload PDF files containing multiple student reports
- Automatically extract individual student pages based on name matching
- Download extracted reports as individual PDFs or ZIP archives
- Support for both school number and name-based file naming
- Handle duplicate entries with automatic numbering
- Review matched text context for verification
- Delete unwanted reports before downloading

## Technology Stack

- **Backend**: Node.js with Hono framework
- **PDF Processing**: pdf-lib, pdf-parse
- **Excel Processing**: xlsx
- **File Compression**: archiver
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Storage**: JSON file-based storage

## Installation

### Prerequisites
- Node.js 18+ installed on your system

### Setup Steps

1. **Navigate to the project directory:**
   ```bash
   cd pdf-scanner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Adding Students

1. Go to the **Settings** page
2. Create a new class or select an existing one
3. Add students individually or upload an Excel file with student data

**Excel Format Requirements:**
The Excel file should have the following columns:
- Ad Soyad (Full Name)
- Okul No (School Number)
- Anne Adı Soyadı (Mother's Full Name)
- Anne E-posta (Mother's Email)
- Anne Telefon (Mother's Phone)
- Baba Adı Soyadı (Father's Full Name)
- Baba E-posta (Father's Email)
- Baba Telefon (Father's Phone)

### Parsing PDFs

1. Go to the **PDF Parsing** page
2. Select the class whose students you want to find in the PDF
3. Upload the PDF file containing student reports
4. Click "Ayrıştırma İşlemini Başlat" (Start Parsing)
5. Review the results:
   - See which students were found
   - View the matched text context
   - Download individual PDFs or create ZIP archives
   - Remove unwanted matches

### Download Options

- **ZIP (School Number)**: Files named by school numbers (e.g., 001.pdf, 002.pdf)
- **ZIP (Name)**: Files named by student names (e.g., JOHN DOE.pdf)
- **Individual Download**: Download specific reports one by one

## Project Structure

```
pdf-scanner/
├── src/
│   ├── server.js           # Main Hono server
│   ├── dataManager.js      # JSON data storage handler
│   └── pdfParser.js        # PDF parsing logic
├── public/
│   ├── settings.html       # Student management page
│   ├── pdf-parsing.html    # PDF parsing page
│   ├── css/
│   │   └── style.css       # Application styles
│   └── js/
│       ├── settings.js     # Settings page logic
│       └── pdf-parsing.js  # PDF parsing page logic
├── data/
│   └── student_data.json   # Student data storage (auto-created)
├── package.json
└── README.md
```

## API Endpoints

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create a new class
- `DELETE /api/classes/:className` - Delete a class

### Students
- `GET /api/classes/:className/students` - Get students for a class
- `POST /api/classes/:className/students` - Add a student
- `PUT /api/classes/:className/students/:oldName` - Update a student
- `DELETE /api/classes/:className/students/:studentName` - Delete a student
- `POST /api/classes/:className/upload-excel` - Bulk import from Excel

### PDF Operations
- `POST /api/parse-pdf` - Parse PDF and extract student pages
- `GET /api/download-pdf/:reportId` - Download single report
- `GET /api/download-zip/:namingMode` - Download all reports as ZIP
- `DELETE /api/reports/:reportId` - Delete a report from results

## Configuration

The server runs on port 3000 by default. To change the port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Data Storage

Student data is stored in `data/student_data.json`. The file is automatically created on first run. Back up this file regularly to prevent data loss.

## Troubleshooting

### Students not found in PDF
- Ensure student names in the system match exactly with names in the PDF
- Names must have at least 2 parts (first name and last name)
- Check for spelling differences or extra spaces

### PDF parsing errors
- Ensure the PDF is not password-protected
- Verify the PDF contains searchable text (not just images)
- Large PDFs may take longer to process

### Excel import issues
- Verify column headers match exactly (case-sensitive)
- Ensure the Excel file is .xlsx format
- Check that required fields (Ad Soyad, Okul No) are not empty

## Performance Notes

- PDF parsing speed depends on file size and number of pages
- For best performance, keep individual PDFs under 100 pages
- The application stores parse results in memory (suitable for single-user scenarios)

## License

MIT

## Support

For issues, questions, or feature requests, please contact your system administrator.

