# Football Manager Backend

A Node.js Express backend for a football fantasy manager application with TypeScript, Prisma, and PostgreSQL.

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/football_manager_db"
   JWT_SECRET="your-secret-key-here"
   NODE_ENV="development"
   PORT=4000
   ```
4. Setup database: `npm run prisma:generate && npm run prisma:migrate`
5. Start the development server: `npm run dev`
6. The server will run on `http://localhost:4000`

## Time Report

- **Database schema and Prisma setup**: 1hr
- **Authentication system (login/register)**: 2hrs
- **Team creation with background job queue**: 2hrs
- **Transfer market and player management**: 3hrs
- **Error handling and validation**: 1hr
- **API optimization and performance**: 1hr
- **Total**: 10hrs