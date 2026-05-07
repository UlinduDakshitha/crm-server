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
