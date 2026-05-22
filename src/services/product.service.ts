import { ProductRepository } from '../repositories/product.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import { ICreateProduct, IUpdateProduct } from '../interfaces/product.interface';
import prisma from '../database/prisma';

export class ProductService {
  private productRepository = new ProductRepository();

  async createProduct(data: ICreateProduct) {
    const existing = await this.productRepository.findByActiveIngredient(data.activeIngredient);
    if (existing) {
      throw new ConflictError('Product with this active ingredient already exists');
    }
    return this.productRepository.create(data);
  }

  async getProducts(abcClass?: string) {
    return this.productRepository.findAll(abcClass);
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    return product;
  }

  async updateProduct(id: string, data: IUpdateProduct) {
    await this.getProductById(id); // Ensures it exists
    return this.productRepository.update(id, data);
  }

  async getExpirationAlerts() {
    return this.productRepository.findExpiringWithin(60);
  }

  async getRestockList() {
    return this.productRepository.findBelowMinimumStock();
  }

  async processAbcCurve() {
    const products = await this.productRepository.findAll();
    const totalProfit = products.reduce((acc, p) => acc + Number(p.accumulatedProfit), 0);

    if (totalProfit === 0) {
      for (const p of products) {
        if (p.abcClass !== 'C') {
          await this.productRepository.update(p.id, { abcClass: 'C' } as any);
        }
      }
      return { message: 'ABC processed successfully. All C due to zero total profit.' };
    }

    const sorted = [...products].sort((a, b) => Number(b.accumulatedProfit) - Number(a.accumulatedProfit));

    let runningSum = 0;
    
    await prisma.$transaction(async (tx) => {
      for (const p of sorted) {
        runningSum += Number(p.accumulatedProfit);
        const percent = runningSum / totalProfit;

        let newClass = 'C';
        if (percent <= 0.80) newClass = 'A';
        else if (percent <= 0.95) newClass = 'B';

        if (p.abcClass !== newClass) {
          await tx.product.update({
            where: { id: p.id },
            data: { abcClass: newClass }
          });
        }
      }
    });

    return { message: 'ABC curve processed successfully' };
  }
}
