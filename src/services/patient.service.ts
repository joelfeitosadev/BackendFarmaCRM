import { PatientRepository } from '../repositories/patient.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';

export class PatientService {
  private patientRepository = new PatientRepository();

  async create(data: Prisma.PatientCreateInput) {
    const existing = await this.patientRepository.findByPhone(data.phone);
    if (existing) {
      throw new ConflictError('Patient with this phone already exists');
    }
    return this.patientRepository.create(data);
  }

  async findById(id: string) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    if (!patient.lgpdConsent && patient.medicalHistory) {
      patient.medicalHistory = null;
    }

    if (patient.medicalHistory) {
      await prisma.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'READ_MEDICAL_HISTORY',
          dataAccessed: JSON.stringify({ patientId: id })
        }
      });
    }

    return patient;
  }

  async findAll() {
    return this.patientRepository.findAll();
  }

  async update(id: string, data: Prisma.PatientUpdateInput) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    return this.patientRepository.update(id, data);
  }

  async updateConsent(id: string, lgpdConsent: boolean) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    return this.patientRepository.update(id, { lgpdConsent });
  }

  async getChurn() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return prisma.patient.findMany({
      where: {
        lastPurchaseDate: { lt: thirtyDaysAgo }
      },
      orderBy: { lastPurchaseDate: 'asc' }
    });
  }

  async getLtv(id: string) {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    const orders = await prisma.order.findMany({
      where: { patientId: id, status: 'FINALIZADO' },
      include: { products: { include: { product: true } } }
    });
    const ltv = orders.reduce((total, order) => {
      return total + order.products.reduce((sum, op) => {
        return sum + Number(op.product.accumulatedProfit);
      }, 0);
    }, 0);
    return { patientId: id, ltv };
  }

  async getContinuousUse() {
    const today = new Date();
    const orderProducts = await prisma.orderProduct.findMany({
      where: { order: { status: 'FINALIZADO' } },
      include: {
        order: { include: { patient: true } },
        product: true
      }
    });

    return orderProducts
      .filter(op => {
        const lastPurchase = op.order.patient.lastPurchaseDate;
        if (!lastPurchase) return false;
        const consumptionPerDay = op.dosageAmount / op.dosageIntervalDays;
        const daysOfSupply = op.quantity / consumptionPerDay;
        const refillDate = new Date(lastPurchase);
        refillDate.setDate(refillDate.getDate() + Math.floor(daysOfSupply));
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        return refillDate <= sevenDaysFromNow;
      })
      .map(op => ({
        patient: op.order.patient,
        product: op.product,
        refillDue: (() => {
          const lastPurchase = op.order.patient.lastPurchaseDate!;
          const consumptionPerDay = op.dosageAmount / op.dosageIntervalDays;
          const daysOfSupply = op.quantity / consumptionPerDay;
          const refillDate = new Date(lastPurchase);
          refillDate.setDate(refillDate.getDate() + Math.floor(daysOfSupply));
          return refillDate;
        })()
      }));
  }
}
