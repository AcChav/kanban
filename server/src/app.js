import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/task.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Normalize CLIENT_URL to remove trailing slashes if present
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/+$/, '') : '*';

app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use('/api', taskRoutes);

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});