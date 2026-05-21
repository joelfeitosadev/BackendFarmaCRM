import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';

const mockUUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Service (Atendimento) Routes', () => {

  // ─── POST /services ───────────────────────────────────────────────────────
  describe('POST /services', () => {
    it('should return 201 Created (status ORCAMENTO) on success', async () => {
      // expect(res.status).toBe(201);
      // expect(res.body.status).toBe('ORCAMENTO');
    });

    it('should return 400 Bad Request if products array is missing or empty', async () => {
      // expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if patientId does not exist', async () => {
      // expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(res.status).toBe(500);
    });
  });

  // ─── GET /services/:id ────────────────────────────────────────────────────
  describe('GET /services/:id', () => {
    it('should return 200 OK with service and related products', async () => {
      // expect(res.status).toBe(200);
      // expect(res.body).toHaveProperty('products');
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      // expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      // expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(res.status).toBe(500);
    });
  });

  // ─── PUT /services/:id/move ───────────────────────────────────────────────
  describe('PUT /services/:id/move', () => {
    it('should return 200 OK on valid status transition', async () => {
      // ex: ORCAMENTO -> AGUARDANDO_RECEITA
      // expect(res.status).toBe(200);
    });

    it('should return 400 Bad Request on invalid status transition', async () => {
      // ex: ORCAMENTO -> FINALIZADO (sem passar pelos estados intermediários)
      // expect(res.status).toBe(400);
    });

    it('should return 403 Forbidden if trying to FINALIZE without validated prescription for controlled drugs', async () => {
      // Regra crítica: prescriptionValidated deve ser true para finalizar controlados
      // expect(res.status).toBe(403);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      // expect(res.status).toBe(404);
    });

    it('should return 409 Conflict if stock is insufficient when moving to PRONTO_ENTREGA', async () => {
      // Verifica estoque antes de aprovar a saída dos produtos
      // expect(res.status).toBe(409);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(res.status).toBe(500);
    });
  });

  // ─── POST /services/:id/prescription ─────────────────────────────────────
  describe('POST /services/:id/prescription', () => {
    it('should return 200 OK, save encrypted prescription and set prescriptionValidated=true', async () => {
      // expect(res.status).toBe(200);
      // expect(res.body.prescriptionValidated).toBe(true);
    });

    it('should return 400 Bad Request if prescriptionData is missing', async () => {
      // expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      // expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(res.status).toBe(500);
    });
  });
});
