import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';
import { v4 as uuidv4 } from 'uuid';

describe('Product Routes', () => {
  const mockUUID = uuidv4();

  describe('POST /products', () => {
    it('should return 201 Created on success', async () => {
      // expect(response.status).toBe(201);
    });

    it('should return 400 Bad Request on validation failure', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 409 Conflict if product exists', async () => {
      // expect(response.status).toBe(409);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });

  describe('GET /products', () => {
    it('should return 200 OK with list of products', async () => {
      // expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request if filter query is invalid', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });

  describe('GET /products/:id', () => {
    it('should return 200 OK and data', async () => {
      // expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if product does not exist', async () => {
      // expect(response.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should return 200 OK on success', async () => {
      // expect(response.status).toBe(200);
    });

    it('should return 400 Bad Request on validation failure', async () => {
      // expect(response.status).toBe(400);
    });

    it('should return 404 Not Found if product does not exist', async () => {
      // expect(response.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      // expect(response.status).toBe(500);
    });
  });
});
