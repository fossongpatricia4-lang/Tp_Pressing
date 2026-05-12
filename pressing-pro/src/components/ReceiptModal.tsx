import React from 'react';
import { Order } from '../types';
import { washStatus, payStatus, orderTotal, orderPaid, orderDue, fmtMoney, fmtDate } from '../hooks/useOrders';

interface Props {
  order: Order;
  isOwner: boolean;  // owner sees full payment history; client sees only their own amounts
  onClose: () => void;
}

export default function ReceiptModal({ order, isOwner, onClose }: Props) {
  const ws = washStatus(order);
  const ps = payStatus(order);
  const total = orderTotal(order);
  const paid = orderPaid(order);
  const due = orderDue(order);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>🧾 Reçu client</h2></div>
        <div className="modal-body">
          <div className="receipt">
            <div className="receipt-logo">🧺 Pressing Pro</div>
            <div className="receipt-id">{order.id}</div>
            <hr className="receipt-divider" />
            <div className="receipt-row"><span>Client</span><span><strong>{order.client}</strong></span></div>
            <div className="receipt-row"><span>Dépôt</span><span>{fmtDate(order.deposited)}</span></div>
            <div className="receipt-row"><span>Retrait estimé</span><span><strong>{fmtDate(order.pickup)}</strong></span></div>
            {order.notes && <div className="receipt-row"><span>Notes</span><span>{order.notes}</span></div>}
            <hr className="receipt-divider" />
            <div className="receipt-hd">Articles</div>
            {order.items.map((item, i) => (
              <div key={i} className="receipt-row">
                <span>{item.qty}× {item.type} taille {item.size}{item.color ? ` (${item.color})` : ''}</span>
                <span>{fmtMoney(item.unitPrice)} × {item.qty} = <strong>{fmtMoney(item.unitPrice * item.qty)}</strong></span>
              </div>
            ))}
            <hr className="receipt-divider" />
            <div className="receipt-total"><span>TOTAL</span><span>{fmtMoney(total)}</span></div>
            <div className="receipt-paid"><span>Payé</span><span>{fmtMoney(paid)}</span></div>
            {due > 0 && <div className="receipt-due"><span>Reste à payer</span><span>{fmtMoney(due)}</span></div>}
            {/* Payment history only shown to owner */}
            {isOwner && (order.payments || []).length > 0 && (
              <>
                <hr className="receipt-divider" />
                <div className="receipt-hd">Historique paiements</div>
                {order.payments.map((p, i) => (
                  <div key={i} className="receipt-row">
                    <span>{fmtDate(p.date)} · {p.method}</span>
                    <span>{fmtMoney(p.amount)}</span>
                  </div>
                ))}
              </>
            )}
            <hr className="receipt-divider" />
            <div className="receipt-stamp">
              Lavage: {ws === 'complete' ? '✅ Complet' : ws === 'incomplete' ? '⚠ Incomplet' : '⏳ En attente'}
            </div>
            <div className="receipt-stamp">
              Paiement: {ps === 'paid' ? '✅ Soldé' : ps === 'partial-pay' ? '💛 Acompte versé' : '❌ Non soldé'}
            </div>
            <div className="receipt-stamp" style={{ marginTop: 6 }}>Merci pour votre confiance !</div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={() => window.print()}>🖨 Imprimer</button>
          <button className="submit-btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
