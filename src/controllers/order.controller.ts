import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const orderService = new OrderService();

import { createOrderSchema, moveOrderSchema, addPrescriptionSchema } from '../schemas/order.schema';

export class OrderController {
  async create(req: Request, res: Response) {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(data);
    res.status(201).json(order);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const order = await orderService.getOrderById(id as string);
    res.status(200).json(order);
  }

  async move(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const { status } = moveOrderSchema.parse(req.body);
    const order = await orderService.moveOrder(id as string, status as OrderStatus);
    res.status(200).json(order);
  }

  async addPrescription(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const { prescriptionData } = addPrescriptionSchema.parse(req.body);
    const order = await orderService.addPrescription(id as string, prescriptionData);
    res.status(200).json(order);
  }
}
