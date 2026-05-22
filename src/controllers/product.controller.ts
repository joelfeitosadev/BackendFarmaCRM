import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';
import { z } from 'zod';

const productService = new ProductService();

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
