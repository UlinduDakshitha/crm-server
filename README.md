# CRM Backend

A simple CRM Lead Management System backend built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Lead CRUD operations
- Lead notes management
- Dashboard analytics
- Search and filtering by status, source, and search term
- Protected API routes

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- dotenv
- cors

## Project Structure

```bash
crm-backend/
├── config/
│   └── db.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Lead.js
│   ├── Note.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── leadRoutes.js
│   └── noteRoutes.js
├── server.js
├── .env
└── package.json

Setup Instructions
1. Install dependencies
npm install
2. Create .env file
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=secretkey
3. Run the server

For development:

npm run dev

For production:

npm start

Test Login Credentials
Email: admin@example.com
Password: password123


API Endpoints
Auth
POST /api/auth/login
Leads
GET /api/leads
POST /api/leads
PUT /api/leads/:id
PATCH /api/leads/:id/status
DELETE /api/leads/:id
Notes
GET /api/notes/:leadId
POST /api/notes
Dashboard
GET /api/dashboard
Lead Fields

Each lead contains:

name
company
email
phone
source
status
value
createdAt
updatedAt
Note Fields

Each note contains:

leadId
content
createdAt
updatedAt
Known Limitations
Uses a simple test user for login
No role-based access control
No email notifications
No pagination yet
No file upload support

Reflection
This project helped me understand how to build a full-stack CRUD application with authentication, database persistence, and dashboard analytics. I learned how frontend and backend communicate through REST APIs and how MongoDB stores structured CRM data.
