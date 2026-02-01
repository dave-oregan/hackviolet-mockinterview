import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Resolve __dirname (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Multer upload dir
const upload = multer({ dest: uploadsDir });

router.post('/transcribe', upload.single('file'), (req, res) => {
  // DEBUG: Check if route is hit
  console.log("1. Endpoint /api/transcribe hit");

  if (!req.file) {
    console.log("Error: No file received");
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // DEBUG: Confirm file details
  console.log(`2. File received: ${req.file.originalname} -> Saved to ${req.file.path}`);

  const audioPath = req.file.path;
  const whisperScript = path.join(__dirname, 'transcribe.py');

  const python = spawn('python3', [whisperScript, audioPath]);

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    // DEBUG: See the raw data Python is sending back
    console.log(`3. Python Raw STDOUT: ${data.toString()}`);
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    // DEBUG: Print Python logs/errors immediately
    // This catches print(..., file=sys.stderr) from Python
    console.error(`[Python Log]: ${data.toString()}`);
    errorOutput += data.toString();
  });

  python.on('close', (code) => {
    // fs.unlinkSync(audioPath); // Recommendation: Comment this out while debugging so you can check if the file actually exists on disk

    console.log(`4. Python process exited with code ${code}`);

    if (code !== 0) {
      console.error('Whisper error:', errorOutput);
      return res.status(500).json({ error: 'Transcription failed' });
    }

    try {
      const result = JSON.parse(output);
      console.log("5. Success! Sending text back to frontend.");
      res.json({ text: result.text });
    } catch (err) {
      console.error('JSON parse error:', err);
      console.error('Raw Output causing error:', output); // Very helpful to see what broke the JSON
      res.status(500).json({ error: 'Invalid transcription output' });
    }
  });
});

export default router;
