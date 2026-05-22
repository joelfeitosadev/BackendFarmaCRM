import { Request, Response } from 'express';
import { ServiceService } from '../services/service.service';
import { z } from 'zod';
import { ServiceStatus } from '@prisma/client';

const serviceService = new ServiceService();

const createServiceSchema = z.object({
  patientId: z.string().uuid(),
  products: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
    dosageAmount: z.number().min(0).optional(),
    dosageIntervalDays: z.number().min(0).optional()
  })).min(1)
});

const moveServiceSchema = z.object({
  status: z.enum(['ORCAMENTO', 'AGUARDANDO_RECEITA', 'PRONTO_ENTREGA', 'FINALIZADO'])
});

const addPrescriptionSchema = z.object({
  prescriptionData: z.string().min(1)
});

export class ServiceController {
  async create(req: Request, res: Response) {
    const data = createServiceSchema.parse(req.body);
    const service = await serviceService.createService(data);
    res.status(201).json(service);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const service = await serviceService.getServiceById(id as string);
    res.status(200).json(service);
  }

  async move(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const { status } = moveServiceSchema.parse(req.body);
    const service = await serviceService.moveService(id as string, status as ServiceStatus);
    res.status(200).json(service);
  }

  async addPrescription(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const { prescriptionData } = addPrescriptionSchema.parse(req.body);
    const service = await serviceService.addPrescription(id as string, prescriptionData);
    res.status(200).json(service);
  }
}
