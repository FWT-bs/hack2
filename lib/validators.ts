import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const onboardingSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores'),
  grade_band: z.enum(['middle_school', 'high_school', 'undergraduate', 'graduate', 'other']),
  topic_ids: z.array(z.string()).min(1, 'Select at least one topic'),
})

export const newSessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80),
  topic_id: z.string().min(1, 'Select a topic'),
  goal: z.string().min(3, 'Describe your goal').max(500),
  duration_minutes: z.number().int().positive(),
  allowed_domains: z.array(z.string()),
  blocked_domains: z.array(z.string()),
  mode: z.enum(['public', 'private']),
  join_code: z.string().optional(),
})

export const breakRequestSchema = z.object({
  reason: z.string().min(3, 'Please explain why you need a break').max(500),
  accomplishment_note: z.string().max(500).optional(),
  requested_break_minutes: z.number().int().min(1).max(30),
})

export const activityReportSchema = z.object({
  domain: z.string().min(1),
  url: z.string().url(),
  timestamp: z.string(),
  sessionId: z.string().uuid(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type OnboardingValues = z.infer<typeof onboardingSchema>
export type NewSessionValues = z.infer<typeof newSessionSchema>
export type BreakRequestValues = z.infer<typeof breakRequestSchema>
