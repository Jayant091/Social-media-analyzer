const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/bmp',
    'image/tiff'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfParser = new pdfParse();
    const data = await pdfParser(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

const extractTextFromImage = async (filePath) => {
  try {
    const result = await Tesseract.recognize(
      filePath,
      'eng',
      {
        logger: m => console.log(m)
      }
    );
    return result.data.text;
  } catch (error) {
    throw new Error('Failed to extract text from image: ' + error.message);
  }
};

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    let extractedText = '';

    try {
      if (mimeType === 'application/pdf') {
        extractedText = await extractTextFromPDF(filePath);
      } else if (mimeType.startsWith('image/')) {
        extractedText = await extractTextFromImage(filePath);
      } else {
        throw new Error('Unsupported file type');
      }

      res.json({
        success: true,
        text: extractedText
      });

    } finally {
      deleteFile(filePath);
    }

  } catch (error) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'File processing API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
