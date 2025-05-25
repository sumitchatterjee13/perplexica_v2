import { eq, isNull, or } from 'drizzle-orm';
import db from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/utils';

export const GET = async (req: Request) => {
  try {
    // Get current user session
    const session = await getSession();
    
    if (!session) {
      return Response.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Filter chats by the current user's ID or chats that don't have a userId (backward compatibility)
    // We use the or condition to include chats without a userId during the transition period
    let userChats = await db.query.chats.findMany({
      where: or(
        eq(chats.userId, session.userId),
        isNull(chats.userId)
      )
    });
    
    // Return chats in reverse chronological order (newest first)
    userChats = userChats.reverse();
    
    return Response.json({ chats: userChats }, { status: 200 });
  } catch (err) {
    console.error('Error in getting chats: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
