# MukibaraConnect

**Itangazo Rigera Kuri Bose** — Sisitemu yo gucunga amatangazo y'abaturage yanditswe mu Kinyarwanda gusa.

MukibaraConnect is a modern full-stack public announcement management system built for Kinyarwanda-speaking communities.

## Tech Stack

- **Frontend**: React.js + Vite + TailwindCSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Architecture**: REST API + MVC

## Features

- 3 user roles: Admin, Manager (Umuyobozi), Citizens (Abaturage)
- Complete announcement CRUD with image uploads
- PIN-based citizen access
- Modern glassmorphism dashboard design
- Charts and analytics
- Search, pagination, and filters
- Toast notifications and confirmation dialogs
- Fully responsive (mobile + desktop)
- **Entire UI in Kinyarwanda**

## User Credentials

### Admin
- Username: `admin`
- Password: `mukibara@123!`

### Manager (Umuyobozi)
- Username: `mukibara`
- Password: `umuyobozi@123!`

### Citizens (Abaturage)
- PIN: `*13672#`

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/dufitimanasiel/mukibara.git
cd mukibara
```

### 2. Set up the database
```bash
# Create the PostgreSQL database
psql -U postgres -f database/schema.sql
```

Or create the database manually:
```sql
CREATE DATABASE mukibara_connect;
```

### 3. Set up the backend
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

### 4. Set up the frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 5. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mukibara_connect
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login

### Announcements
- `GET /api/announcements` — Get all (authenticated)
- `GET /api/announcements/public` — Get public announcements
- `POST /api/announcements` — Create announcement
- `PUT /api/announcements/:id` — Update announcement
- `DELETE /api/announcements/:id` — Delete announcement

### Users
- `GET /api/users` — Get all users (admin only)
- `PUT /api/users/:id/status` — Update user status (admin only)

### Citizen PINs
- `GET /api/pins` — Get all PINs (admin only)
- `POST /api/pins` — Create PIN (admin only)
- `PUT /api/pins/:id/status` — Update PIN status (admin only)
- `POST /api/pins/verify` — Verify citizen PIN

### Statistics
- `GET /api/stats` — Get system statistics (admin only)

## Project Structure

```
mukibara/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, upload, validation
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── utils/           # Seed data
│   ├── uploads/         # Uploaded images
│   └── server.js        # Express server entry
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # React Context (Auth)
│       ├── layouts/     # Dashboard layout
│       ├── pages/       # Page components
│       ├── services/    # API service layer
│       └── App.jsx      # Router & app entry
└── database/
    └── schema.sql       # PostgreSQL schema
```

## License

MIT License
