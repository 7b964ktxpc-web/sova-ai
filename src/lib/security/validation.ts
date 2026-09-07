import { z } from 'zod'

export const emailSchema = z.string().email('Некорректный email адрес')
export const passwordSchema = z.string().min(8, 'Пароль должен быть не менее 8 символов').max(100)
export const requiredStringSchema = z.string().min(1, 'Это поле обязательно')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
})

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, 'Введите имя').max(100).optional(),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const assistantSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100),
  description: z.string().max(500).optional(),
  purpose: z.string().max(1000).optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
})

export const assistantUpdateSchema = assistantSchema.partial()

export const knowledgeUploadSchema = z.object({
  assistantId: z.string().uuid(),
  file: z.instanceof(File).optional(),
  url: z.string().url().optional(),
})

export const channelSchema = z.object({
  assistantId: z.string().uuid(),
  type: z.enum(['telegram', 'web', 'api']),
  config: z.record(z.string(), z.unknown()),
  webhookUrl: z.string().url().optional(),
})

export function validateAssistantName(name: string): { valid: boolean; message?: string } {
  if (name.length < 1) return { valid: false, message: 'Имя обязательно' }
  if (name.length > 100) return { valid: false, message: 'Имя слишком длинное (максимум 100 символов)' }
  return { valid: true }
}

export function validateFileType(file: File, allowedTypes: string[]): { valid: boolean; message?: string } {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !allowedTypes.includes(ext)) {
    return { valid: false, message: `Неподдерживаемый формат файла. Разрешены: ${allowedTypes.join(', ')}` }
  }
  return { valid: true }
}

export function validateFileSize(file: File, maxSizeMB: number = 10): { valid: boolean; message?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return { valid: false, message: `Файл слишком большой. Максимум ${maxSizeMB}MB` }
  }
  return { valid: true }
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 10000)
}
