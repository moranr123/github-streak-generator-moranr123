# Github stats generator

A web application to generate beautiful GitHub contribution streak cards with customizable themes and export options.

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

## Deployment

### Railway Deployment

This project is configured for deployment on Railway. Follow these steps:

#### Prerequisites
- A Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository with your code
- GitHub Personal Access Token (for backend API calls)

#### Backend Deployment

1. **Create a new Railway project**
   - Go to [railway.app](https://railway.app) and create a new project
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Backend Service**
   - Add a new service and select "GitHub Repo"
   - Set the **Root Directory** to `backend`
   - Railway will automatically detect the Dockerfile

3. **Set Environment Variables**
   - Go to the backend service → Variables tab
   - Add the following variables:
     ```
     GITHUB_TOKEN=your_github_token_here
     PORT=5000
     LOG_LEVEL=info
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend.railway.app
     ```
   - **Important**: Replace `your-frontend.railway.app` with your actual frontend URL (you'll get this after deploying the frontend, or update it later)
   - Railway will automatically assign a `PORT` - you can use `${{PORT}}` or keep `5000`

4. **Deploy**
   - Railway will automatically build and deploy
   - Note the generated URL (e.g., `https://your-backend.railway.app`)

#### Frontend Deployment

1. **Add Frontend Service**
   - In the same Railway project, add another service
   - Select "GitHub Repo" again
   - Set the **Root Directory** to `frontend`

2. **Set Environment Variables**
   - Go to the frontend service → Variables tab
   - Add:
     ```
     VITE_API_BASE_URL=https://your-backend.railway.app/api/streak
     PORT=5173
     NODE_ENV=production
     ```
   - Replace `your-backend.railway.app` with your actual backend URL

3. **Deploy**
   - Railway will build the frontend and deploy
   - The frontend will be available at the generated URL

#### Post-Deployment

1. **Update CORS settings**
   - After deploying the frontend, update the backend's `FRONTEND_URL` environment variable
   - Go to backend service → Variables → Update `FRONTEND_URL` with your frontend URL
   - The backend will automatically restart and apply the new CORS settings

2. **Test the deployment**
   - Visit your frontend URL
   - Generate a streak card to verify everything works
   - Check browser console for any CORS errors

#### Railway Configuration Files

The project includes:
- `backend/Dockerfile` - Docker configuration for backend (required for Canvas native dependencies)
- `backend/railway.json` - Railway configuration for backend
- `frontend/railway.json` - Railway configuration for frontend
- `frontend/server.js` - Express server to serve built frontend files

#### Troubleshooting

- **Canvas build errors**: The Dockerfile includes all required native dependencies
- **CORS errors**: Ensure `VITE_API_BASE_URL` matches your backend URL exactly
- **Port issues**: Railway automatically assigns ports - use `process.env.PORT` in your code
- **Build failures**: Check Railway logs for specific error messages

## Testing

### Frontend Tests
```bash
cd frontend
npm test              # Run tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Backend Tests
```bash
cd backend
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Project Structure

```
github-streak-generator/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions and constants
│   │   ├── test/          # Test setup files
│   │   └── App.jsx        # Main application component
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/   # Express middleware (logging, etc.)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic services
│   │   ├── utils/        # Utility functions
│   │   └── app.js        # Express app setup
│   └── package.json
└── README.md
```

## API Documentation

For complete API documentation, including all endpoints, parameters, rate limits, and usage examples, see [API.md](./API.md).

### Quick Reference

**Base URL**: `http://localhost:5000/api/streak`

**Main Endpoints**:
- `GET /health` - Health check
- `GET /:username` - Get streak data (JSON)
- `GET /card/:username` - Generate streak card (PNG image)
- `GET /cache/stats` - Get cache statistics
- `DELETE /cache` - Clear cache

**Rate Limits**:
- General API: 100 requests per 15 minutes
- Card generation: 30 requests per 15 minutes
- Cache management: 10 requests per 15 minutes

## Development

### Code Organization

The codebase follows a modular structure:

- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for shared logic
- **Utils**: Utility functions and constants
- **Middleware**: Express middleware for logging and error handling

### Adding New Features

1. Create feature branch
2. Write tests first (TDD approach)
3. Implement feature
4. Update documentation
5. Submit pull request

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License
