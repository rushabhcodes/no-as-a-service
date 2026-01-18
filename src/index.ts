import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(cors());
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON using file-based path (works regardless of cwd)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reasonsPath = path.join(__dirname, 'reasons.json');
const reasons = JSON.parse(fs.readFileSync(reasonsPath, 'utf-8'));


// Random rejection reason endpoint
interface ReasonResponse {
    reason: string;
}

// Root endpoint for basic health/info
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    message: 'No-as-a-Service is running',
    hint: 'Try GET /no for a random rejection reason'
  });
});

app.get('/no', (_req: express.Request, res: express.Response<ReasonResponse>) => {
    const reason: string = reasons[Math.floor(Math.random() * reasons.length)];
    res.json({ reason });
});

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
});