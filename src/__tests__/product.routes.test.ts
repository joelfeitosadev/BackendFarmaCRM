import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';
import { Prisma } from '@prisma/client';

const mockUUID = '123e4567-e89b-12d3-a456-426614174000';

const mockProduct = {
  id: mockUUID,
  activeIngredient: 'Paracetamol',
  stockQuantity: 100,
  expirationDate: new Date(),
  costPrice: new Prisma.Decimal(5.00),
  salePrice: new Prisma.Decimal(10.00),
  accumulatedProfit: new Prisma.Decimal(50.00),
  abcClass: 'C',
  minimumStock: 20,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('Product (Stock) Routes', () => {

  // ─── POST /products ───────────────────────────────────────────────────────
  describe('POST /products', () => {
    it('should return 201 Created on success', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post('/products')
        .send({
          activeIngredient: 'Paracetamol',
          stockQuantity: 100,
          expirationDate: new Date().toISOString(),
          costPrice: 5.00,
          salePrice: 10.00,
          minimumStock: 20
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(mockUUID);
    });

    it('should return 400 Bad Request if validation fails (e.g. negative stock)', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          activeIngredient: 'Paracetamol',
          stockQuantity: -10, // Invalid
          expirationDate: new Date().toISOString(),
          costPrice: 5.00,
          salePrice: 10.00
        });

      expect(res.status).toBe(400);
    });

    it('should return 409 Conflict if product with same active ingredient already exists', async () => {
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      const res = await request(app)
        .post('/products')
        .send({
          activeIngredient: 'Paracetamol',
          stockQuantity: 100,
          expirationDate: new Date().toISOString(),
          costPrice: 5.00,
          salePrice: 10.00
        });

      expect(res.status).toBe(409);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.product.findUnique.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .post('/products')
        .send({
          activeIngredient: 'Paracetamol',
          stockQuantity: 100,
          expirationDate: new Date().toISOString(),
          costPrice: 5.00,
          salePrice: 10.00
        });

      expect(res.status).toBe(500);
    });
  });

  // ─── GET /products ────────────────────────────────────────────────────────
  describe('GET /products', () => {
    it('should return 200 OK with list of products', async () => {
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      const res = await request(app).get('/products');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should return 200 OK filtering by abcClass', async () => {
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      const res = await request(app).get('/products?abcClass=C');
      
      expect(res.status).toBe(200);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { abcClass: 'C' }
      }));
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.product.findMany.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/products');
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /products/:id ────────────────────────────────────────────────────
  describe('GET /products/:id', () => {
    it('should return 200 OK and product data', async () => {
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      const res = await request(app).get(`/products/${mockUUID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(mockUUID);
    });

    it('should return 400 Bad Request for invalid ID format', async () => {
      const res = await request(app).get('/products/invalid-id');
      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);
      const res = await request(app).get(`/products/${mockUUID}`);
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.product.findUnique.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get(`/products/${mockUUID}`);
      expect(res.status).toBe(500);
    });
  });

  // ─── PATCH /products/:id ──────────────────────────────────────────────────
  describe('PATCH /products/:id', () => {
    it('should return 200 OK on success (e.g. stock update)', async () => {
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.update.mockResolvedValue({ ...mockProduct, stockQuantity: 150 });

      const res = await request(app).patch(`/products/${mockUUID}`).send({ stockQuantity: 150 });
      expect(res.status).toBe(200);
      expect(res.body.stockQuantity).toBe(150);
    });

    it('should return 400 Bad Request on invalid payload', async () => {
      const res = await request(app).patch(`/products/${mockUUID}`).send({ stockQuantity: -5 });
      expect(res.status).toBe(400);
    });

    it('should return 404 Not Found if product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);
      const res = await request(app).patch(`/products/${mockUUID}`).send({ stockQuantity: 150 });
      expect(res.status).toBe(404);
    });

    it('should return 500 Internal Server Error on DB failure', async () => {
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.update.mockRejectedValue(new Error('DB error'));
      const res = await request(app).patch(`/products/${mockUUID}`).send({ stockQuantity: 150 });
      expect(res.status).toBe(500);
    });
  });

  // ─── POST /products/process-abc ───────────────────────────────────────────
  describe('POST /products/process-abc', () => {
    it('should return 200 OK and update abcClass for all products', async () => {
      prismaMock.product.findMany.mockResolvedValue([
        { ...mockProduct, id: '1', accumulatedProfit: new Prisma.Decimal(80) },
        { ...mockProduct, id: '2', accumulatedProfit: new Prisma.Decimal(15) },
        { ...mockProduct, id: '3', accumulatedProfit: new Prisma.Decimal(5) }
      ]);
      
      // prismaMock.$transaction needs to be mocked nicely
      // In jest-mock-extended, it's a bit tricky to mock $transaction implementation 
      // but if we don't mock it it fails. We can mock it to just execute the callback.
      prismaMock.$transaction.mockImplementation(async (cb: any) => {
        return cb(prismaMock);
      });

      const res = await request(app).post('/products/process-abc');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('ABC curve processed successfully');
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.product.findMany.mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/products/process-abc');
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /products/expiration-alerts ──────────────────────────────────────
  describe('GET /products/expiration-alerts', () => {
    it('should return 200 OK with products expiring within 60 days', async () => {
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      const res = await request(app).get('/products/expiration-alerts');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.product.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/products/expiration-alerts');
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /products/restock ────────────────────────────────────────────────
  describe('GET /products/restock', () => {
    it('should return 200 OK with list of products below minimum stock', async () => {
      prismaMock.$queryRaw.mockResolvedValue([mockProduct]);
      const res = await request(app).get('/products/restock');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should return 500 Internal Server Error on failure', async () => {
      prismaMock.$queryRaw.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/products/restock');
      expect(res.status).toBe(500);
    });
  });
});
