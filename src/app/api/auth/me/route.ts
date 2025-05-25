import { getCurrentUser } from '@/lib/auth/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return Response.json({ authenticated: false }, { status: 401 });
    }
    
    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    return Response.json(
      { message: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
