import React from 'react';
import { Order } from '../types';
import {
  washStatus, orderTotal, orderPaid, orderDue, fmtMoney, fmtDate,
} from '../hooks/useOrders';

interface Props {
  orders: Order[];
  search: string;
  setSearch: (s: string) => void;
  onNewOrder: () => void;
  onReceipt: (id: string) => void;
}

export default function ClientView({ orders, search, setSearch, onNewOrder, onReceipt }: Props) {
  const q = search.trim().toLowerCase();
  const filtered = q ? orders.filter((o) => o.client.toLowerCase().includes(q)) : [];

  return (
    <div className="app">
      <header>
        <div className="logo">
          <h1>Pressing Pro</h1>
          <span>Blanchisserie</span>
        </div>
      </header>

      <div className="client-header">
        <div className="client-avatar">🧺</div>
        <div className="client-intro">
          <strong>Bienvenue !</strong>
          Entrez votre nom pour consulter votre commande ou créez-en une nouvelle.
        </div>
      </div>

      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Votre nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="add-btn" onClick={onNewOrder}>+ Ma commande</button>
      </div>

      {!q && (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          Entrez votre nom pour voir vos commandes
        </div>
      )}

      {q && filtered.length === 0 && (
        <div className="empty">
          <div className="empty-icon">😕</div>
          Aucune commande trouvée pour "<strong>{q}</strong>"
        </div>
      )}

      {filtered.map((order) => {
        const ws = washStatus(order);
        const total = orderTotal(order);
        const paid = orderPaid(order);
        const due = orderDue(order);
        const totalPcs = order.items.reduce((s, i) => s + i.qty, 0);
        const donePcs = order.items.reduce((s, i) => s + (i.donePcs || 0), 0);
        const unwashed = totalPcs - donePcs;

        const washBadge =
          ws === 'complete' ? <span className="badge complete">✅ Complet</span>
          : ws === 'incomplete' ? <span className="badge incomplete">⚠ Incomplet</span>
          : <span className="badge pending">⏳ En attente</span>;

        return (
          <div key={order.id} className="client-order-card">
            <div className="client-card-header">
              <span className="client-name">{order.client}</span>
              <span className="client-card-id">#{order.id}</span>
              {washBadge}
            </div>

            {/* INCOMPLETE WARNING — visible to client */}
            {ws === 'incomplete' && (
              <div className="incomplete-warning">
                ⚠ Attention : {unwashed} article{unwashed > 1 ? 's' : ''} pas encore lavé{unwashed > 1 ? 's' : ''}.
                Votre commande est <strong>incomplète</strong>.
              </div>
            )}
            {ws === 'pending' && (
              <div className="pending-notice">
                ⏳ Vos articles sont en attente de lavage.
              </div>
            )}

            <table className="client-items">
              <thead>
                <tr><th>Article</th><th>Taille</th><th>Qté</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => {
                  const isDone = (item.donePcs || 0) >= item.qty;
                  return (
                    <tr key={i}>
                      <td className="name-cell">
                        <span className={`wash-dot ${isDone ? 'done' : 'pending'}`} />
                        {item.type}
                        {item.color ? ` (${item.color})` : ''}
                      </td>
                      <td>{item.size}</td>
                      <td style={{ textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ color: isDone ? 'var(--accent)' : 'var(--warn)', fontSize: 12 }}>
                        {isDone ? '✅ Lavé' : '⏳ En attente'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* CLIENT only sees their OWN financial info — no owner totals */}
            <div className="client-total-box">
              <div className="client-total-row main">
                <span>Total à payer</span>
                <span>{fmtMoney(total)}</span>
              </div>
              {paid > 0 && (
                <div className="client-total-row paid-ok">
                  <span>Déjà payé</span>
                  <span>{fmtMoney(paid)}</span>
                </div>
              )}
              {due > 0 ? (
                <div className="client-total-row due">
                  <span>Reste à payer</span>
                  <span>{fmtMoney(due)}</span>
                </div>
              ) : (
                <div className="client-total-row paid-ok">
                  <span>✅ Entièrement payé</span>
                  <span></span>
                </div>
              )}
              <div className="client-pickup">
                📅 Retrait estimé : <strong>{fmtDate(order.pickup)}</strong> · Dépôt : {fmtDate(order.deposited)}
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <button className="action-btn" onClick={() => onReceipt(order.id)}>
                🧾 Mon reçu
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
