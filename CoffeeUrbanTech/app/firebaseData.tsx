// Modelos de Datos
import { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // precio_venta
  unitCost: number; // costo -> unitCost
  stock: number;
  category: string;
  productType: string;
  suggestedPrice?: number | null;
  inMenu?: boolean;
  createdAt?: Timestamp | null; // fecha_creacion
  updatedAt?: Timestamp | null; // ultima_actualizacion
};

export type PurchasedItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number; // costo_unitario
};

export type Purchase = {
  id: string;
  purchaseDate: Timestamp; // fecha_compra/date
  supplierName: string;
  items: PurchasedItem[];
  total: number;
};

export type SoldItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  date: Timestamp;
  items: SoldItem[];
  total: number;
  invoiceCode?: string; // Nuevo campo para código de factura
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "cajero";
  isActive: boolean;
  password: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}