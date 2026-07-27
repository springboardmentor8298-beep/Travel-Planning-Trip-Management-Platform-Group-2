import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a number');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(100),
    email: z.string().trim().email('Enter a valid email'),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password')
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email')
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export const tripSchema = z
  .object({
    title: z.string().trim().min(2, 'Give your trip a title').max(150),
    destinationId: z.string().min(1, 'Choose a destination'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    totalBudget: z
      .union([z.string().length(0), z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')])
      .optional(),
    notes: z.string().max(2000).optional()
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date cannot be before start date',
    path: ['endDate']
  });

export const itineraryDaySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  title: z.string().max(150).optional(),
  notes: z.string().max(2000).optional()
});

export const activitySchema = z
  .object({
    title: z.string().trim().min(2, 'Give the activity a title').max(150),
    activityType: z.string().min(1, 'Choose a type'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    location: z.string().max(255).optional(),
    estimatedCost: z
      .union([z.string().length(0), z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')])
      .optional(),
    notes: z.string().max(2000).optional(),
    reminderEnabled: z.boolean().optional()
  })
  .refine((data) => !data.startTime || !data.endTime || data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime']
  });
