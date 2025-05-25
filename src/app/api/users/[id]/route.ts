import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser, hashPassword } from '@/lib/auth/utils';

// Get user by ID (admin only)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Check if current user is an admin
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    const userId = resolvedParams.id;
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user) {
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove password field from response
    const { password, ...sanitizedUser } = user;
    
    return Response.json({ user: sanitizedUser }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return Response.json(
      { message: 'An error occurred while fetching user' },
      { status: 500 }
    );
  }
}

// Update user (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Check if current user is an admin
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    const userId = resolvedParams.id;
    const { username, password, name, role } = await request.json();
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user) {
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      
      if (existingUser) {
        return Response.json(
          { message: 'Username already exists' },
          { status: 409 }
        );
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (role === 'admin' || role === 'user') updateData.role = role;
    
    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    // Update user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));
    
    return Response.json(
      { message: 'User updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return Response.json(
      { message: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
}

// Delete user (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Check if current user is an admin
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    const userId = resolvedParams.id;
    
    // Prevent deleting self
    if (userId === currentUser.id) {
      return Response.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Delete user
    await db.delete(users).where(eq(users.id, userId));
    
    return Response.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json(
      { message: 'An error occurred while deleting user' },
      { status: 500 }
    );
  }
}
