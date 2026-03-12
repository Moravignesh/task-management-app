# TaskFlow — Task Management & Collaboration System

A full-stack web application built with **FastAPI** (backend) and **React.js** (frontend) that allows users to create projects, manage tasks, assign work to team members, and view analytics.

---

## 🏗️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | FastAPI, SQLAlchemy ORM, PostgreSQL     |
| Auth      | JWT (python-jose), bcrypt (passlib)     |
| Frontend  | React 18, Vite, TailwindCSS             |
| Charts    | Recharts                                |
| HTTP      | Axios                                   |

---

## 📁 Project Structure

```
task-management-app/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # auth, projects, tasks, analytics, notifications
│   │   ├── core/               # config, security (JWT + hashing)
│   │   ├── db/                 # database connection
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── main.py             # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/layout/  # Sidebar layout
    │   ├── context/            # AuthContext (JWT storage)
    │   ├── pages/              # Login, Register, Dashboard, Projects, TaskBoard, etc.
    │   ├── utils/              # Axios instance with interceptors
    │   ├── App.jsx             # Router & protected routes
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🗄️ Database Schema

```sql
users
  id, name, email, hashed_password, is_active, created_at, updated_at

projects
  id, project_name, description, owner_id (FK→users), created_at, updated_at

tasks
  id, title, description, status (Pending/In Progress/Completed),
  due_date, project_id (FK→projects), created_by (FK→users),
  assigned_to (FK→users), created_at, updated_at

notifications
  id, user_id (FK→users), title, message, is_read, created_at
```

---

## ⚡ Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**

---

## 🚀 Setup Instructions

### 1. Clone & Navigate

```bash
cd task-management-app
```

---

### 2. PostgreSQL — Create Database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE taskmanagement;
```

---

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/taskmanagement
SECRET_KEY=your-super-secret-key-at-least-32-chars-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
# Start the backend server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

---

### 4. Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 📡 API Endpoints

### Auth
| Method | Endpoint        | Description        |
|--------|-----------------|--------------------|
| POST   | /auth/register  | Register new user  |
| POST   | /auth/login     | Login, get JWT     |
| GET    | /auth/me        | Current user info  |

### Projects
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /projects             | Create project       |
| GET    | /projects             | Get user's projects  |
| PUT    | /projects/{id}        | Update project       |
| DELETE | /projects/{id}        | Delete project       |

### Tasks
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /tasks                        | Create task              |
| GET    | /projects/{id}/tasks          | Get tasks by project     |
| GET    | /tasks/assigned               | Get tasks assigned to me |
| PUT    | /tasks/{id}                   | Update task              |
| DELETE | /tasks/{id}                   | Delete task              |
| POST   | /tasks/{id}/assign            | Assign task to user      |

### Analytics
| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | /analytics/tasks | Task analytics data  |

### Notifications
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /notifications              | Get user notifications  |
| PUT    | /notifications/{id}/read    | Mark one as read        |
| PUT    | /notifications/read-all     | Mark all as read        |

---

## 🎯 Features

- ✅ **Module 1** — JWT Authentication (register, login, protected routes)
- ✅ **Module 2** — Project Management (CRUD with user-specific access)
- ✅ **Module 3** — Task Board (Kanban-style with status columns)
- ✅ **Module 4** — Task Assignment with user dropdown
- ✅ **Module 5** — Analytics Dashboard (bar chart + pie chart + summary cards)
- ✅ **Module 6** — In-app Notifications (bonus) — triggered on task assignment

---

## 🔧 VSCode Tips

1. Install the **Python** and **ESLint** extensions
2. Open the root `task-management-app` folder in VSCode
3. Use the integrated terminal split view: backend on left, frontend on right
4. The API Swagger UI at `http://localhost:8000/docs` is great for testing endpoints

---

##  Troubleshooting

**`CORS error`** — Make sure both servers are running (backend on 8000, frontend on 3000)

**`Connection refused` (PostgreSQL)** — Check PostgreSQL service is running and credentials in `.env` are correct

**`Module not found`** — Run `pip install -r requirements.txt` again with virtual env activated

**`npm install` fails** — Ensure Node.js 18+ is installed: `node --version`
