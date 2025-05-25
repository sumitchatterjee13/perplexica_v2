import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/utils';

export async function POST(request: Request) {
  try {
    // Verify setup key from request matches environment variable
    const { username, password, name, setupKey } = await request.json();
    
    // Check if SETUP_KEY is defined in environment variables
    const envSetupKey = process.env.SETUP_KEY;
    if (!envSetupKey) {
      return NextResponse.json(
        { error: 'Setup is not configured. SETUP_KEY environment variable is missing.' },
        { status: 500 }
      );
    }
    
    // Validate setup key
    if (setupKey !== envSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      );
    }
    
    // Check if any admin user already exists
    const existingAdmins = await db.select().from(users).where(eq(users.role, 'admin'));
    
    if (existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. Setup cannot be used.' },
        { status: 403 }
      );
    }
    
    // Validate request
    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Create admin user
    const hashedPassword = await hashPassword(password);
    const newAdmin = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      name,
      role: 'admin' as const, // Type assertion to match the enum in schema
      createdAt: new Date().toISOString(),
    };
    
    await db.insert(users).values(newAdmin);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin user created successfully',
        user: {
          id: newAdmin.id,
          username: newAdmin.username,
          name: newAdmin.name,
          role: newAdmin.role,
          createdAt: newAdmin.createdAt
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
