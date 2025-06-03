# NGO Management System

A comprehensive full-stack inventory and donor management system for NGOs.

## Features

- **Donor Management**: Track donors, their information, and donation history
- **Inventory Management**: Manage inventory items, track stock levels, and set low stock alerts
- **Donation Tracking**: Record and analyze donations with detailed reporting
- **Analytics**: View top donors, donation trends, and inventory status
- **Email Communication**: Send thank you emails and reminders to donors
- **Admin Panel**: Secure admin interface with role-based access control

## Tech Stack

### Backend
- Node.js with Express
- Prisma ORM with CockroachDB
- JWT Authentication
- BullMQ for background jobs
- Node-Cache for in-memory caching
- Zod for validation
- Nodemailer for email

### Frontend
- React with React Router
- TanStack React Query for data fetching
- Tailwind CSS with shadcn/ui components
- Framer Motion for animations
- Axios for API requests

## Getting Started

### Prerequisites
- Node.js 16+
- CockroachDB instance

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the variables with your configuration

4. Generate Prisma client:
\`\`\`bash
npx prisma generate
\`\`\`

5. Push schema to database:
\`\`\`bash
npx prisma db push
\`\`\`

6. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the API URL if needed

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

### Backend
- `src/app.js` - Express application entry point
- `src/config/` - Configuration files
- `src/controllers/` - Request handlers
- `src/middleware/` - Express middleware
- `src/routes/` - API routes
- `src/services/` - Business logic
- `src/utils/` - Utility functions
- `src/jobs/` - Background jobs
- `prisma/schema.prisma` - Database schema

### Frontend
- `src/App.jsx` - Main application component
- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/services/` - API services
- `src/utils/` - Utility functions
- `src/context/` - React context providers

## Performance Optimizations

- **Caching**: In-memory caching for frequently accessed data
- **Indexing**: CockroachDB B-Tree indexing for efficient queries
- **Background Processing**: BullMQ for handling email sending and report generation
- **Query Optimization**: Raw SQL queries for complex operations
- **Rate Limiting**: Prevent API abuse with rate limiting

## License

MIT
