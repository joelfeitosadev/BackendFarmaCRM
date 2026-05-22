import { IProduct } from './product.interface';

export interface IPatient {
  id: string;
  name: string;
  phone: string;
  lastPurchaseDate: Date | null;
  lgpdConsent: boolean;
  medicalHistory: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePatient {
  name: string;
  phone: string;
  lgpdConsent?: boolean;
  medicalHistory?: string | null;
}

export interface IUpdatePatient {
  phone?: string;
  lgpdConsent?: boolean;
}

export interface IPatientLtv {
  patientId: string;
  ltv: number;
}

export interface IContinuousUseEntry {
  patient: IPatient;
  product: IProduct;
  refillDue: Date;
}
