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
    const services = await prisma.service.findMany({
      where: { patientId: id, status: 'FINALIZADO' },
      include: { products: { include: { product: true } } }
    });
    const ltv = services.reduce((total, service) => {
      return total + service.products.reduce((sum, sp) => {
        return sum + Number(sp.product.accumulatedProfit);
      }, 0);
    }, 0);
    return { patientId: id, ltv };
  }

  async getContinuousUse() {
    const today = new Date();
    const serviceProducts = await prisma.serviceProduct.findMany({
      where: { service: { status: 'FINALIZADO' } },
      include: {
        service: { include: { patient: true } },
        product: true
      }
    });

    return serviceProducts
      .filter(sp => {
        const lastPurchase = sp.service.patient.lastPurchaseDate;
        if (!lastPurchase) return false;
        const consumptionPerDay = sp.dosageAmount / sp.dosageIntervalDays;
        const daysOfSupply = sp.quantity / consumptionPerDay;
        const refillDate = new Date(lastPurchase);
        refillDate.setDate(refillDate.getDate() + Math.floor(daysOfSupply));
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);
        return refillDate <= sevenDaysFromNow;
      })
      .map(sp => ({
        patient: sp.service.patient,
        product: sp.product,
        refillDue: (() => {
          const lastPurchase = sp.service.patient.lastPurchaseDate!;
          const consumptionPerDay = sp.dosageAmount / sp.dosageIntervalDays;
          const daysOfSupply = sp.quantity / consumptionPerDay;
          const refillDate = new Date(lastPurchase);
          refillDate.setDate(refillDate.getDate() + Math.floor(daysOfSupply));
          return refillDate;
        })()
      }));
  }
}
