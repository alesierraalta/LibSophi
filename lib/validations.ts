import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  bio: z.string().max(500, 'La biografía no puede exceder 500 caracteres').optional(),
  avatar_url: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateUserSchema = userSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Book/Work validation schemas
export const workSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  content: z.string().min(100, 'El contenido debe tener al menos 100 caracteres'),
  author_id: z.string().uuid(),
  genre: z.string().min(1, 'El género es requerido'),
  tags: z.array(z.string()).default([]),
  cover_image_url: z.string().url().optional(),
  published: z.boolean().default(false),
  archived: z.boolean().default(false),
  reading_time: z.number().min(1, 'El tiempo de lectura debe ser mayor a 0'),
  views: z.number().default(0),
  likes: z.number().default(0),
  comments_count: z.number().default(0),
  reposts_count: z.number().default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createWorkSchema = workSchema.omit({
  id: true,
  views: true,
  likes: true,
  comments_count: true,
  reposts_count: true,
  created_at: true,
  updated_at: true,
});

export const updateWorkSchema = workSchema.partial().omit({
  id: true,
  author_id: true,
  created_at: true,
  updated_at: true,
});

// Comment validation schemas
export const commentSchema = z.object({
  id: z.string().uuid(),
  work_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1, 'El comentario no puede estar vacío').max(1000, 'El comentario no puede exceder 1000 caracteres'),
  parent_id: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createCommentSchema = commentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'La búsqueda no puede estar vacía'),
  genre: z.string().optional(),
  author: z.string().optional(),
  sortBy: z.enum(['created_at', 'views', 'likes', 'title']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

// Notification schemas
export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['like', 'comment', 'follow', 'mention', 'system']),
  title: z.string(),
  message: z.string(),
  read: z.boolean().default(false),
  data: z.record(z.string(), z.any()).optional(),
  created_at: z.date(),
});

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  created_at: true,
});

// Form validation helpers
export type UserType = z.infer<typeof userSchema>;
export type CreateUserType = z.infer<typeof createUserSchema>;
export type UpdateUserType = z.infer<typeof updateUserSchema>;
export type WorkType = z.infer<typeof workSchema>;
export type CreateWorkType = z.infer<typeof createWorkSchema>;
export type UpdateWorkType = z.infer<typeof updateWorkSchema>;
export type CommentType = z.infer<typeof commentSchema>;
export type CreateCommentType = z.infer<typeof createCommentSchema>;
export type LoginType = z.infer<typeof loginSchema>;
export type RegisterType = z.infer<typeof registerSchema>;
export type SearchType = z.infer<typeof searchSchema>;
export type NotificationType = z.infer<typeof notificationSchema>;
export type CreateNotificationType = z.infer<typeof createNotificationSchema>;

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Error de validación desconocido'] };
  }
};

export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};
