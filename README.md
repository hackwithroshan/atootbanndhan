
# Atut Bandhan - Modern Matrimonial Platform

Atut Bandhan is a comprehensive, full-stack web application for a modern matrimonial service. It features a responsive user interface built with React and Tailwind CSS, and a secure, scalable backend powered by Node.js, Express, and MongoDB. The platform is designed to provide a seamless and secure experience for users seeking serious relationships, while also offering a powerful dashboard for administrators to manage the platform.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- A MongoDB database instance (e.g., from MongoDB Atlas)
- An SMTP server for sending emails (e.g., Gmail, SendGrid)

### Setup

1.  **Install Dependencies (IMPORTANT!):**
    From the **project root directory** (where the main `package.json` is), run this single command. It will install all dependencies for both the frontend and the backend. **Do not run `npm install` inside the `backend` folder.**
    ```bash
    npm install
    ```

2.  **Configure Backend Environment:**
    Create a file named `.env` inside the `backend` directory. Add your credentials for MongoDB and your SMTP server, using the example below. You also need to add a `SETUP_SECRET_KEY`.
    ```env
    # --- MongoDB Connection ---
    MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster_url/atutbandhan?retryWrites=true&w=majority

    # --- JWT Authentication ---
    JWT_SECRET=your_super_secret_jwt_key_for_signing_tokens

    # --- One-Time Setup Secret ---
    # Use a long, random string. You will need this to initialize the database after deploying.
    SETUP_SECRET_KEY=a_very_long_and_random_secret_string_for_setup

    # --- Nodemailer SMTP Configuration (for sending OTPs) ---
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=465
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_16_character_gmail_app_password
    ```

3.  **Run the Development Servers:**
    You will need two separate terminals, both from the **project root directory**.

    **Terminal 1: Start the Backend Server**
    ```bash
    npm run dev:backend
    ```
    This starts the API server on `http://localhost:5000`.

    **Terminal 2: Start the Frontend Server**
    ```bash
    npm run dev
    ```
    This starts the frontend server on `http://localhost:3000`.

4.  **One-Time Database Setup (Local):**
    After starting the backend server for the first time, open your browser and visit the following URL to initialize your database (fix indexes, add plans, etc.):
    `http://localhost:5000/api/admin/setup-database?secret=<your_secret_key>`
    *(Replace `<your_secret_key>` with the value from your `.env` file).*

5.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

---

## ☁️ Vercel Deployment Guide

If your deployed website on Vercel shows a blank white page, or if **Login/Registration is failing**, follow these steps carefully.

### Step 1: Add Environment Variables

1.  **Go to your Vercel Project Dashboard.**
2.  Click on the **Settings** tab, then **Environment Variables**.
3.  Add **all** the variables from your local `backend/.env` file. This is the most critical step.
    - `MONGO_URI`
    - `JWT_SECRET`
    - `SETUP_SECRET_KEY`
    - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`.

### Step 2: Re-Deploy

- After adding all variables, go to the **Deployments** tab and **re-deploy** your latest commit to apply the new settings.

### Step 3: Initial Database Setup on Vercel (One-Time Only!)

- After the deployment is successful, you must run the one-time setup to prepare your live database.
- Open your browser and visit the following URL. Replace the placeholders with your actual Vercel site name and the secret key you added in Step 1.
  ```
  https://<your-site-name>.vercel.app/api/admin/setup-database?secret=<your_setup_secret_key>
  ```
- You should see a success message in your browser.

Your application is now fully configured and ready. Login, Registration, and all other features should work correctly. This one-time setup prevents server timeouts and ensures a stable, serverless backend.
