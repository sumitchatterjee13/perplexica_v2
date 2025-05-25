import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser, hashPassword } from '@/lib/auth/utils';

// Get all users (admin only)
export async function GET() {
  try {
    // Check if current user is an admin
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Get all users
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
    
    // Remove password field from response
    const sanitizedUsers = allUsers.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));
    
    return Response.json({ users: sanitizedUsers }, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return Response.json(
      { message: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}

// Create a new user (admin only)
export async function POST(request: Request) {
  try {
    // Check if current user is an admin
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    const { username, password, name, role } = await request.json();
    
    // Validate input
    if (!username || !password || !name) {
      return Response.json(
        { message: 'Username, password, and name are required' },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    
    if (existingUser) {
      return Response.json(
        { message: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const userId = uuidv4();
    await db.insert(users).values({
      id: userId,
      username,
      password: hashedPassword,
      name,
      role: role === 'admin' ? 'admin' : 'user', // Only allow 'admin' or 'user'
      createdAt: new Date().toISOString(),
    });
    
    return Response.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return Response.json(
      { message: 'An error occurred while creating user' },
      { status: 500 }
    );
  }
}
