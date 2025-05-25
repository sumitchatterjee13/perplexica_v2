import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { sessions } from '@/lib/db/schema';
import { clearSession } from '@/lib/auth/utils';
import { cookies } from '@/lib/auth/cookies';

export async function POST() {
  try {
    // Get the session ID from the cookie
    const cookie = await cookies.get('perplexica_session');
    const sessionId = cookie?.value;
    
    if (sessionId) {
      // Delete the session from the database
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    
    // Clear the session cookie
    await clearSession();
    
    return Response.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
