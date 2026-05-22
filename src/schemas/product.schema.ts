import { z } from 'zod';

export const createProductSchema = z.object({
  activeIngredient: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  expirationDate: z.string().datetime(),
  costPrice: z.number().min(0),
  salePrice: z.number().min(0),
  minimumStock: z.number().int().min(0).optional(),
});

export const updateProductSchema = z.object({
  stockQuantity: z.number().int().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  minimumStock: z.number().int().min(0).optional(),
});
