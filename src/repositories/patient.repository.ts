import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';

export class PatientRepository {
  async create(data: Prisma.PatientCreateInput) {
    return prisma.patient.create({ data });
  }

  async findById(id: string) {
    return prisma.patient.findUnique({ where: { id } });
  }

  async findByPhone(phone: string) {
    return prisma.patient.findFirst({ where: { phone } });
  }

  async findAll() {
    return prisma.patient.findMany();
  }

  async update(id: string, data: Prisma.PatientUpdateInput) {
    return prisma.patient.update({ where: { id }, data });
  }
}
