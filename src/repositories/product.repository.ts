import prisma from '../database/prisma';
import { Prisma } from '@prisma/client';
import { ICreateProduct, IUpdateProduct } from '../interfaces/product.interface';

export class ProductRepository {
  async create(data: ICreateProduct) {
    return prisma.product.create({
      data: {
        activeIngredient: data.activeIngredient,
        stockQuantity: data.stockQuantity,
        expirationDate: data.expirationDate,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        minimumStock: data.minimumStock || 0,
      }
    });
  }

  async findAll(abcClass?: string) {
    const where = abcClass ? { abcClass } : {};
    return prisma.product.findMany({ where, orderBy: { activeIngredient: 'asc' } });
  }

  async findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  async findByActiveIngredient(activeIngredient: string) {
    return prisma.product.findUnique({ where: { activeIngredient } });
  }

  async update(id: string, data: IUpdateProduct) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async findExpiringWithin(days: number) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + days);
    return prisma.product.findMany({
      where: {
        expirationDate: {
          lte: dateLimit
        }
      },
      orderBy: { expirationDate: 'asc' }
    });
  }

  async findBelowMinimumStock() {
    // We cannot use raw SQL for simple column comparison in Prisma easily without queryRaw,
    // but in newer Prisma we can use $queryRaw or just fetch all and filter in memory, 
    // or use a raw query. Let's use $queryRaw since we need `stockQuantity <= minimumStock`.
    // Wait, since we are doing TDD, a raw query is perfectly fine.
    return prisma.$queryRaw`SELECT * FROM "Product" WHERE "stockQuantity" <= "minimumStock"`;
  }
}
