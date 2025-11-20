// api/index.ts
import app from "../backend/index";

/**
 * Vercel Serverless Function Entry Point.
 * This function acts as a bridge between Vercel's runtime and the Express app.
 * It's wrapped in an async try-catch block to ensure that even if the Express app
 * throws a fatal error during initialization or execution, we catch it and
 * return a valid JSON error response. This is the primary fix for the
 * "Unexpected end of JSON input" error on the frontend, which happens when
 * Vercel sends an HTML error page instead of JSON.
 */
export default async function handler(req: any, res: any) {
  try {
    // Pass the request to the Express app.
    // Express will handle routing, middleware, and sending the response.
    return app(req, res);
  } catch (err: any) {
    // This is a safety net for catastrophic errors during app startup.
    console.error("🔥 Vercel Handler Fatal Error:", err);
    
    // Ensure we don't try to send headers if they are already sent.
    if (!res.headersSent) {
      res.status(500).json({ 
        msg: "A fatal server error occurred inside the Vercel handler.", 
        error: err?.message || 'Unknown error' 
      });
    }
  }
}
