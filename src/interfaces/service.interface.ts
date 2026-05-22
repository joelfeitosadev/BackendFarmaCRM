export type ServiceStatus = 'ORCAMENTO' | 'AGUARDANDO_RECEITA' | 'PRONTO_ENTREGA' | 'FINALIZADO';

export interface IService {
  id: string;
  patientId: string;
  status: ServiceStatus;
  prescriptionValidated: boolean;
  prescriptionData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceProduct {
  id: string;
  serviceId: string;
  productId: string;
  quantity: number;
  dosageAmount: number;
  dosageIntervalDays: number;
}

export interface ICreateService {
  patientId: string;
  products: Array<{
    productId: string;
    quantity: number;
    dosageAmount?: number;
    dosageIntervalDays?: number;
  }>;
}

export interface IMoveService {
  status: ServiceStatus;
}
