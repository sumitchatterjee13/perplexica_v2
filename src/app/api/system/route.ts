import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic'; // Ensures the route is not cached

export async function GET() {
  try {
    const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin')).limit(1);
    const adminExists = adminUsers.length > 0;
    return NextResponse.json({ adminExists });
  } catch (error) {
    console.error('Error checking for admin user in /api/system:', error);
    return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 });
  }
}