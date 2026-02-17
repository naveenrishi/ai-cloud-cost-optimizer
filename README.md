# ☁️ AI Cloud Cost Optimizer

A production-ready multi-cloud cost optimization platform that helps teams reduce cloud infrastructure costs by up to 45%.

## 🚀 Features

- **Multi-Cloud Dashboard** - Track AWS, Azure & GCP costs in one place
- **AI Recommendations** - Intelligent cost-saving suggestions
- **Infrastructure Nuke Tracker** - Audit trail for all deleted resources
- **Budget Alerts** - Set limits and get notified before overspending
- **CSV Export** - Download cost reports for analysis

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Helmet + Rate Limiting

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Recharts (data visualization)
- Zustand (state management)
- React Router v6

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-cloud-cost-optimizer

# Backend setup
cd backend
npm install
cp .env.example .env
# Add your DATABASE_URL to .env
npx prisma migrate dev
npm run dev

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## 🌐 Live Demo

- Frontend: https://your-app.vercel.app
- Backend: https://your-app.railway.app

## 📸 Screenshots

### Dashboard
Multi-cloud cost dashboard with trend charts and service breakdowns

### Recommendations
AI-powered cost optimization recommendations

### Nuke Tracker
Infrastructure deletion tracking with savings measurement

### Budget Alerts
Budget management with visual progress indicators