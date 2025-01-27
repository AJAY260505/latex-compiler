const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Queue = require('bull');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

// Redis and Queue Setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.on('error', (err) => console.error('Redis error:', err));

const compileQueue = new Queue('compilation', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

// File Upload Setup
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/x-tex' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .tex files are allowed'));
    }
  }
});

// Temporary Directory Setup
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Compile LaTeX Function
const compileLatex = (latex, jobDir) => {
  const texPath = path.join(jobDir, 'resume.tex');
  fs.writeFileSync(texPath, latex);

  // Compile LaTeX
  const { stdout, stderr } = execSync(
    `pdflatex -interaction=nonstopmode -output-directory=${jobDir} ${texPath}`,
    { timeout: 10000 }
  );

  // Parse errors
  const errors = parseLatexErrors(stderr?.toString());
  if (errors.length > 0) {
    throw new Error(`Compilation failed: ${errors.join(', ')}`);
  }

  return fs.readFileSync(path.join(jobDir, 'resume.pdf'));
};

// Error Parser
const parseLatexErrors = (log) => {
  if (!log) return [];
  const errorRegex = /! (.*)\n(?:l\.(\d+))?/g;
  return [...log.matchAll(errorRegex)].map(match => ({
    message: match[1],
    line: parseInt(match[2]) || null
  }));
};

// Compile Endpoint
app.post('/compile', upload.single('file'), async (req, res) => {
  try {
    const latex = req.body.latex || (req.file ? fs.readFileSync(req.file.path, 'utf-8') : '');
    if (!latex) {
      return res.status(400).json({ error: 'No LaTeX content provided' });
    }

    const jobId = uuidv4();
    const jobDir = path.join(tempDir, jobId);
    fs.mkdirSync(jobDir);

    // Add job to queue
    const job = await compileQueue.add({ latex, jobDir });

    job.on('completed', (result) => {
      res.set('Content-Type', 'application/pdf');
      res.send(result);
    });

    job.on('failed', (error) => {
      res.status(500).json({ error: error.message });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Compilation failed',
      log: error.stderr?.toString() || error.message
    });
  } finally {
    // Cleanup uploaded file
    if (req.file) fs.unlinkSync(req.file.path);
  }
});

// Queue Processor
compileQueue.process(async (job) => {
  const { latex, jobDir } = job.data;
  try {
    const pdf = compileLatex(latex, jobDir);
    return pdf;
  } catch (error) {
    throw error;
  } finally {
    // Cleanup job directory
    if (fs.existsSync(jobDir)) fs.rmSync(jobDir, { recursive: true, force: true });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Compiler running on port ${PORT}`));