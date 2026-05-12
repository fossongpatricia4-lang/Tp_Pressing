import { useState, useEffect, useCallback } from 'react';
import { Order, WashStatus, PayStatus } from '../types';
import { getAllOrders, saveOrder, deleteOrder } from '../db/indexedDB';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((data) => {
      setOrders(data.sort((a, b) => b.deposited.localeCompare(a.deposited)));
      setLoading(false);
    });
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    await saveOrder(order);
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrder = useCallback(async (updated: Order) => {
    await saveOrder(updated);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const removeOrder = useCallback(async (id: string) => {
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return { orders, loading, addOrder, updateOrder, removeOrder };
}

// ── Pure status helpers ──────────────────────────────
export function washStatus(order: Order): WashStatus {
  const total = order.items.reduce((s, i) => s + i.qty, 0);
  const done = order.items.reduce((s, i) => s + (i.donePcs || 0), 0);
  if (done <= 0) return 'pending';
  if (done >= total) return 'complete';
  return 'incomplete'; // some unwashed → INCOMPLETE
}

export function orderTotal(order: Order): number {
  return order.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
}

export function orderPaid(order: Order): number {
  return (order.payments || []).reduce((s, p) => s + p.amount, 0);
}

export function orderDue(order: Order): number {
  return Math.max(0, orderTotal(order) - orderPaid(order));
}

export function payStatus(order: Order): PayStatus {
  const paid = orderPaid(order);
  const due = orderDue(order);
  if (paid <= 0) return 'unpaid';
  if (due <= 0) return 'paid';
  return 'partial-pay';
}

export function fmtMoney(n: number): string {
  return n.toLocaleString('fr-FR') + ' F';
}

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('fr-FR');
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function defaultPickup(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
