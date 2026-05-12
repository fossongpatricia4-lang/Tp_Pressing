export type Size = 'S' | 'M' | 'L' | 'XL';
export type PaymentMethod = 'Espèces' | 'Mobile Money' | 'Carte';
export type WashStatus = 'pending' | 'incomplete' | 'complete';
export type PayStatus = 'unpaid' | 'partial-pay' | 'paid';

export interface OrderItem {
  type: string;
  color: string;
  size: Size;
  qty: number;
  unitPrice: number;
  donePcs: number;
}

export interface Payment {
  date: string;
  method: PaymentMethod;
  amount: number;
}

export interface Order {
  id: string;
  client: string;
  deposited: string;
  pickup: string;
  notes: string;
  items: OrderItem[];
  payments: Payment[];
}

export type PricingTable = Record<string, Record<Size, number>>;
export type AppMode = 'client' | 'owner';
export type OwnerTab = 'all' | 'incomplete' | 'complete' | 'unpaid';
