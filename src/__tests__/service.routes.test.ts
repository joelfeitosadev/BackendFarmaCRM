import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';
import { v4 as uuidv4 } from 'uuid';

describe('Service Routes', () => {
  const mockUUID = uuidv4();

  describe('POST /services', () => {
    it('should return 201 Created on success', async () => {
      // expect(response.status).toBe(201);
    });

    it('should return 400 Bad Request on missing products', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if patientId does not exist', async () => {
      // expect(response.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });

  describe('GET /services/:id', () => {
    it('should return 200 OK and data', async () => {
      // expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      // expect(response.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });

  describe('PATCH /services/:id/status', () => {
    it('should return 200 OK on success', async () => {
      // expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request on invalid status transition', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      // expect(response.status).toBe(404);
    });

    it('should return 409 Conflict if stock is insufficient', async () => {
      // expect(response.status).toBe(409);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });

  describe('POST /services/:id/prescription', () => {
    it('should return 200 OK and set prescriptionValidated to true', async () => {
      // expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request on missing prescription data', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if service does not exist', async () => {
      // expect(response.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });
});
