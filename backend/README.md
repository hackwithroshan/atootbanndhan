# Atut Bandhan - Backend API

This directory contains the complete backend for the Atut Bandhan matrimonial platform. It is a modern, scalable, and secure RESTful API built with Node.js, Express, and MongoDB, using TypeScript for robust type-safety.

---

## ✨ Features

- **RESTful API:** A well-structured API for all platform functionalities.
- **Secure Authentication:** User and Admin authentication using JSON Web Tokens (JWT) and password hashing with `bcryptjs`.
- **Role-Based Access Control (RBAC):** Middleware to protect admin-only endpoints.
- **Multi-Step Registration:** Endpoints for sending and verifying Email/Mobile OTPs to ensure user authenticity.
- **Comprehensive Data Models:** Mongoose schemas for users, profiles, interests, messages, success stories, and more.
- **Database Seeding:** A script to populate the database with initial data for easy development and testing.
- **Serverless-Ready:** Designed to run efficiently in serverless environments like Vercel.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (ODM)
- **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/), [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **Validation:** `express-validator` for input validation.
- **Email Service:** `nodemailer` for sending OTPs and other emails.
- **Development Environment:** `tsx` for live-reloading TypeScript execution.

---

## 📂 Project Structure

The backend is organized into logical modules for maintainability and scalability.

```
backend/
|-- models/         # Mongoose schemas for all data models (User, Interest, etc.)
|-- middleware/     # Express middleware for authentication (auth.ts, adminAuth.ts)
|-- routes/         # API route definitions for each module (auth, users, admin, etc.)
|-- db.ts           # Serverless-friendly database connection logic
|-- seed.ts         # Logic to seed the database with initial data for development
|-- index.ts        # Main Express app entry point, configures routes and middleware
|-- package.json    # Backend dependencies and scripts
|-- tsconfig.json   # TypeScript compiler configuration
|-- .env            # Environment variables (local only, not committed to git)
|-- README.md       # This file
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A MongoDB database instance (a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) is recommended)
- An SMTP server for sending emails (e.g., a free Gmail account with an App Password, or a service like SendGrid)

### Setup Instructions

1.  **Navigate to the backend directory:**
    From the project root, run:
    ```bash
    cd backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the `backend` directory. Copy the contents of the example below and replace the placeholder values with your actual credentials.

    ```env
    # --- MongoDB Connection ---
    # Get this from your MongoDB Atlas cluster
    MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster_url/atutbandhan?retryWrites=true&w=majority

    # --- JWT Authentication ---
    # Use a long, random, and secret string for security
    JWT_SECRET=your_super_secret_jwt_key_for_signing_tokens

    # --- Nodemailer SMTP Configuration (for sending OTPs) ---
    # Replace with your SMTP server details (e.g., from Hostinger, SendGrid, etc.)
    EMAIL_HOST=smtp.hostinger.com
    EMAIL_PORT=465
    EMAIL_USER=noreply@yourapp.com
    EMAIL_PASS=your_email_password
    ```

4.  **Run the Development Server:**
    The server will start on port 5000 by default, connect to MongoDB, and automatically seed the database on its first run.
    ```bash
    npm run dev
    ```
    You should see `✅ MongoDB successfully connected.` and `🚀 Server started on port 5000.` in your terminal.

---

## 🌐 API Endpoints

The API routes are modularized for clarity:

- `/api/auth`: User registration, login, OTP verification, and fetching user session data.
- `/api/users`: User profile management, search, and shortlisting.
- `/api/matches`: Fetching suggested matches.
- `/api/interests`: Sending and managing interests between users.
- `/api/messages`: Real-time chat and conversation management.
- `/api/tickets`: Support ticket creation and management.
- `/api/dashboard`: Aggregated data for the user dashboard widgets.
- `/api/content`: Serves public content like FAQs, blog posts, and success stories.
- `/api/admin`: Admin-only endpoints for user management and platform analytics.

---

## ☁️ Deployment to Vercel

This project is configured for seamless deployment as a serverless application on [Vercel](https://vercel.com/). The frontend and backend are deployed together from the same Git repository.

### How it Works

The `vercel.json` file in the project root contains a `rewrites` rule. This rule tells Vercel how to handle incoming requests:
1.  Requests to `/api/*` are rewritten to be handled by the backend serverless function (`/backend/index.ts`).
2.  All other requests are served the frontend's `index.html`, allowing the React application to handle client-side routing.

### Deployment Steps

1.  **Push to Git:**
    Ensure your entire project (both frontend and backend folders) is pushed to a Git repository on GitHub, GitLab, or Bitbucket.

2.  **Create a Vercel Project:**
    - Sign up or log in to your Vercel account.
    - Click "Add New... > Project".
    - Import the Git repository you just created.

3.  **Configure the Project:**
    - Vercel will likely detect the project as a Vite application. This is correct. The **Root Directory** should be the root of your repository (not `backend` or `frontend`).
    - Before deploying, go to the **Settings** tab of your new Vercel project.
    - Click on **Environment Variables**.
    - Add all the variables from your local `backend/.env` file (`MONGO_URI`, `JWT_SECRET`, `EMAIL_HOST`, etc.). These are crucial for the backend to function in production.

4.  **Deploy:**
    - Go back to the **Deployments** tab.
    - Trigger a new deployment. Vercel will build the frontend and deploy the backend as a serverless function.

Your Atut Bandhan application is now live! Vercel will automatically redeploy the application whenever you push new changes to your Git repository.