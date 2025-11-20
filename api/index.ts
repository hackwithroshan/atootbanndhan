// api/index.ts
import app from '../backend'; // This resolves to ../backend/index.ts

/**
 * Vercel Serverless Function Entry Point.
 * This function acts as a bridge between Vercel's runtime and the Express app.
 * It's wrapped in a try-catch block to ensure that even if the Express app
 * throws an error during initialization, we catch it and return a valid JSON error response.
 * This is the primary fix for the "Unexpected end of JSON input" error on the frontend.
 */
export default async function handler(req: any, res: any) {
  try {
    // Pass the request to the Express app.
    // Express will handle routing, middleware, and sending the response.
    return app(req, res);
  } catch (err: any) {
    console.error("🔥 Vercel Handler Fatal Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        msg: "A fatal server error occurred inside the Vercel handler.", 
        error: err?.message || 'Unknown error' 
      });
    }
  }
}