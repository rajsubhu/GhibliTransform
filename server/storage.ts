import { users, type User, type InsertUser, transformations, type Transformation, type InsertTransformation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transformation methods
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: number): Promise<Transformation | undefined>;
  updateTransformation(id: number, data: Partial<Transformation>): Promise<Transformation | undefined>;
  getUserTransformations(userId: number): Promise<Transformation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transformationsMap: Map<number, Transformation>;
  private userIdCounter: number;
  private transformationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transformationsMap = new Map();
    this.userIdCounter = 1;
    this.transformationIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTransformation(transformation: InsertTransformation): Promise<Transformation> {
    const id = this.transformationIdCounter++;
    const now = new Date();
    const newTransformation: Transformation = {
      ...transformation,
      id,
      createdAt: now,
    };
    this.transformationsMap.set(id, newTransformation);
    return newTransformation;
  }

  async getTransformation(id: number): Promise<Transformation | undefined> {
    return this.transformationsMap.get(id);
  }

  async updateTransformation(id: number, data: Partial<Transformation>): Promise<Transformation | undefined> {
    const transformation = await this.getTransformation(id);
    if (!transformation) return undefined;

    const updatedTransformation = { ...transformation, ...data };
    this.transformationsMap.set(id, updatedTransformation);
    return updatedTransformation;
  }

  async getUserTransformations(userId: number): Promise<Transformation[]> {
    return Array.from(this.transformationsMap.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
