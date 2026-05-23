import { z } from 'zod';

export const createOrderSchema = z.object({
  patientId: z.string().uuid(),
  products: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
    dosageAmount: z.number().min(0).optional(),
    dosageIntervalDays: z.number().min(0).optional()
  })).min(1)
});

export const moveOrderSchema = z.object({
  status: z.enum(['ORCAMENTO', 'AGUARDANDO_RECEITA', 'PRONTO_ENTREGA', 'FINALIZADO'])
});

export const addPrescriptionSchema = z.object({
  prescriptionData: z.string().min(1)
});
