import { 
  users, type User, type InsertUser, 
  transformations, type Transformation, type InsertTransformation,
  credits_transactions, type CreditsTransaction, type InsertCreditsTransaction
} from "@shared/schema";
import { supabase } from './supabase';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User | undefined>;
  updateUserInstagramVerified(userId: string): Promise<User | undefined>;
  updateUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined>;
  
  // Credits transaction methods
  createCreditsTransaction(transaction: InsertCreditsTransaction): Promise<CreditsTransaction>;
  getUserCreditsTransactions(userId: string): Promise<CreditsTransaction[]>;
  
  // Transformation methods
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: number): Promise<Transformation | undefined>;
  updateTransformation(id: number, data: Partial<Transformation>): Promise<Transformation | undefined>;
  getUserTransformations(userId: string): Promise<Transformation[]>;
}

export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }
  
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data as User[];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Add timestamp and default values
    const userWithDefaults = {
      ...user,
      created_at: new Date().toISOString(),
      credits: user.credits || 1,
      instagram_verified: user.instagram_verified || 0,
      is_admin: user.is_admin || 0
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([userWithDefaults])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message}`);
    }
    
    // Create initial credit transaction
    await this.createCreditsTransaction({
      user_id: data.id,
      amount: 1,
      reason: 'initial'
    });
    
    return data as User;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ credits })
      .eq('id', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }
  
  async updateUserInstagramVerified(userId: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ instagram_verified: 1 })
      .eq('id', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }
  
  async updateUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin ? 1 : 0 })
      .eq('id', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  // Credits transaction methods
  async createCreditsTransaction(transaction: InsertCreditsTransaction): Promise<CreditsTransaction> {
    // Add timestamp if not present
    const transactionWithTimestamp = {
      ...transaction,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('credits_transactions')
      .insert([transactionWithTimestamp])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create credits transaction: ${error?.message}`);
    }
    
    return data as CreditsTransaction;
  }

  async getUserCreditsTransactions(userId: string): Promise<CreditsTransaction[]> {
    const { data, error } = await supabase
      .from('credits_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data as CreditsTransaction[];
  }

  // Transformation methods
  async createTransformation(transformation: InsertTransformation): Promise<Transformation> {
    // Add timestamp if not present
    const transformationWithTimestamp = {
      ...transformation,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('transformations')
      .insert([transformationWithTimestamp])
      .select()
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to create transformation: ${error?.message}`);
    }
    
    return data as Transformation;
  }

  async getTransformation(id: number): Promise<Transformation | undefined> {
    const { data, error } = await supabase
      .from('transformations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Transformation;
  }

  async updateTransformation(id: number, updates: Partial<Transformation>): Promise<Transformation | undefined> {
    const { data, error } = await supabase
      .from('transformations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Transformation;
  }

  async getUserTransformations(userId: string): Promise<Transformation[]> {
    const { data, error } = await supabase
      .from('transformations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    return data as Transformation[];
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private creditsTransactions: Map<string, CreditsTransaction[]>;
  private transformationsMap: Map<number, Transformation>;
  private transformationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.creditsTransactions = new Map();
    this.transformationsMap = new Map();
    this.transformationIdCounter = 1;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => {
      // Convert string dates to timestamps for comparison
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const user: User = { 
      ...insertUser, 
      id, 
      created_at: now,
      credits: 1,
      instagram_username: insertUser.instagram_username || null,
      instagram_verified: 0,
      is_admin: 0
    };
    
    this.users.set(id, user);
    
    // Create initial credit transaction
    await this.createCreditsTransaction({
      user_id: id,
      amount: 1,
      reason: 'initial'
    });
    
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, credits };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserInstagramVerified(userId: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, instagram_verified: 1 };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserAdmin(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, is_admin: isAdmin ? 1 : 0 };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Credits transaction methods
  async createCreditsTransaction(transaction: InsertCreditsTransaction): Promise<CreditsTransaction> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newTransaction: CreditsTransaction = {
      ...transaction,
      id,
      created_at: now
    };
    
    const userTransactions = this.creditsTransactions.get(transaction.user_id) || [];
    userTransactions.push(newTransaction);
    this.creditsTransactions.set(transaction.user_id, userTransactions);
    
    return newTransaction;
  }

  async getUserCreditsTransactions(userId: string): Promise<CreditsTransaction[]> {
    return this.creditsTransactions.get(userId) || [];
  }

  // Transformation methods
  async createTransformation(transformation: InsertTransformation): Promise<Transformation> {
    const id = this.transformationIdCounter++;
    const now = new Date().toISOString();
    
    const newTransformation: Transformation = {
      ...transformation,
      id,
      created_at: now,
      status: transformation.status || 'processing',
      user_id: transformation.user_id || null,
      transformed_image: transformation.transformed_image || null
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

  async getUserTransformations(userId: string): Promise<Transformation[]> {
    return Array.from(this.transformationsMap.values())
      .filter(t => t.user_id === userId)
      .sort((a, b) => {
        // Convert string dates to timestamps for comparison
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
  }
}

// Use Supabase for storage
export const storage = new SupabaseStorage();
