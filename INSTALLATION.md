# Installation Guide

## Quick Start

### 1. Install Node.js
Make sure you have Node.js 18 or higher installed. Download from: https://nodejs.org/

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Dependencies

Navigate to the pdf-scanner folder and run:

```bash
cd pdf-scanner
npm install
```

This will install all required packages:
- hono (web framework)
- @hono/node-server (Node.js adapter)
- pdf-lib (PDF manipulation)
- pdf-parse (PDF text extraction)
- xlsx (Excel file processing)
- archiver (ZIP file creation)
- multer (file upload handling)
- uuid (unique ID generation)

### 3. Start the Application

For production:
```bash
npm start
```

For development (with auto-reload on file changes):
```bash
npm run dev
```

### 4. Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Changing the Port

If port 3000 is already in use, you can specify a different port:

**Windows (PowerShell):**
```powershell
$env:PORT=8080; npm start
```

**Windows (Command Prompt):**
```cmd
set PORT=8080 && npm start
```

**macOS/Linux:**
```bash
PORT=8080 npm start
```

## Troubleshooting

### Issue: `npm install` fails

**Solution 1:** Clear npm cache
```bash
npm cache clean --force
npm install
```

**Solution 2:** Delete node_modules and reinstall
```bash
rm -rf node_modules
npm install
```

### Issue: Port already in use

**Solution:** Either change the port (see above) or find and stop the process using port 3000:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill
```

### Issue: PDF parsing not working

**Possible causes:**
1. PDF is password-protected - Remove password first
2. PDF contains only images - Use OCR software to make it searchable
3. Student names don't match exactly - Check spelling and formatting

### Issue: Excel import fails

**Solution:** Ensure your Excel file has these exact column headers:
- Ad Soyad
- Okul No
- Anne Adı Soyadı
- Anne E-posta
- Anne Telefon
- Baba Adı Soyadı
- Baba E-posta
- Baba Telefon

## Data Backup

Your student data is stored in:
```
pdf-scanner/data/student_data.json
```

**Important:** Regularly back up this file to prevent data loss!

## System Requirements

- **OS**: Windows 10+, macOS 10.14+, or Linux
- **Node.js**: 18.0.0 or higher
- **RAM**: 2GB minimum (4GB+ recommended for large PDFs)
- **Disk Space**: 500MB for application + storage for PDFs

## Browser Compatibility

The application works best with modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Production Deployment

For deploying to a production server:

1. Set NODE_ENV to production:
   ```bash
   export NODE_ENV=production
   ```

2. Consider using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name pdf-scanner
   pm2 startup
   pm2 save
   ```

3. Set up a reverse proxy (nginx/Apache) for better security and performance

4. Enable HTTPS for secure connections

## Getting Help

If you encounter issues not covered here:
1. Check the main README.md for usage instructions
2. Review the browser console for error messages
3. Check the server logs for backend errors
4. Ensure all dependencies are properly installed

