import { PatientRepository } from '../repositories/patient.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import prisma from '../client';
import { Prisma } from '../../generated/prisma';

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
}
