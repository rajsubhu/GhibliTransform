import { pgTable, text, serial, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  credits: integer("credits").notNull().default(1),
  instagram_username: text("instagram_username"),
  instagram_verified: integer("instagram_verified").notNull().default(0),
  is_admin: integer("is_admin").notNull().default(0),
  created_at: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  credits: true,
  instagram_username: true,
  instagram_verified: true,
  is_admin: true,
});

export const credits_transactions = pgTable("credits_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason", { enum: ['initial', 'instagram_follow', 'admin', 'generation', 'purchase'] }).notNull(),
  created_at: text("created_at").notNull(),
});

export const insertCreditsTransactionSchema = createInsertSchema(credits_transactions).pick({
  user_id: true,
  amount: true,
  reason: true,
});

export const transformations = pgTable("transformations", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => users.id),
  original_image: text("original_image").notNull(),
  transformed_image: text("transformed_image"),
  status: text("status").notNull().default("pending"),
  created_at: text("created_at").notNull(),
});

export const insertTransformationSchema = createInsertSchema(transformations).pick({
  user_id: true,
  original_image: true,
  transformed_image: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCreditsTransaction = z.infer<typeof insertCreditsTransactionSchema>;
export type CreditsTransaction = typeof credits_transactions.$inferSelect;

export type InsertTransformation = z.infer<typeof insertTransformationSchema>;
export type Transformation = typeof transformations.$inferSelect;
