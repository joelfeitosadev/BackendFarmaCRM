import { Request, Response } from 'express';
import { PatientService } from '../services/patient.service';
import { z } from 'zod';

const createPatientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  lgpdConsent: z.boolean().optional(),
  medicalHistory: z.string().optional().nullable()
});

const updatePatientSchema = z.object({
  phone: z.string().min(10).optional(),
  lgpdConsent: z.boolean().optional()
});

const idSchema = z.string().uuid();

export class PatientController {
  private patientService = new PatientService();

  create = async (req: Request, res: Response) => {
    const data = createPatientSchema.parse(req.body);
    const patient = await this.patientService.create(data);
    res.status(201).json(patient);
  };

  getById = async (req: Request, res: Response) => {
    const id = idSchema.parse(req.params.id);
    const patient = await this.patientService.findById(id);
    res.status(200).json(patient);
  };

  getAll = async (req: Request, res: Response) => {
    const patients = await this.patientService.findAll();
    res.status(200).json(patients);
  };

  update = async (req: Request, res: Response) => {
    const id = idSchema.parse(req.params.id);
    const data = updatePatientSchema.parse(req.body);
    const patient = await this.patientService.update(id, data);
    res.status(200).json(patient);
  };
}
