import { Prisma } from '@prisma/client';

export interface IProduct {
  id: string;
  activeIngredient: string;
  stockQuantity: number;
  expirationDate: Date;
  costPrice: Prisma.Decimal;
  salePrice: Prisma.Decimal;
  accumulatedProfit: Prisma.Decimal;
  abcClass: string;
  minimumStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProduct {
  activeIngredient: string;
  stockQuantity: number;
  expirationDate: Date;
  costPrice: number;
  salePrice: number;
  minimumStock?: number;
}

export interface IUpdateProduct {
  stockQuantity?: number;
  salePrice?: number;
  costPrice?: number;
  minimumStock?: number;
}

export type AbcClass = 'A' | 'B' | 'C';
