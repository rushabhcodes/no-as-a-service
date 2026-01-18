import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

const app = express();

app.use(cors());
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON using file-based path (works regardless of cwd)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reasonsPath = path.join(__dirname, 'reasons.json');
const reasons = JSON.parse(fs.readFileSync(reasonsPath, 'utf-8'));

// Rate limiter: 120 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  keyGenerator: (req) => {
    const headerIp = req.headers['cf-connecting-ip'];
    if (Array.isArray(headerIp)) {
      return headerIp[0];
    }
    if (headerIp) {
      return headerIp;
    }
    return ipKeyGenerator(req); // IPv4/IPv6 safe fallback
  },
  message: { error: "Too many requests, please try again later. (120 reqs/min/IP)" }
});

app.use(limiter);

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