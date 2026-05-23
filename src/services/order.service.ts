import { OrderRepository } from '../repositories/order.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { ICreateOrder } from '../interfaces/order.interface';
import { OrderStatus } from '@prisma/client';
import prisma from '../database/prisma';

export class OrderService {
  private orderRepository = new OrderRepository();
  private patientRepository = new PatientRepository();
  private productRepository = new ProductRepository();

  async createOrder(data: ICreateOrder) {
    const patient = await this.patientRepository.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    if (!data.products || data.products.length === 0) {
      throw new ConflictError('Products array is required and cannot be empty');
    }

    return this.orderRepository.create(data);
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    return order;
  }

  async moveOrder(id: string, newStatus: OrderStatus) {
    const order = await this.getOrderById(id);

    const validTransitions: Record<string, string> = {
      'ORCAMENTO': 'AGUARDANDO_RECEITA',
      'AGUARDANDO_RECEITA': 'PRONTO_ENTREGA',
      'PRONTO_ENTREGA': 'FINALIZADO'
    };

    if (validTransitions[order.status] !== newStatus) {
      throw new ConflictError(`Invalid status transition from ${order.status} to ${newStatus}`);
    }

    if (newStatus === 'FINALIZADO' && !order.prescriptionValidated) {
      throw new ForbiddenError('Cannot finalize without validated prescription');
    }

    if (newStatus === 'PRONTO_ENTREGA') {
      await prisma.$transaction(async (tx) => {
        for (const sp of order.products) {
          const product = await tx.product.findUnique({ where: { id: sp.productId }});
          if (!product || product.stockQuantity < sp.quantity) {
            throw new ConflictError(`Insufficient stock for product ${sp.productId}`);
          }
          await tx.product.update({
            where: { id: sp.productId },
            data: { stockQuantity: product.stockQuantity - sp.quantity }
          });
        }
      });
    }

    return this.orderRepository.updateStatus(id, newStatus);
  }

  async addPrescription(id: string, prescriptionData: string) {
    if (!prescriptionData) {
      throw new ConflictError('prescriptionData is required');
    }
    await this.getOrderById(id);
    const encrypted = Buffer.from(prescriptionData).toString('base64');
    return this.orderRepository.setPrescription(id, encrypted);
  }
}
