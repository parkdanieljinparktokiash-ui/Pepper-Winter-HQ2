# Hyprlynk Trade Portal

A comprehensive trading journal and analytics platform that connects to brokerage APIs for automatic trade import, performance tracking, rule management, and advanced analytics.

## Features

### Core Features
- **Dashboard**: Real-time P&L tracking, win rate metrics, Zella Score radar chart, and calendar heatmap
- **Trade Management**: Full CRUD operations for trades with CSV import support
- **Authentication**: Secure JWT-based authentication system
- **Analytics**: Advanced performance metrics and visualizations
- **Day View**: Daily trade summaries and performance tracking
- **Notebook**: Rich text editor for trade notes and journals
- **Reports**: Comprehensive performance reports with PDF export
- **Progress Tracker**: Daily checklist and rule tracking
- **Settings**: User profile and broker account management

### Tech Stack

**Backend:**
- Node.js + Express.js + TypeScript
- PostgreSQL database
- JWT authentication
- Bull/BullMQ for background jobs
- Redis for job queue

**Frontend:**
- React + TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- Zustand for state management
- React Router for navigation
- Axios for API calls

**Deployment:**
- Docker + Docker Compose
- PostgreSQL 15
- Redis 7

## Getting Started

### Prerequisites
- Node.js 22+
- Docker and Docker Compose
- PostgreSQL 15 (if running locally)
- Redis 7 (if running locally)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hyprlynk-trade-portal
```

2. Set up environment variables:

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

3. Install dependencies:

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Running with Docker

The easiest way to run the entire stack:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 5000
- Frontend on port 3000

Access the application at: http://localhost:3000

### Running Locally (Development)

1. Start PostgreSQL and Redis (or use Docker for just these services):
```bash
docker-compose up -d postgres redis
```

2. Start the backend:
```bash
cd backend
npm run dev
```

3. Start the frontend:
```bash
cd frontend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Trades
- `GET /api/trades` - Get all trades (with filters)
- `GET /api/trades/:id` - Get single trade
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `POST /api/trades/bulk-delete` - Delete multiple trades

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/calendar-heatmap` - Get calendar heatmap data

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `accounts` - Broker accounts
- `trades` - Trade records
- `daily_summaries` - Daily performance summaries
- `rules` - Trading rules
- `rule_checks` - Rule compliance tracking
- `notebooks` - Journal entries
- `strategies` - Trading strategies
- `import_history` - CSV import history

## Project Structure

```
hyprlynk-trade-portal/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── database/        # Database schema and init
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Main server file
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and API client
│   │   ├── store/           # Zustand stores
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon and ts-node
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on port 3000
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build  # Compiles TypeScript to dist/
npm start      # Runs compiled code
```

**Frontend:**
```bash
cd frontend
npm run build  # Creates optimized production build
```

## Future Enhancements

- Real-time position monitoring from broker APIs
- AI-powered trade analysis and pattern recognition
- Advanced analytics (MAE/MFE analysis, time-of-day heatmaps)
- Mobile PWA support
- Collaborative features and strategy sharing
- Integration with Alpaca, Interactive Brokers, TD Ameritrade APIs
- Automated trade sync with Bull/BullMQ

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
