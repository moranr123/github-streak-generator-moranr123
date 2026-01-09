# GitHub Stats Generator

A web application to generate beautiful GitHub contribution streak cards with customizable themes and export options.

🌐 **Live Demo**: [https://github-stats-generator.up.railway.app/](https://github-stats-generator.up.railway.app/)

## Credits

This project is based on the original work by [DenverCoder1](https://github.com/DenverCoder1). We extend our gratitude for the initial implementation and inspiration.

## Features

- 🎨 Multiple theme options
- 📱 Responsive design with dark mode support
- ⚡ Performance optimizations (debouncing, lazy loading, compression)
- ♿ Accessibility improvements (ARIA labels, keyboard navigation)
- 🔄 Automatic retry mechanism for failed requests
- 📊 Rate limit monitoring
- 🌐 Offline detection
- 🧪 Comprehensive test suite
- 📝 Structured logging

## Tech Stack

### Frontend
- React 19
- Vite
- Vitest for testing

### Backend
- Node.js
- Express
- Canvas for image generation
- Pino for logging
- Jest for testing

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd github-streak-generator
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables

Create a `.env` file in the `backend` directory:
```
GITHUB_TOKEN=your_github_token_here
PORT=5000
LOG_LEVEL=info
NODE_ENV=development
```

Create a `.env` file in the `frontend` directory:
```
VITE_API_BASE_URL=http://localhost:5000/api/streak
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm start
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## SEO Optimization

This project includes comprehensive SEO optimization:

- **Meta Tags**: Complete meta description, keywords, and Open Graph tags
- **Structured Data**: JSON-LD schema markup for better search engine understanding
- **Sitemap**: XML sitemap for search engine crawling
- **Robots.txt**: Properly configured robots.txt file
- **Canonical URLs**: Prevents duplicate content issues

### Google Search Console Setup

To improve your Google search rankings:

1. **Submit your sitemap**:
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your property: `https://github-stats-generator.up.railway.app/`
   - Navigate to Sitemaps section
   - Submit: `https://github-stats-generator.up.railway.app/sitemap.xml`

2. **Request Indexing**:
   - Use the URL Inspection tool
   - Request indexing for your main page

3. **Monitor Performance**:
   - Check search performance regularly
   - Monitor Core Web Vitals
   - Track keyword rankings

### Additional SEO Tips

- **Content**: Add a blog or documentation section with relevant keywords
- **Backlinks**: Get links from GitHub repositories, tech blogs, and developer communities
- **Social Sharing**: Share on Twitter, Reddit (r/webdev, r/github), and Hacker News
- **Regular Updates**: Keep the site updated and add new features
- **Page Speed**: Ensure fast loading times (already optimized with compression)

