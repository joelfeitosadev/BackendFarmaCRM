import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { z } from 'zod';

const productService = new ProductService();

// Validation Schemas
const createProductSchema = z.object({
  activeIngredient: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  expirationDate: z.string().datetime(),
  costPrice: z.number().min(0),
  salePrice: z.number().min(0),
  minimumStock: z.number().int().min(0).optional(),
});

const updateProductSchema = z.object({
  stockQuantity: z.number().int().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  minimumStock: z.number().int().min(0).optional(),
});

export class ProductController {
  async create(req: Request, res: Response) {
    const data = createProductSchema.parse(req.body);
    const product = await productService.createProduct({
      ...data,
      expirationDate: new Date(data.expirationDate)
    });
    res.status(201).json(product);
  }

  async getAll(req: Request, res: Response) {
    const { abcClass } = req.query;
    const products = await productService.getProducts(abcClass as string);
    res.status(200).json(products);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const product = await productService.getProductById(id as string);
    res.status(200).json(product);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    z.string().uuid().parse(id);
    const data = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(id as string, data);
    res.status(200).json(product);
  }

  async processAbc(req: Request, res: Response) {
    const result = await productService.processAbcCurve();
    res.status(200).json(result);
  }

  async getExpirationAlerts(req: Request, res: Response) {
    const products = await productService.getExpirationAlerts();
    res.status(200).json(products);
  }

  async getRestock(req: Request, res: Response) {
    const products = await productService.getRestockList();
    res.status(200).json(products);
  }
}
