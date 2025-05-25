import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import db from '../db';
import { sessions, users } from '../db/schema';
import { cookies } from './cookies';

// JWT secret should be in environment variables in a production app
const JWT_SECRET = process.env.JWT_SECRET || 'perplexica-jwt-secret-key';
const SESSION_COOKIE_NAME = 'perplexica_session';

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Verify a password
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate a JWT token
export const generateToken = (userId: string, expiresIn = '1d'): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

// Verify a JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

// Create a new session
export const createSession = async (userId: string): Promise<string> => {
  const sessionId = uuidv4();
  const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
  });
  
  return sessionId;
};

// Set a session cookie
export const setSessionCookie = async (sessionId: string): Promise<void> => {
  await cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
};

// Get current session
export const getSession = async (): Promise<{ userId: string } | null> => {
  const cookie = await cookies.get(SESSION_COOKIE_NAME);
  const sessionId = cookie?.value;
  
  if (!sessionId) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });
  
  if (!session || session.expiresAt < now) {
    // Session expired or not found
    return null;
  }
  
  return { userId: session.userId };
};

// Get current user
export const getCurrentUser = async () => {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  return db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
};

// Clear session
export const clearSession = async (): Promise<void> => {
  await cookies.delete(SESSION_COOKIE_NAME);
};
