import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";
import multer from "multer";
import { z } from "zod";
import { nanoid } from "nanoid";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Transform image using Replicate API
  app.post("/api/transform", upload.single("image"), async (req, res) => {
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

      // Call Replicate API
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${REPLICATE_API_KEY}`
        },
        body: JSON.stringify({
          version: "c09d3648fd62c9fc1bbb70a928d8fe56ef3dcd844c9ab9c2eefbf3df8dbbd2bb",
          input: {
            image: dataURI
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

      const prediction = await response.json();
      
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
  app.get("/api/transform/:id", async (req, res) => {
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

      const prediction = await response.json();
      return res.status(200).json(prediction);
    } catch (error) {
      console.error("Get transformation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
