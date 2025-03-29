import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const transformations = pgTable("transformations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  originalImage: text("original_image").notNull(),
  transformedImage: text("transformed_image"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransformationSchema = createInsertSchema(transformations).pick({
  userId: true,
  originalImage: true,
  transformedImage: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;
