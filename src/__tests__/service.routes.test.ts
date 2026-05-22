import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';

const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
const mockPatientId = '123e4567-e89b-12d3-a456-426614174001';
const mockProductId = '123e4567-e89b-12d3-a456-426614174002';

const mockService = {
  id: mockUUID,
  patientId: mockPatientId,
  status: 'ORCAMENTO',
  prescriptionValidated: false,
  prescriptionData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  products: [
    {
      id: 'sp-1',
      serviceId: mockUUID,
      productId: mockProductId,
      quantity: 2,
      dosageAmount: 1,
      dosageIntervalDays: 1
    }
  ]
};

describe('Service (Atendimento) Routes', () => {

  describe('POST /services', () => {
    it('should return 201 Created (status ORCAMENTO) on success', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockPatientId } as any);
      prismaMock.service.create.mockResolvedValue(mockService as any);

      const res = await request(app)
        .post('/services')
        .send({
          patientId: mockPatientId,
          products: [{ productId: mockProductId, quantity: 2 }]
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('ORCAMENTO');
    });

    it('should return 400 Bad Request if products array is missing or empty', async () => {
      prismaMock.patient.findUnique.mockResolvedValue({ id: mockPatientId } as any);
      
      const res = await request(app)
        .post('/services')
        .send({
          patientId: mockPatientId,
          products: [] // invalid by zod and logic
        });

      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if patientId does not exist', async () => {
      prismaMock.patient.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/services')
        .send({
          patientId: mockPatientId,
          products: [{ productId: mockProductId, quantity: 2 }]
        });

      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.patient.findUnique.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/services')
        .send({
          patientId: mockPatientId,
          products: [{ productId: mockProductId, quantity: 2 }]
        });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /services/:id', () => {
    it('should return 200 OK with service and related products', async () => {
      prismaMock.service.findUnique.mockResolvedValue(mockService as any);

      const res = await request(app).get(`/services/${mockUUID}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('products');
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      const res = await request(app).get('/services/invalid-id');
      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      prismaMock.service.findUnique.mockResolvedValue(null);
      const res = await request(app).get(`/services/${mockUUID}`);
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.service.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get(`/services/${mockUUID}`);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /services/:id/move', () => {
    it('should return 200 OK on valid status transition', async () => {
      prismaMock.service.findUnique.mockResolvedValue(mockService as any);
      prismaMock.service.update.mockResolvedValue({ ...mockService, status: 'AGUARDANDO_RECEITA' } as any);

      const res = await request(app)
        .put(`/services/${mockUUID}/move`)
        .send({ status: 'AGUARDANDO_RECEITA' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('AGUARDANDO_RECEITA');
    });

    it('should return 409 Conflict on invalid status transition', async () => {
      prismaMock.service.findUnique.mockResolvedValue(mockService as any); // currently ORCAMENTO
      
      const res = await request(app)
        .put(`/services/${mockUUID}/move`)
        .send({ status: 'FINALIZADO' }); // Cannot go ORCAMENTO -> FINALIZADO directly

      expect(res.status).toBe(409); // ConflictError
    });

    it('should return 403 Forbidden if trying to FINALIZE without validated prescription for controlled drugs', async () => {
      const almostFinished = { ...mockService, status: 'PRONTO_ENTREGA', prescriptionValidated: false };
      prismaMock.service.findUnique.mockResolvedValue(almostFinished as any);

      const res = await request(app)
        .put(`/services/${mockUUID}/move`)
        .send({ status: 'FINALIZADO' });

      expect(res.status).toBe(403);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      prismaMock.service.findUnique.mockResolvedValue(null);
      
      const res = await request(app)
        .put(`/services/${mockUUID}/move`)
        .send({ status: 'AGUARDANDO_RECEITA' });

      expect(res.status).toBe(404);
    });

    it('should return 409 Conflict if stock is insufficient when moving to PRONTO_ENTREGA', async () => {
      const waitingRx = { ...mockService, status: 'AGUARDANDO_RECEITA' };
      prismaMock.service.findUnique.mockResolvedValue(waitingRx as any);
      
      // Moking $transaction to throw ConflictError because of insufficient stock
      prismaMock.$transaction.mockImplementation(async (cb) => {
        const { ConflictError } = require('../utils/errors');
        throw new ConflictError('Insufficient stock');
      });

      const res = await request(app)
        .put(`/services/${mockUUID}/move`)
        .send({ status: 'PRONTO_ENTREGA' });

      expect(res.status).toBe(409);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.service.findUnique.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .put(`/services/${mockUUID}/move`)
        .send({ status: 'AGUARDANDO_RECEITA' });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /services/:id/prescription', () => {
    it('should return 200 OK, save encrypted prescription and set prescriptionValidated=true', async () => {
      prismaMock.service.findUnique.mockResolvedValue(mockService as any);
      prismaMock.service.update.mockResolvedValue({
        ...mockService,
        prescriptionValidated: true
      } as any);

      const res = await request(app)
        .post(`/services/${mockUUID}/prescription`)
        .send({ prescriptionData: 'Receita Dr. Joao 123' });

      expect(res.status).toBe(200);
      expect(res.body.prescriptionValidated).toBe(true);
    });

    it('should return 400 Bad Request if prescriptionData is missing', async () => {
      const res = await request(app)
        .post(`/services/${mockUUID}/prescription`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      prismaMock.service.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post(`/services/${mockUUID}/prescription`)
        .send({ prescriptionData: 'data' });

      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.service.findUnique.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post(`/services/${mockUUID}/prescription`)
        .send({ prescriptionData: 'data' });

      expect(res.status).toBe(500);
    });
  });
});
