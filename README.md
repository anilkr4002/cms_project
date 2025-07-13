# Content Management System

A full-stack Content Management System with Python Flask backend and React frontend.

# Features

- Authentication: Token-based authentication with JWT
- CRUD Operations: Create, Read, Update, Delete articles
- Recently Viewed: Track recently viewed articles per user (in-memory)
- Pagination: Paginated article listing
- User Isolation: Each user sees only their own articles
- Responsive UI: Clean, modern React interface

# Tech Stack

- Backend: Python Flask, SQLAlchemy, PostgreSQL
- Frontend: React, Tailwind CSS, Lucide React icons
- Database: PostgreSQL
- Containerization: Docker & Docker Compose

# Project Structure

cms/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend container
├── frontend/
│   ├── src/
│   │   └── App.js         # React application
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Multi-container setup
└── README.md             # This file
```

## Quick Start with Docker

1. Clone the repository

git clone <repository-url>
cd cms


2. Start the application

docker-compose up --build


3. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Manual Setup

### Backend Setup

1. Create virtual environment

cd backend
python -m venv venv
source venv/bin/activate  
# On Windows: venv\Scripts\activate


2. Install dependencies

pip install -r requirements.txt


3. Setup PostgreSQL

# Install PostgreSQL and create database
createdb cms_db


4. Run the backend
