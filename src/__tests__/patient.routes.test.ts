import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';

const mockUUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Patient Routes', () => {

  // ─── POST /patients ───────────────────────────────────────────────────────
  describe('POST /patients', () => {
    it('should return 201 Created on success', async () => {
      const mockPatient = {
        id: mockUUID, name: 'John Doe', phone: '11999999999',
        lgpdConsent: true, lastPurchaseDate: null, medicalHistory: null,
        createdAt: new Date(), updatedAt: new Date()
      };
      prismaMock.patient.findFirst.mockResolvedValue(null);
      prismaMock.patient.create.mockResolvedValue(mockPatient);

      const res = await request(app).post('/patients').send({ name: 'John Doe', phone: '11999999999' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('should return 400 Bad Request if validation fails', async () => {
      const res = await request(app).post('/patients').send({ name: 'John' }); // missing phone
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation Error');
    });

    it('should return 409 Conflict if patient phone already exists', async () => {
      prismaMock.patient.findFirst.mockResolvedValue({ id: mockUUID } as any);
      const res = await request(app).post('/patients').send({ name: 'Jane', phone: '11999999999' });
      expect(res.status).toBe(409);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.patient.findFirst.mockResolvedValue(null);
      prismaMock.patient.create.mockRejectedValue(new Error('DB down'));
      const res = await request(app).post('/patients').send({ name: 'John Doe', phone: '11999999999' });
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /patients ────────────────────────────────────────────────────────
  describe('GET /patients', () => {
    it('should return 200 OK with list of patients', async () => {
      prismaMock.patient.findMany.mockResolvedValue([]);
      const res = await request(app).get('/patients');
      expect(res.status).toBe(200);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.patient.findMany.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/patients');
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /patients/:id ────────────────────────────────────────────────────
  describe('GET /patients/:id', () => {
    it('should return 200 OK and data', async () => {
      const mockPatient = {
        id: mockUUID, name: 'John Doe', phone: '11999999999',
        lgpdConsent: true, lastPurchaseDate: null, medicalHistory: 'allergy',
        createdAt: new Date(), updatedAt: new Date()
      };
      prismaMock.patient.findUnique.mockResolvedValue(mockPatient);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app).get(`/patients/${mockUUID}`);
      expect(res.status).toBe(200);
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      const res = await request(app).get('/patients/not-a-uuid');
      expect(res.status).toBe(400);
    });

    it('should return 200 and hide medicalHistory if lgpdConsent is false', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({
        id: mockUUID, name: 'John', phone: '11999999999', lgpdConsent: false,
        lastPurchaseDate: null, medicalHistory: 'allergy', createdAt: new Date(), updatedAt: new Date()
      });
      const res = await request(app).get(`/patients/${mockUUID}`);
      expect(res.status).toBe(200);
      expect(res.body.medicalHistory).toBeNull();
    });

    it('should return 404 Not Found if patient does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);
      const res = await request(app).get(`/patients/${mockUUID}`);
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.patient.findUnique.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get(`/patients/${mockUUID}`);
      expect(res.status).toBe(500);
    });
  });

  // ─── PATCH /patients/:id ──────────────────────────────────────────────────
  describe('PATCH /patients/:id', () => {
    it('should return 200 OK on success', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockUUID } as any);
      prismaMock.patient.update.mockResolvedValue({} as any);
      const res = await request(app).patch(`/patients/${mockUUID}`).send({ phone: '11999999999' });
      expect(res.status).toBe(200);
    });

    it('should return 400 Bad Request on invalid payload', async () => {
      const res = await request(app).patch(`/patients/${mockUUID}`).send({ phone: 123 });
      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if patient does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);
      const res = await request(app).patch(`/patients/${mockUUID}`).send({ phone: '11999999999' });
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockUUID } as any);
      prismaMock.patient.update.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).patch(`/patients/${mockUUID}`).send({ phone: '11999999999' });
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /patients/churn ──────────────────────────────────────────────────
  describe('GET /patients/churn', () => {
    it('should return 200 OK with patients inactive for more than 30 days', async () => {
      prismaMock.patient.findMany.mockResolvedValue([]);
      const res = await request(app).get('/patients/churn');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.patient.findMany.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/patients/churn');
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /patients/:id/ltv ────────────────────────────────────────────────
  describe('GET /patients/:id/ltv', () => {
    it('should return 200 OK with LTV calculation', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockUUID } as any);
      prismaMock.service.findMany.mockResolvedValue([]);
      const res = await request(app).get(`/patients/${mockUUID}/ltv`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ltv');
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      const res = await request(app).get('/patients/not-a-uuid/ltv');
      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if patient does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);
      const res = await request(app).get(`/patients/${mockUUID}/ltv`);
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.patient.findUnique.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get(`/patients/${mockUUID}/ltv`);
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /patients/continuous-use ─────────────────────────────────────────
  describe('GET /patients/continuous-use', () => {
    it('should return 200 OK with patients needing refill', async () => {
      prismaMock.serviceProduct.findMany.mockResolvedValue([]);
      const res = await request(app).get('/patients/continuous-use');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.serviceProduct.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/patients/continuous-use');
      expect(res.status).toBe(500);
    });
  });

  // ─── PUT /patients/:id/consent ────────────────────────────────────────────
  describe('PUT /patients/:id/consent', () => {
    it('should return 200 OK updating LGPD consent', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockUUID } as any);
      prismaMock.patient.update.mockResolvedValue({} as any);
      const res = await request(app).put(`/patients/${mockUUID}/consent`).send({ lgpdConsent: true });
      expect(res.status).toBe(200);
    });

    it('should return 400 Bad Request if consent field is missing', async () => {
      const res = await request(app).put(`/patients/${mockUUID}/consent`).send({});
      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if patient does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);
      const res = await request(app).put(`/patients/${mockUUID}/consent`).send({ lgpdConsent: false });
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockUUID } as any);
      prismaMock.patient.update.mockRejectedValue(new Error('DB error'));
      const res = await request(app).put(`/patients/${mockUUID}/consent`).send({ lgpdConsent: true });
      expect(res.status).toBe(500);
    });
  });
});
