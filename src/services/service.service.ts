import { ServiceRepository } from '../repositories/service.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { ProductRepository } from '../repositories/product.repository';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import { ICreateService } from '../interfaces/service.interface';
import { ServiceStatus } from '@prisma/client';
import prisma from '../database/prisma';

export class ServiceService {
  private serviceRepository = new ServiceRepository();
  private patientRepository = new PatientRepository();
  private productRepository = new ProductRepository();

  async createService(data: ICreateService) {
    const patient = await this.patientRepository.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    
    if (!data.products || data.products.length === 0) {
      throw new ConflictError('Products array is required and cannot be empty');
    }

    return this.serviceRepository.create(data);
  }

  async getServiceById(id: string) {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  async moveService(id: string, newStatus: ServiceStatus) {
    const service = await this.getServiceById(id);

    const validTransitions: Record<string, string> = {
      'ORCAMENTO': 'AGUARDANDO_RECEITA',
      'AGUARDANDO_RECEITA': 'PRONTO_ENTREGA',
      'PRONTO_ENTREGA': 'FINALIZADO'
    };

    if (validTransitions[service.status] !== newStatus) {
      throw new ConflictError(`Invalid status transition from ${service.status} to ${newStatus}`);
    }

    if (newStatus === 'FINALIZADO' && !service.prescriptionValidated) {
      throw new ForbiddenError('Cannot finalize without validated prescription');
    }

    if (newStatus === 'PRONTO_ENTREGA') {
      // Check stock and decrement
      await prisma.$transaction(async (tx) => {
        for (const sp of service.products) {
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

    return this.serviceRepository.updateStatus(id, newStatus);
  }

  async addPrescription(id: string, prescriptionData: string) {
    if (!prescriptionData) {
      throw new ConflictError('prescriptionData is required');
    }
    await this.getServiceById(id);
    const encrypted = Buffer.from(prescriptionData).toString('base64');
    return this.serviceRepository.setPrescription(id, encrypted);
  }
}
