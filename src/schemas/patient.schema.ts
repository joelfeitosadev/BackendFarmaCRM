import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  lgpdConsent: z.boolean().optional(),
  medicalHistory: z.string().optional().nullable()
});

export const updatePatientSchema = z.object({
  phone: z.string().min(10).optional(),
  lgpdConsent: z.boolean().optional()
});

export const consentSchema = z.object({
  lgpdConsent: z.boolean()
});

export const idSchema = z.string().uuid();
