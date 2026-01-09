import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;

// Serve robots.txt with proper content type
app.get('/robots.txt', (req, res) => {
  const robotsPath = join(__dirname, 'dist', 'robots.txt');
  if (existsSync(robotsPath)) {
    res.type('text/plain');
    res.sendFile(robotsPath);
  } else {
    res.status(404).send('robots.txt not found');
  }
});

// Serve sitemap.xml with proper content type and headers
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = join(__dirname, 'dist', 'sitemap.xml');
  if (existsSync(sitemapPath)) {
    res.type('application/xml');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(sitemapPath);
  } else {
    res.status(404).type('application/xml').send('<?xml version="1.0"?><error>Sitemap not found</error>');
  }
});

// Serve static files from the dist directory (after specific routes)
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    }
  }
}));

// Handle client-side routing - return index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
