import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Blog API is running' });
});

// Placeholder routes
app.get('/api/posts', (req, res) => {
  res.json({ message: 'Get all blog posts' });
});

app.get('/api/posts/:id', (req, res) => {
  res.json({ message: `Get blog post ${req.params.id}` });
});

app.post('/api/posts', (req, res) => {
  res.json({ message: 'Create new blog post' });
});

app.put('/api/posts/:id', (req, res) => {
  res.json({ message: `Update blog post ${req.params.id}` });
});

app.delete('/api/posts/:id', (req, res) => {
  res.json({ message: `Delete blog post ${req.params.id}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Blog API server running on port ${PORT}`);
});
