import express, { Application, Request, Response } from "express";
import session from "express-session";
import multer from "multer";
import path from "path";
import { routes } from "./routes";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false,
}));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Multer configuration for file uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});
app.locals.upload = multer({ storage: storageConfig }).single("document");

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

storage.initialize();
aiService.initialize();