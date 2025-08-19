import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get current session
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

// Get current user
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user;
}

// Register new user
export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'El usuario ya existe con este email'
      };
    }

    // Check if username is taken
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', validatedData.username)
      .single();

    if (existingUsername) {
      return {
        success: false,
        error: 'El nombre de usuario ya está en uso'
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: validatedData.email,
        name: validatedData.name,
        username: validatedData.username,
        password_hash: passwordHash,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Error al crear la cuenta'
      };
    }

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

// Verify user credentials
export async function verifyCredentials(email: string, password: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar_url: user.avatar_url,
    };
  } catch (error) {
    console.error('Credential verification error:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: {
  name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
}) {
  try {
    // Check if username is taken (if being updated)
    if (data.username) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', data.username)
        .neq('id', userId)
        .single();

      if (existingUsername) {
        return {
          success: false,
          error: 'El nombre de usuario ya está en uso'
        };
      }
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Error al actualizar el perfil'
      };
    }

    return {
      success: true,
      user: updatedUser
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

// Change user password
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: 'Contraseña actual incorrecta'
      };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: 'Error al cambiar la contraseña'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Password change error:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

// Delete user account
export async function deleteUserAccount(userId: string) {
  try {
    // Delete user data (cascade should handle related data)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: 'Error al eliminar la cuenta'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Account deletion error:', error);
    return {
      success: false,
      error: 'Error interno del servidor'
    };
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, username, bio, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Get user by username
export async function getUserByUsername(username: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, username, bio, avatar_url, created_at')
      .eq('username', username)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get user by username error:', error);
    return null;
  }
}

// Check if user is authenticated and has permission
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Check if user owns resource
export async function requireOwnership(resourceUserId: string) {
  const user = await requireAuth();
  
  if (user.id !== resourceUserId) {
    throw new Error('Unauthorized: You do not own this resource');
  }
  
  return user;
}

// Rate limiting for auth operations
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now();
  const attempts = authAttempts.get(identifier);
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  // Increment attempts
  attempts.count++;
  attempts.lastAttempt = now;
  
  return true;
}
