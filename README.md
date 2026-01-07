# Github stats generator

A web application to generate beautiful GitHub contribution streak cards with customizable themes and export options.

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

## API Endpoints

### GET `/api/streak/:username`
Get streak data in JSON format

### GET `/api/streak/card/:username`
Get streak card as PNG image

#### Query Parameters
- `theme` - Theme color (hex without #)
- `fontSize` - Font size (small, normal, large)
- `hideAvatar` - Hide profile image (true/false)
- `cardWidth` - Card width in pixels (400-2000)
- `cardHeight` - Card height in pixels (200-1200)

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
