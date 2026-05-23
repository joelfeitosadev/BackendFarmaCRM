import prisma from '../database/prisma';
import { Prisma, OrderStatus } from '@prisma/client';
import { ICreateOrder } from '../interfaces/order.interface';

export class OrderRepository {
  async create(data: ICreateOrder) {
    return prisma.order.create({
      data: {
        patientId: data.patientId,
        status: 'ORCAMENTO',
        products: {
          create: data.products.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            dosageAmount: p.dosageAmount || 1,
            dosageIntervalDays: p.dosageIntervalDays || 1
          }))
        }
      },
      include: {
        products: true
      }
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          }
        },
        patient: true
      }
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  async setPrescription(id: string, prescriptionData: string) {
    return prisma.order.update({
      where: { id },
      data: {
        prescriptionData,
        prescriptionValidated: true
      }
    });
  }
}
