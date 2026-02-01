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

// Multer upload dir (absolute, safe)
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
});

router.post('/transcribe', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const audioPath = req.file.path;
  const whisperScript = path.join(__dirname, 'transcribe.py');

  const python = spawn('python3', [whisperScript, audioPath]);

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  python.on('close', (code) => {
    fs.unlinkSync(audioPath);

    if (code !== 0) {
      console.error('Whisper error:', errorOutput);
      return res.status(500).json({ error: 'Transcription failed' });
    }

    try {
      const result = JSON.parse(output);
      res.json({ text: result.text });
    } catch (err) {
      console.error('JSON parse error:', err, output);
      res.status(500).json({ error: 'Invalid transcription output' });
    }
  });
});

export default router;
