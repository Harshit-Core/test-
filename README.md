# Tech Stack Recommender

A full-stack web application that helps developers choose the right technology stack for their projects using AI-powered recommendations. The platform also includes a job board for browsing and applying to software development positions.


## Features

### AI-Powered Recommendations
- Describe your project in natural language
- Get personalized tech stack suggestions ranked by relevance
- See matched keywords and reasoning for each recommendation
- For Testing use these prompts : -

**Quick test**
Try these very different inputs to see if recommendations change:

Test 1: Mobile App
"I want to build a mobile app for iOS and Android with real-time features"
Expected top result: Flutter Mobile Stack

Test 2: Machine Learning
"I need to build a data-driven application with machine learning and analytics"
Expected top result: Django Stack (Python-based)

Test 3: Static Website
"I want to create a simple marketing website with a blog"
Expected top result: JAMstack

Test 4: Enterprise System
"I need to build a large-scale distributed system with microservices for a big team"
Expected top result: Microservices Stack

### Job Board
- Browse software development job listings from multiple sources
- Filter by keywords, remote work(it's sometimes shows glitches)
- Save interesting jobs to your applications list
- Direct links to apply on company websites(Basiclly Adzuna)

### User Management
- Secure authentication with JWT tokens
- Personal profile with skills tracking
- Application history and saved tech stacks
- Role-based access (user/admin)

### Admin Panel
- Refresh job listings from external APIs
- Manage system data

## Technology Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Rate limiting and security middleware

### AI Service
- Python with FastAPI
- Sentence Transformers for embeddings
- Scikit-learn for similarity calculations
- Natural language processing for semantic matching

### Infrastructure
- Frontend: Vercel
- Backend: Render
- AI Service: Railway
- Database: Neon PostgreSQL

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Python 3.11 or higher
- PostgreSQL database
- npm or yarn package manager
- Also read requirements.txt for Ai Service requirements

### Installation

1. Clone the repository:

git clone https://github.com/yourusername/tech-stack-recommender.git
cd tech-stack-recommender

2. Set up the backend:

cd backend
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev


3. Set up the AI service:

cd ai-service
pip install -r requirements.txt
cp .env.example .env
python main.py


4. Set up the frontend:

cd frontend
npm install
npm run dev


## .ENV

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
AI_SERVICE_URL="http://localhost:8001"
ADZUNA_APP_ID="your-adzuna-id"
ADZUNA_API_KEY="your-adzuna-key"
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### AI Service (.env)
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:5000/api"
```

## Database Schema

The application uses Prisma ORM with the following main models:
- User: Authentication and profile data
- Stack: Technology stack information
- Job: Job listings from external sources
- Application: User job applications
- SavedStack: User's saved tech stacks

## External APIs

The job board integrates with:
- Adzuna API for job listings
- himalayas.app API for remote positions

## Security Considerations

- All passwords are hashed
- JWT tokens expire after 7 days
- Rate limiting on API endpoints
- SQL injection prevention