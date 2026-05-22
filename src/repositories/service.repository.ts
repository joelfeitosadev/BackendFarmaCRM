import prisma from '../database/prisma';
import { Prisma, ServiceStatus } from '@prisma/client';
import { ICreateService } from '../interfaces/service.interface';

export class ServiceRepository {
  async create(data: ICreateService) {
    return prisma.service.create({
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
    return prisma.service.findUnique({
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

  async updateStatus(id: string, status: ServiceStatus) {
    return prisma.service.update({
      where: { id },
      data: { status }
    });
  }

  async setPrescription(id: string, prescriptionData: string) {
    return prisma.service.update({
      where: { id },
      data: {
        prescriptionData,
        prescriptionValidated: true
      }
    });
  }
}
