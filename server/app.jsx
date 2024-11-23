const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert');
const PDFLib = require('pdf-lib');
const cors = require('cors');
const { exec } = require('child_process'); // To use qpdf for password protection

// Initialize the app
const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Set up multer for file uploads
const upload = multer({
    dest: 'uploads/', // Directory to store uploaded files temporarily
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
});

// Route: Health Check
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Route: Convert DOCX to PDF
app.post('/convert', upload.single('file'), async (req, res) => {
    const filePath = req.file?.path; // Path to the uploaded file
    const outputExt = '.pdf';       // Desired output file extension
    const outputPath = `${filePath}${outputExt}`;
    const password = req.body.password; // Password (if provided)

    if (!filePath) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        console.log(`Converting file: ${filePath}`);

        // Read the uploaded file
        const docBuffer = fs.readFileSync(filePath);

        // Convert the file to PDF using LibreOffice
        const pdfBuffer = await new Promise((resolve, reject) => {
            libre.convert(docBuffer, outputExt, undefined, (err, done) => {
                if (err) {
                    console.error('LibreOffice conversion error:', err);
                    return reject('Error converting file.');
                }
                resolve(done);
            });
        });

        let finalPdfBuffer = pdfBuffer;

        // Save the generated PDF file temporarily
        const tempPdfPath = path.resolve(__dirname, 'uploads', `${req.file.filename}_temp.pdf`);
        fs.writeFileSync(tempPdfPath, finalPdfBuffer);

        // If a password is provided, protect the PDF using qpdf
        if (password) {
            const protectedPdfPath = path.resolve(__dirname, 'uploads', `${req.file.filename}_protected.pdf`);
            
            // Command to apply password protection using qpdf
            const qpdfCommand = `qpdf --encrypt ${password} ${password} 256 -- ${tempPdfPath} ${protectedPdfPath}`;
            
            exec(qpdfCommand, (err, stdout, stderr) => {
                if (err) {
                    console.error('qpdf error:', err);
                    return res.status(500).send('Error adding password protection.');
                }

                console.log('Password protection added with qpdf.');

                // Send the protected PDF as the response
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace('.docx', '.pdf')}"`);
                res.sendFile(protectedPdfPath, (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                        res.status(500).send('Error sending file');
                    } else {
                        // Cleanup: Remove temporary files
                        fs.unlinkSync(filePath);
                        fs.unlinkSync(tempPdfPath);
                        fs.unlinkSync(protectedPdfPath);
                    }
                });
            });
        } else {
            // If no password, send the PDF without protection
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${req.file.originalname.replace('.docx', '.pdf')}"`);
            res.sendFile(tempPdfPath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).send('Error sending file');
                } else {
                    // Cleanup: Remove temporary files
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(tempPdfPath);
                }
            });
        }

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).send('Internal server error.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
