import express from 'express';
import cors from 'cors';
import whisperRouter from './whisper.js';

const app = express();

app.use(cors());
app.use('/api', whisperRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Whisper server running on http://localhost:${PORT}`);
});
