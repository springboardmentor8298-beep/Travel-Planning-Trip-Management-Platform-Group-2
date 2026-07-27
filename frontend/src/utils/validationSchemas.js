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
