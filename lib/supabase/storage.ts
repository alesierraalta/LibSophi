import { getSupabaseBrowserClient } from './browser'
import { getSupabaseServerClient } from './server'

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string,
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
): Promise<{ data: { path: string; fullPath: string } | null; error: any }> {
  const supabase = getSupabaseBrowserClient()
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false
      })

    if (error) {
      console.error('Upload error:', error)
      return { data: null, error }
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      data: {
        path: data.path,
        fullPath: publicUrl
      },
      error: null
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return { data: null, error }
  }
}

/**
 * Upload a profile image (avatar or banner)
 */
export async function uploadProfileImage(
  file: File,
  userId: string,
  type: 'avatar' | 'banner'
): Promise<{ data: string | null; error: any }> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${type}-${Date.now()}.${fileExt}`
  const filePath = `profiles/${fileName}`

  const { data, error } = await uploadFile(file, 'images', filePath, {
    upsert: true,
    contentType: file.type
  })

  if (error) {
    return { data: null, error }
  }

  return { data: data?.fullPath || null, error: null }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: any }> {
  const supabase = getSupabaseBrowserClient()
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return { error }
  } catch (error) {
    console.error('Delete error:', error)
    return { error }
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabaseBrowserClient()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP.'
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
    }
  }

  // Check image dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // For avatars, recommend square images
      // For banners, recommend landscape images
      resolve({ isValid: true })
    }
    img.onerror = () => {
      resolve({
        isValid: false,
        error: 'Archivo de imagen inválido.'
      })
    }
    img.src = URL.createObjectURL(file)
  }) as any

  return { isValid: true }
}
