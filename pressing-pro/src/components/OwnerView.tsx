import React, { useState } from 'react';
import { Order, OwnerTab } from '../types';
import {
  washStatus, payStatus, orderTotal, orderPaid, orderDue,
  fmtMoney, fmtDate, today,
} from '../hooks/useOrders';

interface Props {
  orders: Order[];
  onToggleItem: (orderId: string, itemIdx: number) => void;
  onMarkAllDone: (orderId: string) => void;
  onRemove: (orderId: string) => void;
  onPay: (orderId: string) => void;
  onReceipt: (orderId: string) => void;
  onNewOrder: () => void;
  onLock: () => void;
  onOpenPricing: () => void;
}

export default function OwnerView({
  orders, onToggleItem, onMarkAllDone, onRemove, onPay, onReceipt, onNewOrder, onLock, onOpenPricing,
}: Props) {
  const [tab, setTab] = useState<OwnerTab>('all');
  const [search, setSearch] = useState('');

  // ── Stats ─────────────────────────────────────────
  const todayStr = today();
  const totalBill = orders.reduce((s, o) => s + orderTotal(o), 0);
  const totalPaid = orders.reduce((s, o) => s + orderPaid(o), 0);
  const totalDue  = orders.reduce((s, o) => s + orderDue(o), 0);
  const todayRevenue = orders.reduce((s, o) =>
    s + (o.payments || []).filter((p) => p.date === todayStr).reduce((a, p) => a + p.amount, 0), 0);
  const todayPayCount = orders.filter((o) => (o.payments || []).some((p) => p.date === todayStr)).length;
  const pct = totalBill > 0 ? Math.round((totalPaid / totalBill) * 100) : 0;
  const completeCount = orders.filter((o) => washStatus(o) === 'complete').length;
  const incompleteCount = orders.filter((o) => washStatus(o) !== 'complete').length;
  const paidCount = orders.filter((o) => payStatus(o) === 'paid').length;
  const pieces = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);

  // ── Filter ────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const list = orders.filter((o) => {
    const ws = washStatus(o);
    const ps = payStatus(o);
    const matchSearch = o.client.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (tab === 'incomplete') return ws !== 'complete';
    if (tab === 'complete') return ws === 'complete';
    if (tab === 'unpaid') return ps !== 'paid';
    return true;
  });

  const tabs: { key: OwnerTab; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'incomplete', label: 'Incomplètes' },
    { key: 'complete', label: 'Complètes' },
    { key: 'unpaid', label: 'Non payés' },
  ];

  return (
    <div className="app">
      <header>
        <div className="logo">
          <h1>Pressing Pro</h1>
          <span>Tableau de bord gérant</span>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={onOpenPricing}>⚙ Tarifs</button>
          <button className="action-btn danger-text" onClick={onLock}>🔒 Verrouiller</button>
        </div>
      </header>

      {/* Today's revenue card — OWNER ONLY */}
      <div className="today-card">
        <div>
          <div className="today-label">💰 Encaissé aujourd'hui</div>
          <div className="today-amount">{fmtMoney(todayRevenue)}</div>
          <div className="today-sub">{todayPayCount} paiement{todayPayCount !== 1 ? 's' : ''} aujourd'hui</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="today-label">Total impayé</div>
          <div className="today-due">{fmtMoney(totalDue)}</div>
        </div>
      </div>

      <div className="stats">
        {[
          { num: orders.length, label: 'Commandes' },
          { num: pieces, label: 'Pièces' },
          { num: completeCount, label: 'Complètes', color: 'var(--done)' },
          { num: incompleteCount, label: 'Incomplètes', color: 'var(--danger)' },
          { num: paidCount, label: 'Soldées', color: 'var(--accent)' },
        ].map(({ num, label, color }) => (
          <div key={label} className="stat">
            <div className="stat-num" style={{ color }}>{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar">
        <div className="progress-row">
          <span className="progress-title">Progression des paiements</span>
          <span className="progress-pct">{pct}%</span>
        </div>
        <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="search-row">
        <input className="search-input" value={search}
          onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par client..." />
        <button className="add-btn" onClick={onNewOrder}>+ Nouvelle commande</button>
      </div>

      <div className="tabs">
        {tabs.map(({ key, label }) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <div className="empty"><div className="empty-icon">👔</div>Aucune commande trouvée</div>
      )}

      {list.map((order) => {
        const ws = washStatus(order);
        const ps = payStatus(order);
        const total = orderTotal(order);
        const paid = orderPaid(order);
        const due = orderDue(order);
        const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);
        const donePcs = order.items.reduce((s, i) => s + (i.donePcs || 0), 0);

        const washBadge =
          ws === 'complete' ? <span className="badge complete">✅ Complet</span>
          : ws === 'incomplete' ? <span className="badge incomplete">⚠ Incomplet ({donePcs}/{totalPcs} lavés)</span>
          : <span className="badge pending">⏳ En attente</span>;

        const payBadge =
          ps === 'paid' ? <span className="pay-badge paid">✅ Soldé</span>
          : ps === 'partial-pay' ? <span className="pay-badge partial-pay">💛 Acompte</span>
          : <span className="pay-badge unpaid">❌ Non payé</span>;

        return (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-client">{order.client}</span>
              <span className="order-id">#{order.id}</span>
              {washBadge}{payBadge}
            </div>
            <div className="order-body">
              <table className="items-table">
                <thead>
                  <tr><th>Article</th><th>Couleur</th><th>Taille</th><th>Qté</th><th>Lavés</th><th>Prix</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => {
                    const isDone = (item.donePcs || 0) >= item.qty;
                    return (
                      <tr key={idx}>
                        <td className="name-cell">
                          <span className={`wash-dot ${isDone ? 'done' : 'pending'}`} />
                          {item.type}
                        </td>
                        <td>{item.color || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{item.size}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.qty}</td>
                        <td style={{ textAlign: 'center', fontSize: 12, color: isDone ? 'var(--accent)' : 'var(--warn)' }}>
                          {isDone ? `${item.qty} ✓` : `0/${item.qty}`}
                        </td>
                        <td className="price-cell">{fmtMoney(item.unitPrice * item.qty)}</td>
                        <td>
                          <button
                            className={`item-status-btn ${isDone ? 'unwash' : 'wash'}`}
                            onClick={() => onToggleItem(order.id, idx)}
                          >
                            {isDone ? '↩' : '✓ Lavé'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="order-total-row">
                <div>
                  <div className="total-label">Total commande</div>
                  {paid > 0 && <div className="paid-line">Payé: {fmtMoney(paid)}</div>}
                  {(order.payments || []).slice(-2).map((p, i) => (
                    <div key={i} className="pay-history-line">
                      {fmtDate(p.date)} · {p.method} · {fmtMoney(p.amount)}
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="total-amount">{fmtMoney(total)}</div>
                  {due > 0 && <div className="due-amount">Reste: {fmtMoney(due)}</div>}
                </div>
              </div>

              <div className="order-footer">
                <span className="order-meta">
                  📅 {fmtDate(order.deposited)} → {fmtDate(order.pickup)} · {totalPcs} pièce{totalPcs > 1 ? 's' : ''}
                </span>
                {ws !== 'complete' && (
                  <button className="mark-all-btn" onClick={() => onMarkAllDone(order.id)}>✓ Tout lavé</button>
                )}
                {due > 0 && (
                  <button className="pay-btn" onClick={() => onPay(order.id)}>💰 Encaisser</button>
                )}
                <button className="action-btn" onClick={() => onReceipt(order.id)}>🧾 Reçu</button>
                <button className="action-btn danger-text" onClick={() => onRemove(order.id)}>✕</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
