import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (_req, file, cb) {
    const filetypes = /pdf|jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error("Error: File upload only supports PDF, JPEG, and PNG files!")
    );
  },
});

async function createServer() {
  const app: Express = express();
  const isDev = process.env.NODE_ENV !== "production";
  const SessionStore = MemoryStore(session);

  // Basic middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Make upload middleware available
  app.locals.upload = upload;
  
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "development-secret",
      resave: false,
      saveUninitialized: true,
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: !isDev,
      },
    })
  );
  
  // Request logging middleware
  app.use((req, _res, next) => {
    log(`${req.method} ${req.url}`, "express");
    next();
  });

  // Setup the server
  let server;
  if (isDev) {
    server = await setupVite(app, __dirname);
  } else {
    serveStatic(app);
    server = await registerRoutes(app);
  }
  
  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.message || "An unexpected error occurred",
      status: statusCode,
    });
  });

  return { app, server };
}

// Start the server
createServer().then(({ server }) => {
  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});