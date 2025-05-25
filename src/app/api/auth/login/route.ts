import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth/utils';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(users.id, user.id));

    // Create session and set cookie
    const sessionId = await createSession(user.id);
    await setSessionCookie(sessionId);

    return Response.json(
      { 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
