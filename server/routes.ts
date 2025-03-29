import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import multer from "multer";
import { z } from "zod";
import { nanoid } from "nanoid";

// Define types for type safety
// Import Express's File type definition but make our own compatible version
// that doesn't require the 'stream' property
type MulterFile = Express.Multer.File;

// Create a custom request type that includes the file property
interface MulterRequest extends Request {
  file?: MulterFile;
}

interface ReplicatePrediction {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Transform image using Replicate API
  app.post("/api/transform", upload.single("image"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      // Check file mime type
      const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Only JPG, PNG, and WEBP images are supported." 
        });
      }

      // Get API key from environment
      const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
      if (!REPLICATE_API_KEY) {
        return res.status(500).json({ 
          message: "Server configuration error: Missing API key" 
        });
      }

      // Convert image to base64
      const base64Image = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      // Call Replicate API for Mirage Ghibli model
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_KEY}`
        },
        body: JSON.stringify({
          // Use the Mirage Ghibli model as specified by the user
          version: "166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
          input: {
            image: dataURI,
            // Add optional parameters
            strength: 0.75,  // How strongly to transform the image (0-1)
            guidance_scale: 7.5 // How closely to follow the prompt (higher values = closer)
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Replicate API error:", errorData);
        return res.status(response.status).json({ 
          message: "Error from Mirage Ghibli AI service", 
          details: errorData 
        });
      }

      const prediction = await response.json() as ReplicatePrediction;
      
      // Store original image for reference (if we had a real storage system)
      const transformationData = {
        id: 0,
        userId: 1, // Default user ID since we're not implementing auth
        originalImage: req.file.originalname,
        transformedImage: null,
        status: "processing",
        createdAt: new Date(),
      };

      return res.status(202).json({
        id: prediction.id,
        status: prediction.status,
        originalImage: dataURI,
      });
    } catch (error) {
      console.error("Transform error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get transformation status
  app.get("/api/transform/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get API key from environment
      const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
      if (!REPLICATE_API_KEY) {
        return res.status(500).json({ 
          message: "Server configuration error: Missing API key" 
        });
      }

      // Call Replicate API to check status
      const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
          message: "Error retrieving transformation status", 
          details: errorData 
        });
      }

      const prediction = await response.json() as ReplicatePrediction;
      return res.status(200).json(prediction);
    } catch (error) {
      console.error("Get transformation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
