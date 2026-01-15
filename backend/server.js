const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// In-memory storage for enrolled fingerprints (demo purposes)
let enrolledFingerprints = [];

// Basic image similarity function (demo implementation)
const calculateSimilarity = async (image1Path, image2Path) => {
  try {
    // Process images to same size for comparison
    const img1 = await sharp(image1Path)
      .resize(200, 200)
      .greyscale()
      .raw()
      .toBuffer();
    
    const img2 = await sharp(image2Path)
      .resize(200, 200)
      .greyscale()
      .raw()
      .toBuffer();

    // Simple pixel difference calculation
    let differences = 0;
    for (let i = 0; i < img1.length; i++) {
      differences += Math.abs(img1[i] - img2[i]);
    }
    
    // Convert to similarity percentage (simplified)
    const maxDifference = img1.length * 255;
    const similarity = ((maxDifference - differences) / maxDifference) * 100;
    
    return similarity;
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'FingerAuth Backend API' });
});

// Enroll fingerprint
app.post('/api/enroll', upload.single('fingerprint'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No fingerprint image provided' });
    }

    const fingerprintData = {
      id: Date.now().toString(),
      filename: req.file.filename,
      path: req.file.path,
      enrolledAt: new Date().toISOString()
    };

    enrolledFingerprints.push(fingerprintData);

    res.json({
      success: true,
      message: 'Fingerprint enrolled successfully',
      id: fingerprintData.id
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll fingerprint' });
  }
});

// Authenticate fingerprint
app.post('/api/authenticate', upload.single('fingerprint'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No fingerprint image provided' });
    }

    if (enrolledFingerprints.length === 0) {
      return res.json({
        success: false,
        message: 'No enrolled fingerprints found. Please enroll first.'
      });
    }

    let bestMatch = null;
    let highestSimilarity = 0;

    // Compare with all enrolled fingerprints
    for (const enrolled of enrolledFingerprints) {
      const similarity = await calculateSimilarity(req.file.path, enrolled.path);
      
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = enrolled;
      }
    }

    // Threshold for successful authentication (demo: 70%)
    const threshold = 70;
    const isAuthenticated = highestSimilarity >= threshold;

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: isAuthenticated,
      message: isAuthenticated 
        ? `Authentication successful! Similarity: ${highestSimilarity.toFixed(2)}%`
        : `Authentication failed. Similarity: ${highestSimilarity.toFixed(2)}% (threshold: ${threshold}%)`,
      similarity: highestSimilarity,
      matchedId: bestMatch?.id
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Failed to authenticate fingerprint' });
  }
});

// Get enrolled fingerprints count
app.get('/api/enrolled', (req, res) => {
  res.json({
    count: enrolledFingerprints.length,
    fingerprints: enrolledFingerprints.map(fp => ({
      id: fp.id,
      enrolledAt: fp.enrolledAt
    }))
  });
});

// Clear all enrolled fingerprints (for demo/testing)
app.delete('/api/clear', (req, res) => {
  // Clean up files
  enrolledFingerprints.forEach(fp => {
    if (fs.existsSync(fp.path)) {
      fs.unlinkSync(fp.path);
    }
  });
  
  enrolledFingerprints = [];
  
  res.json({
    success: true,
    message: 'All enrolled fingerprints cleared'
  });
});

app.listen(PORT, () => {
  console.log(`FingerAuth backend running on port ${PORT}`);
});