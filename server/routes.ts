import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./supabase";
import fetch from "node-fetch";
import multer from "multer";
import { z } from "zod";
import { nanoid } from "nanoid";
import { insertUserSchema } from "@shared/schema";
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_ZLEbNhLs2qHoxB',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'd9A2spI4j50n72t8tUvjkg98'
});

// Define types for type safety
// Import Express's File type definition but make our own compatible version
// that doesn't require the 'stream' property
type MulterFile = Express.Multer.File;

// Create a custom request type that includes the file property
interface MulterRequest extends Request {
  file?: MulterFile;
  user?: any; // Will hold the authenticated user
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

// Authentication middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    // Get user details from our storage
    const user = await storage.getUserByEmail(data.user.email || '');
    
    if (!user) {
      try {
        // First time user - create record in our storage
        const newUser = await storage.createUser({
          email: data.user.email || '',
          credits: 1,
          instagram_username: null,
          instagram_verified: 0,
          is_admin: 0
        });
        
        (req as MulterRequest).user = newUser;
      } catch (createError) {
        console.error('User creation error:', createError);
        return res.status(500).json({ message: 'Failed to create user profile' });
      }
    } else {
      (req as MulterRequest).user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Registration body validation schema
const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  instagram_username: z.string().optional(),
});

// Login body validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Instagram verification schema
const instagramVerificationSchema = z.object({
  instagram_username: z.string(),
});

// Razorpay order schema
const razorpayOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  credits: z.number().positive(),
});

// Razorpay payment verification schema
const razorpayVerificationSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  credits: z.number().positive(),
});

// Schema definitions for payment handling
// Using only Razorpay as requested by the user

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = registrationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors
        });
      }
      
      const { email, password, instagram_username } = result.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        return res.status(500).json({ 
          message: "Failed to register user", 
          error: authError.message 
        });
      }
      
      // Create user in our storage
      const userData = {
        email,
        instagram_username: instagram_username || null,
      };
      
      const user = await storage.createUser(userData);
      
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          instagram_username: user.instagram_username,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors
        });
      }
      
      const { email, password } = result.data;
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return res.status(401).json({ 
          message: "Authentication failed", 
          error: error.message 
        });
      }
      
      // Get or create user in our storage
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // First login after signup - create user record
        user = await storage.createUser({
          email,
          credits: 1,
          instagram_username: null,
          instagram_verified: 0,
          is_admin: 0
        });
      }
      
      return res.status(200).json({
        message: "Login successful",
        token: data.session.access_token,
        user: {
          id: user.id,
          email: user.email,
          credits: user.credits,
          instagram_username: user.instagram_username,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // User routes (protected)
  app.get("/api/user/me", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      return res.status(200).json({
        id: user.id,
        email: user.email,
        credits: user.credits,
        instagram_username: user.instagram_username,
        instagram_verified: user.instagram_verified,
        is_admin: user.is_admin
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Instagram verification and credit earning (one-time only)
  app.post("/api/user/verify-instagram", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const result = instagramVerificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors
        });
      }
      
      const user = req.user;
      const { instagram_username } = result.data;
      
      // Check if user has already verified Instagram
      if (user.instagram_verified === 1) {
        return res.status(400).json({ 
          message: "Instagram has already been verified for this account" 
        });
      }
      
      // For now, we'll just pretend to verify and grant credits
      // In a real app, you'd do an actual verification through Instagram's API
      
      // Update user's Instagram verification status
      const updatedUser = await storage.updateUserInstagramVerified(user.id);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user's credits
      const userWithCredits = await storage.updateUserCredits(updatedUser.id, updatedUser.credits + 2);
      
      // Add credits transaction
      await storage.createCreditsTransaction({
        user_id: user.id,
        amount: 2,
        reason: 'instagram_follow'
      });
      
      return res.status(200).json({
        message: "Instagram verified and credits awarded",
        credits: userWithCredits?.credits,
      });
    } catch (error) {
      console.error("Instagram verification error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user credits transactions
  app.get("/api/user/credits", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      const transactions = await storage.getUserCreditsTransactions(user.id);
      
      return res.status(200).json({
        credits: user.credits,
        transactions
      });
    } catch (error) {
      console.error("Get credits error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Transform image using Replicate API (protected route)
  app.post("/api/transform", [authMiddleware, upload.single("image")], async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      // Check if user has credits
      if (user.credits < 1) {
        return res.status(403).json({ 
          message: "Insufficient credits. Please verify your Instagram to earn more credits." 
        });
      }
      
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
            // Add prompt parameter which is required by this model
            prompt: "Studio Ghibli style, anime, Hayao Miyazaki, detailed, dreamy, whimsical",
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
      
      // Create transformation record
      const transformation = await storage.createTransformation({
        user_id: user.id,
        original_image: dataURI,
        transformed_image: null,
        status: "processing"
      });
      
      // Deduct a credit from the user
      const updatedUser = await storage.updateUserCredits(user.id, user.credits - 1);
      
      // Log the credit transaction
      await storage.createCreditsTransaction({
        user_id: user.id,
        amount: -1,
        reason: 'generation'
      });

      return res.status(202).json({
        id: prediction.id,
        status: prediction.status,
        originalImage: dataURI,
        transformationId: transformation.id,
        remainingCredits: updatedUser?.credits || 0
      });
    } catch (error) {
      console.error("Transform error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get transformation status
  app.get("/api/transform/:id", authMiddleware, async (req: MulterRequest, res: Response) => {
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
      
      // If the prediction is complete and successful, update our transformation record
      if (prediction.status === "succeeded" && prediction.output) {
        // Here we would find and update the transformation record if needed
        // For now, we'll just return the prediction data
      }
      
      return res.status(200).json(prediction);
    } catch (error) {
      console.error("Get transformation error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get user's transformations
  app.get("/api/user/transformations", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      const transformations = await storage.getUserTransformations(user.id);
      
      return res.status(200).json(transformations);
    } catch (error) {
      console.error("Get transformations error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Razorpay payment routes
  // Create a new order
  app.post("/api/create-order", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      // Validate request body
      const result = razorpayOrderSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { amount, currency, credits } = result.data;
      
      // Ensure we have Razorpay keys
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ 
          message: "Server configuration error: Missing payment gateway credentials" 
        });
      }
      
      // Create an order
      const options = {
        amount: amount * 100, // Convert to smallest currency unit (paise for INR)
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: req.user.id,
          credits: credits.toString(),
          purpose: 'credit_purchase'
        }
      };
      
      const order = await razorpay.orders.create(options);
      
      return res.status(200).json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        credits,
        key_id: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error("Create order error:", error);
      return res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Admin route to get all users
  app.get("/api/admin/users", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      // Check if user is admin
      if (user.is_admin !== 1) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      // Get all users
      const users = await storage.getAllUsers();
      
      return res.status(200).json({
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          credits: user.credits,
          instagram_username: user.instagram_username,
          instagram_verified: user.instagram_verified,
          is_admin: user.is_admin,
          created_at: user.created_at
        }))
      });
    } catch (error) {
      console.error("Admin get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin route to set admin status
  app.post("/api/admin/set-admin", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      // Check if user is already admin
      if (user.is_admin !== 1) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      // Validate request body
      const result = z.object({
        userId: z.string(),
        isAdmin: z.boolean()
      }).safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { userId, isAdmin } = result.data;
      
      // Update user admin status
      const updatedUser = await storage.updateUserAdmin(userId, isAdmin);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        message: `User ${isAdmin ? 'granted' : 'revoked'} admin privileges`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          is_admin: updatedUser.is_admin
        }
      });
    } catch (error) {
      console.error("Admin set admin error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin route to update user credits
  app.post("/api/admin/update-credits", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      const user = req.user;
      
      // Check if user is admin
      if (user.is_admin !== 1) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      // Validate request body
      const result = z.object({
        userId: z.string(),
        credits: z.number().int(),
        reason: z.string()
      }).safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { userId, credits, reason } = result.data;
      
      // Get target user
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate credit change
      const creditChange = credits - targetUser.credits;
      
      // Update user credits
      const updatedUser = await storage.updateUserCredits(userId, credits);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update credits" });
      }
      
      // Record the transaction
      await storage.createCreditsTransaction({
        user_id: userId,
        amount: creditChange,
        reason: 'admin'
      });
      
      return res.status(200).json({
        message: "Credits updated successfully",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          credits: updatedUser.credits
        }
      });
    } catch (error) {
      console.error("Admin update credits error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Payment verification for Razorpay
  app.post("/api/verify-payment", authMiddleware, async (req: MulterRequest, res: Response) => {
    try {
      // Validate request body
      const result = razorpayVerificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, credits } = result.data;
      
      // Verify the payment signature
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');
      
      if (digest !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
      
      // Add credits to user
      const user = req.user;
      const updatedUser = await storage.updateUserCredits(user.id, user.credits + credits);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Record the transaction
      await storage.createCreditsTransaction({
        user_id: user.id,
        amount: credits,
        reason: 'purchase'
      });
      
      return res.status(200).json({
        message: "Payment verified and credits added",
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        credits: updatedUser.credits
      });
    } catch (error) {
      console.error("Verify payment error:", error);
      return res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
