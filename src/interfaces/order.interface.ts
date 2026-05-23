export type OrderStatus = 'ORCAMENTO' | 'AGUARDANDO_RECEITA' | 'PRONTO_ENTREGA' | 'FINALIZADO';

export interface IOrder {
  id: string;
  patientId: string;
  status: OrderStatus;
  prescriptionValidated: boolean;
  prescriptionData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderProduct {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  dosageAmount: number;
  dosageIntervalDays: number;
}

export interface ICreateOrder {
  patientId: string;
  products: Array<{
    productId: string;
    quantity: number;
    dosageAmount?: number;
    dosageIntervalDays?: number;
  }>;
}

export interface IMoveOrder {
  status: OrderStatus;
}
