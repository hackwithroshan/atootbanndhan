# Atut Bandhan - Modern Matrimonial Platform

Atut Bandhan is a comprehensive, full-stack web application for a modern matrimonial service. It features a responsive user interface built with React and Tailwind CSS, and a secure, scalable backend powered by Node.js, Express, and MongoDB. The platform is designed to provide a seamless and secure experience for users seeking serious relationships, while also offering a powerful dashboard for administrators to manage the platform.

---

## ✨ Features

### User-Facing Features
- **Multi-Step User Registration:** A guided, multi-step signup process with email and mobile OTP verification.
- **Secure Authentication:** JWT-based login/logout for users and admins.
- **Responsive Homepage:** A beautiful landing page with sections for hero content, featured profiles, how it works, and success stories.
- **Comprehensive User Dashboard:**
  - **Profile Management:** View and edit a detailed personal profile.
  - **Matchmaking:** Receive AI-suggested matches and perform advanced searches.
  - **Interaction:** Express interest, manage sent/received interests, and shortlist profiles.
  - **Communication:** A real-time messaging system for mutually interested users.
  - **Membership Tiers:** View and manage different membership plans (Free, Silver, Gold, Diamond) with feature access control.
  - **Astrology Services:** Generate Kundali, perform Kundali matching, and get daily horoscopes.
  - **Support System:** Create and manage support tickets.
  - **Account & Privacy:** Manage account settings, password, privacy, and notification preferences.

### Admin Dashboard Features
- **Secure Admin Panel:** A separate, dark-themed dashboard with role-based access control (RBAC).
- **User Management:** View, search, edit, suspend, and ban user accounts.
- **Profile Moderation:** Approve or reject user-submitted photos and profile content.
- **Content Management:** Manage static pages (FAQs, Terms), blog posts, success stories, and promotional offers.
- **Analytics:** A dashboard to monitor key metrics like user signups, revenue, and engagement.
- **Site Settings:** Configure global platform settings, including logos, contact info, and feature toggles.
- **A/B Testing & Search Analytics:** Panels to manage A/B tests and analyze user search behavior.

---

## 🛠️ Tech Stack

- **Frontend:**
  - **Framework:** React 18
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS
  - **Build Tool:** Vite

- **Backend:**
  - **Runtime:** Node.js
  - **Framework:** Express.js
  - **Language:** TypeScript
  - **Database:** MongoDB with Mongoose (ODM)
  - **Authentication:** JSON Web Tokens (JWT), bcryptjs
  - **Email Service:** Nodemailer

- **Deployment:**
  - Configuration provided for Vercel (`vercel.json`).

---

## 📂 Project Structure

The project is a monorepo-style setup with the frontend and backend code co-located.

```
/
|-- backend/
|   |-- models/         # Mongoose schemas for all data models
|   |-- middleware/     # Express middleware (auth, adminAuth)
|   |-- routes/         # API route definitions for each module
|   |-- db.ts           # Database connection logic
|   |-- seed.ts         # Logic to seed the database with initial data
|   |-- index.ts        # Express app entry point
|
|-- components/
|   |-- auth/           # Login, Signup components
|   |-- dashboard/      # Components for the user dashboard
|   |-- admin/          # Components for the admin dashboard
|   |-- home/           # Components for the homepage
|   |-- layout/         # Header, Footer, Sidebar, etc.
|   |-- ui/             # Reusable UI elements (Button, Input, Select)
|   |-- icons/          # SVG icon components
|
|-- pages/
|   |-- HomePage.tsx
|   |-- AuthPage.tsx
|   |-- DashboardPage.tsx
|   |-- admin/          # Admin-specific page components
|
|-- utils/              # Utility functions (API URL config, feature access)
|-- types.ts            # Global TypeScript type definitions
|-- constants.ts        # Constant values and options (e.g., form options)
|-- App.tsx             # Main application component, handles routing logic
|-- index.html          # Main HTML entry point for the frontend
|-- index.tsx           # React root renderer
|-- vercel.json         # Vercel deployment configuration
|-- vite.config.ts      # Vite configuration
|-- package.json        # All project dependencies (frontend & backend)
|-- README.md           # This file
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- A MongoDB database instance (e.g., from MongoDB Atlas)
- An SMTP server for sending emails (e.g., Gmail, SendGrid)

### Setup

1.  **Install Dependencies:**
    From the **project root directory**, run `npm install`. This single command will install all dependencies for both the frontend and the backend. **Do not run `npm install` inside the `backend` folder.**
    ```bash
    npm install
    ```

2.  **Configure Backend Environment:**
    Create a file named `.env` inside the `backend` directory. Add your credentials for MongoDB and your SMTP server, using the example below.

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

    # --- NOTE ON USING GMAIL for SMTP ---
    # If you want to use a personal Gmail account for sending emails, you cannot use your
    # regular password due to Google's security policies. You must:
    # 1. Enable 2-Step Verification on your Google Account.
    # 2. Go to your Google Account settings and generate an "App Password".
    # 3. Use your full Gmail address as EMAIL_USER and the 16-character App Password as EMAIL_PASS.
    # 4. Use host: "smtp.gmail.com" and port: 465.
    ```

3.  **Run the Development Servers:**
    For local development, you will need to run two separate terminal sessions for the frontend and backend, both from the **project root directory**.

    **Terminal 1: Start the Backend Server**
    Open a terminal in the **project root directory** and run:
    ```bash
    npm run dev:backend
    ```
    This will start the backend API server on `http://localhost:5000`. Wait until you see the message "✅ MongoDB successfully connected." and "🚀 Server started on port 5000.".

    **Terminal 2: Start the Frontend Server**
    Open a **second terminal** in the **project root directory** and run:
    ```bash
    npm run dev
    ```
    This will start the frontend development server on `http://localhost:3000`.

4.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

### Default Login Credentials

After seeding, you can use the following credentials to log in:

- **Admin:**
  - **Email:** `admin@example.com`
  - **Password:** `password123`
- **User (if seeded):**
  - Most demo users have been removed. The easiest way to test is to create a new user through the registration form.

---

## ☁️ Troubleshooting Vercel Deployment

If your deployed website on Vercel shows a blank white page, or if **Login/Registration is failing**, it is almost always because the **Environment Variables have not been set** in your Vercel project.

The backend API will crash if it cannot find crucial secrets like the database connection string or JWT secret.

### How to Fix

1.  **Go to your Vercel Project Dashboard.**
2.  Click on the **Settings** tab.
3.  In the left sidebar, click on **Environment Variables**.
4.  For **each** variable in your local `backend/.env` file, you must add it here. For example:
    - **Key:** `MONGO_URI`, **Value:** `mongodb+srv://...`
    - **Key:** `JWT_SECRET`, **Value:** `your_super_secret_jwt_key...`
    - **Key:** `EMAIL_HOST`, **Value:** `smtp.hostinger.com`
    - ...and so on for `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS`.

5.  After adding all the variables, go to the **Deployments** tab and **re-deploy** your latest commit.

This will provide the necessary credentials to your backend, allowing it to connect to the database and function correctly. **This will fix login, registration, and OTP email issues.**