# Piloo.ai - AI-Powered CCTV Monitoring Platform

**Copyright © 2025 Pyrack Solutions Pvt. Ltd.**  
Website: https://pyrack.com/  
Licensed under the MIT License

## Overview

Piloo.ai is a sophisticated AI-powered CCTV monitoring platform that provides comprehensive surveillance analysis through advanced administrative interfaces and intelligent monitoring technologies. Named after a Jack Russell terrier, this platform combines cutting-edge AI capabilities with user-friendly interfaces to deliver enterprise-grade security monitoring solutions.

## Features

### 🎯 Interactive Onboarding & Gamification
- **Step-by-step tutorial system** with progress tracking
- **Achievement system** with points and badges
- **Gamified learning experience** for new users
- **Progress analytics** and completion tracking

### 🔒 Comprehensive Security Monitoring
- **Real-time camera feeds** with live monitoring
- **AI-powered alert system** for intrusion detection
- **Zone-based monitoring** with customizable security areas
- **Motion detection** and automated alerts
- **Employee tracking** and attendance monitoring

### 🤖 AI-Powered Search & Analysis
- **Natural language query interface** for footage search
- **ChatGPT-like conversational AI** for CCTV queries
- **Intelligent video analysis** and pattern recognition
- **Advanced search filters** and analytics

### 📊 Analytics & Reporting
- **Real-time dashboard** with system overview
- **Incident tracking** and trend analysis
- **Activity heatmaps** and occupancy patterns
- **Camera performance monitoring**
- **Comprehensive reporting** tools

### 👥 Multi-Tier Administration
- **Role-based access control** (Admin, Manager, Viewer)
- **Client management system** for service providers
- **Subscription management** with camera-based pricing
- **User management** and permissions

### 🎨 Modern User Interface
- **Responsive design** with TailwindCSS
- **Dark/light mode support**
- **Mobile-friendly interface**
- **Real-time WebSocket updates**

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Shadcn/UI** component library
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database with Drizzle ORM
- **WebSocket** support for real-time updates
- **Session-based authentication**

### DevOps & Deployment
- **Docker** containerization
- **Ubuntu** deployment ready
- **Nginx** reverse proxy configuration
- **Environment-based configuration**

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd piloo-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/piloo_ai

# Session
SESSION_SECRET=your-session-secret

# Optional: AI Services
OPENAI_API_KEY=your-openai-api-key

# Optional: Email Services
SENDGRID_API_KEY=your-sendgrid-api-key

# Optional: Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

## API Documentation

The platform provides a comprehensive RESTful API. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - User logout

#### Cameras & Monitoring
- `GET /api/cameras` - List all cameras
- `GET /api/live-feed/:id` - Get live camera feed
- `POST /api/cameras` - Add new camera

#### Alerts & Security
- `GET /api/alerts` - Get security alerts
- `POST /api/alerts` - Create new alert
- `GET /api/zones` - Get monitoring zones

#### Onboarding & Gamification
- `GET /api/onboarding/progress` - Get user progress
- `GET /api/onboarding/steps` - Get tutorial steps
- `POST /api/onboarding/complete-step/:id` - Complete step
- `GET /api/achievements` - Get available achievements

## Database Schema

The application uses PostgreSQL with Drizzle ORM. Key tables include:

- **users** - User accounts and authentication
- **cameras** - Camera configuration and status
- **alerts** - Security alerts and incidents
- **zones** - Monitoring zones and boundaries
- **recordings** - Video recordings metadata
- **user_progress** - Gamification progress tracking
- **achievements** - Achievement definitions
- **onboarding_steps** - Tutorial step definitions

## Deployment

### Docker Deployment

1. **Build the Docker image**
```bash
docker build -t piloo-ai .
```

2. **Run with Docker Compose**
```bash
docker-compose up -d
```

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Set up Nginx** (see `nginx/default.conf`)

3. **Configure systemd service** (see `DEPLOYMENT.md`)

4. **Set up SSL certificates**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Development

### Project Structure
```
piloo-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and config
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema
├── nginx/                  # Nginx configuration
└── scripts/                # Build and deployment scripts
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database studio
npm run type-check   # Run TypeScript type checking
```

### Adding New Features

1. **Database Changes**: Update `shared/schema.ts` and run `npm run db:push`
2. **API Endpoints**: Add routes in `server/routes.ts`
3. **Frontend Components**: Create in `client/src/components/`
4. **Pages**: Add to `client/src/pages/` and register in `App.tsx`

## Gamification System

The platform includes a comprehensive gamification system to enhance user engagement:

### Features
- **Progressive Tutorial**: 6-step onboarding process
- **Achievement System**: Points and badges for completing tasks
- **Progress Tracking**: Visual progress indicators
- **Interactive Tutorials**: Step-by-step guided experience

### Tutorial Steps
1. Welcome to Piloo.ai (10 points)
2. View Live Camera Feeds (15 points)
3. Set Up Camera Zones (20 points)
4. Review Security Alerts (15 points)
5. Try AI-Powered Search (25 points)
6. Configure User Settings (15 points)

### Achievements
- **First Steps**: Complete first onboarding step
- **Getting Started**: Complete 3 steps
- **Tutorial Master**: Complete all steps
- **Security Expert**: Complete security-related steps
- **Monitor Master**: Complete monitoring steps
- **AI Explorer**: Use AI search feature

## Security Features

### Authentication & Authorization
- Session-based authentication
- Role-based access control (Admin, Manager, Viewer)
- Secure password handling
- Session timeout management

### Data Security
- PostgreSQL database with encrypted connections
- Secure API endpoints with authentication
- CORS protection
- Input validation and sanitization

### Monitoring Security
- Real-time intrusion detection
- Motion detection algorithms
- Zone-based security monitoring
- Automated alert generation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- **Website**: https://pyrack.com/
- **Email**: support@pyrack.com
- **Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)

## Copyright

**Piloo.ai - AI-Powered CCTV Monitoring Platform**  
Copyright © 2025 Pyrack Solutions Pvt. Ltd.  
All rights reserved.

This software is the proprietary product of Pyrack Solutions Pvt. Ltd. and is protected by copyright law. The use, reproduction, distribution, or disclosure of this software, in whole or in part, is subject to the terms and conditions of the applicable license agreement.

---

Built with ❤️ by Pyrack Solutions Pvt. Ltd.