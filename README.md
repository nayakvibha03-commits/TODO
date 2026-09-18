# NexusTask Pro 📝

A modern full-stack task management web application designed to help users organize tasks, manage reminders, track productivity, and manage daily activities through a clean and responsive interface.

NexusTask Pro combines a React + Vite frontend with a Node.js + Express.js backend and REST APIs for task and reminder management.

---

## 🚀 Features

### 📊 Dashboard
- Overview of tasks and productivity
- Task status tracking
- Quick access to important task information

### ✅ Task Management
- Create tasks
- Edit tasks
- Delete tasks
- Set task priority
- Set task status
- Add categories
- Add tags
- Set due dates
- Track estimated time
- Track spent time
- Add subtasks

### 📋 Kanban Board
- Organize tasks based on status
- Visual task workflow
- Drag-and-drop task management
- Track task progress

### 📅 Calendar
- View tasks based on due dates
- Organize scheduled activities
- Manage upcoming tasks

### 🔔 Reminders & Notifications
- Create reminders
- Create special events
- Set reminder date and time
- Add notes
- Support recurring reminders
- Snooze reminders
- Browser notifications
- In-app notification system
- Audio reminder notifications

### ⏳ Pomodoro Timer
- Focus timer for productivity
- Supports focused work sessions
- Helps manage work and break intervals

### 📈 Analytics Dashboard
- Visualize task statistics
- Track task completion
- View productivity information
- Interactive charts using Recharts

### 🔄 Recurring Tasks
- Daily recurring tasks
- Weekly recurring tasks
- Monthly recurring tasks
- Automatically schedule recurring activities

### 📱 Responsive Design
- Responsive user interface
- Desktop-friendly layout
- Modern and clean visual design

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript (ES6+)
- CSS3
- Vite
- Recharts

### Backend
- Node.js
- Express.js
- REST APIs
- CORS

### Data Storage
- JSON file-based storage

### Deployment
- Git
- GitHub
- Render
- Render Blueprint

---

## 🏗️ Architecture

NexusTask Pro follows a client-server architecture.

```text
                NexusTask Pro
                     |
          +----------+----------+
          |                     |
          v                     v
   React + Vite           Node.js + Express
    Frontend                  Backend
          |                     |
          |     REST API        |
          +-------------------->|
                                |
                                v
                         JSON Data Storage
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
               tasks.json            reminders.json

The React frontend communicates with the Express backend through REST API endpoints.

🔌 REST API
Task Endpoints
Method	Endpoint	Description
GET	/api/tasks	Get all tasks
POST	/api/tasks	Create a new task
PUT	/api/tasks/:id	Update an existing task
DELETE	/api/tasks/:id	Delete a task
Reminder Endpoints
Method	Endpoint	Description
GET	/api/reminders	Get all reminders
POST	/api/reminders	Create a reminder
PUT	/api/reminders/:id	Update a reminder
DELETE	/api/reminders/:id	Delete a reminder
Health Check
GET /healthz

The /healthz endpoint is used to check whether the backend server is running correctly and is configured as the Render health-check endpoint.

📂 Project Structure
TODO/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Analytics/
│   │   ├── Calendar/
│   │   ├── Dashboard/
│   │   ├── Kanban/
│   │   ├── Notifications/
│   │   ├── Pomodoro/
│   │   ├── Reminders/
│   │   └── Tasks/
│   │
│   ├── context/
│   │   └── TaskContext.jsx
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── server/
│   ├── data/
│   │   ├── reminders.json
│   │   └── tasks.json
│   │
│   └── server.js
│
├── index.html
├── package.json
├── package-lock.json
├── render.yaml
├── vite.config.js
├── .gitignore
└── README.md
⚙️ Installation
1. Clone the repository
git clone https://github.com/nayakvibha03-commits/TODO.git
2. Navigate to the project directory
cd TODO
3. Install dependencies
npm install
▶️ Run the Application

Start the frontend and backend together using:

npm run dev

The project uses:

React + Vite for the frontend
Node.js + Express.js for the backend

The Vite development server communicates with the Express backend through the configured API routes.

📜 Available Scripts
Command	Description
npm run dev	Start frontend and backend together
npm run client	Start the Vite frontend
npm run server	Start the Express backend
npm run build	Build the React application for production
npm run preview	Preview the production build
npm start	Start the Express production server
🌐 Production Deployment

The project includes a render.yaml Blueprint configuration for deployment using Render.

Build Command
npm install --include=dev && npm run build
Start Command
npm start
Deployment Configuration
Service Name: nexustask-pro
Runtime: Node.js
Plan: Free
Node Version: 20
Health Check: /healthz

The production Express server serves the Vite-generated frontend from the dist directory while also handling the REST API.

☁️ Deployment Flow
GitHub
   |
   v
Render Blueprint
   |
   v
Install Dependencies
   |
   v
Vite Production Build
   |
   v
Node.js + Express Server
   |
   v
NexusTask Pro

The deployment configuration is stored in:

render.yaml
💾 Data Storage

The current version uses JSON files for data storage.

server/data/tasks.json
server/data/reminders.json

The Express backend reads and writes task and reminder data using the server's local filesystem.

Deployment Limitation

The current Render free-plan configuration uses local filesystem storage.

Therefore, data stored in the JSON files should not be considered permanent after service restarts or redeployments.

For permanent production data storage, the application can later be migrated to a database such as PostgreSQL or MongoDB.

🧠 Technical Concepts Demonstrated
React component architecture
React Context API
React Hooks
REST API development
CRUD operations
Express.js
Node.js
JSON file handling
Frontend-backend integration
API communication using Fetch API
Vite development and production builds
Client-side state management
Drag-and-drop interactions
Browser Notifications API
Audio notifications
Responsive UI development
Data visualization with Recharts
Git and GitHub
Cloud deployment with Render
🎯 Project Objective

The main objective of NexusTask Pro is to provide a centralized productivity platform that allows users to:

Organize daily tasks
Manage deadlines
Track task progress
Set priorities
Manage reminders
Schedule recurring activities
Visualize productivity
Use focused work sessions
Manage tasks through different views

The project also demonstrates how a React frontend can be integrated with a Node.js and Express backend and deployed as a full-stack web application.

📸 Screenshots

Add screenshots of the application here.

Recommended screenshots:

Dashboard
Task Management
Kanban Board
Calendar
Reminders
Pomodoro Timer
Analytics Dashboard

Example:

screenshots/
├── dashboard.png
├── tasks.png
├── kanban.png
├── calendar.png
├── reminders.png
└── analytics.png
👩‍💻 Developer
Vibha R

Computer Science Engineering Student
Full Stack Developer Intern – IncodeVision

GitHub:
https://github.com/nayakvibha03-commits

LinkedIn:
https://www.linkedin.com/in/vibha-nayak-b97a59405/

📄 License

This project was developed for educational, learning, and internship purposes.
