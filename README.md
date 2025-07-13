# Content Management System

A full-stack Content Management System with Python Flask backend and React frontend.

## Features

- **Authentication**: Token-based authentication with JWT
- **CRUD Operations**: Create, Read, Update, Delete articles
- **Recently Viewed**: Track recently viewed articles per user (in-memory)
- **Pagination**: Paginated article listing
- **User Isolation**: Each user sees only their own articles
- **Responsive UI**: Clean, modern React interface

## Tech Stack

- **Backend**: Python Flask, SQLAlchemy, PostgreSQL
- **Frontend**: React, Tailwind CSS, Lucide React icons
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Project Structure

```
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

1. **Clone the repository**
```bash
git clone <repository-url>
cd cms
```

2. **Start the application**
```bash
docker-compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Manual Setup

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Setup PostgreSQL**
```bash
# Install PostgreSQL and create database
createdb cms_db
```

4. **Run the backend**
```bash
python app.py
```

### Frontend Setup

1. **Install Node.js dependencies**
```bash
cd frontend
npm install
```

2. **Start the React application**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Articles
- `GET /articles` - List user's articles (paginated)
- `POST /articles` - Create new article
- `GET /articles/<id>` - Get specific article
- `PUT /articles/<id>` - Update article
- `DELETE /articles/<id>` - Delete article
- `GET /articles/recent` - Get recently viewed articles

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Articles**: Click "New Article" to create content
3. **View Articles**: Click the eye icon to view full articles
4. **Edit Articles**: Click the edit icon to modify content
5. **Delete Articles**: Click the trash icon to remove articles
6. **Recent Articles**: View your recently accessed articles

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild specific service
docker-compose up --build backend
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `password`

### Articles Table
- `id` (Primary Key)
- `title`
- `content`
- `created_at`
- `updated_at`
- `user_id` (Foreign Key)
